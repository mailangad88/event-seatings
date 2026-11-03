import "server-only";
import { promises as fs } from "fs";
import path from "path";
import MiniSearch from "minisearch";
import { answerTopics } from "@/data/answers";
import { ideaPath, ideas, partyTypes, typePath } from "@/data/party-ideas";

// Full-text search over the site's own guides (content/blog) and the /answers hub, used by the planning
// assistant. MiniSearch (MIT) runs in memory; the index is built once per server instance on first use.
// Every result links back to the page it came from, so answers are always sourced from our own content.

export type Passage = { id: string; url: string; title: string; heading?: string; text: string };
export type Hit = Passage & { score: number };

const dir = path.join(process.cwd(), "content", "blog");
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

const clean = (s: string) =>
  s
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function passages(): Promise<Passage[]> {
  const out: Passage[] = [];
  const files = (await fs.readdir(dir).catch(() => [] as string[])).filter((f) => f.endsWith(".md"));
  await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      const meta: Record<string, string> = {};
      for (const line of (m?.[1] ?? "").split("\n")) {
        const i = line.indexOf(":");
        if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
      }
      if ((meta.date ?? "") > today()) return; // scheduled posts stay hidden
      const slug = file.replace(/\.md$/, "");
      const url = `/blog/${slug}`;
      const title = meta.title ?? slug;
      out.push({ id: `${slug}#0`, url, title, text: meta.description ?? "" });
      // One passage per ## or ### section, capped so a long section doesn't swamp the index.
      const sections = (m?.[2] ?? raw).split(/\n(?=#{2,3} )/);
      sections.forEach((sec, i) => {
        const h = sec.match(/^#{2,3} (.+)/);
        const text = clean(h ? sec.slice(h[0].length) : sec).slice(0, 900);
        if (text.length < 40) return;
        out.push({ id: `${slug}#${i + 1}`, url, title, heading: h ? clean(h[1]) : undefined, text });
      });
    }),
  );
  for (const t of answerTopics)
    t.answers.forEach((a, i) => out.push({ id: `answers-${t.id}-${i}`, url: a.link?.href ?? `/answers#${t.id}`, title: t.title, heading: a.q, text: a.a }));
  // Party ideas: each type's FAQs and setups, and each theme's summary.
  for (const t of partyTypes) {
    t.faqs.forEach((f, i) => out.push({ id: `party-${t.slug}-faq-${i}`, url: typePath(t.slug), title: `${t.name} ideas`, heading: f.q, text: f.a }));
    t.setups.forEach((x, i) => out.push({ id: `party-${t.slug}-setup-${i}`, url: typePath(t.slug), title: `${t.name} ideas`, heading: `${x.title} (${x.where})`, text: x.text }));
  }
  for (const idea of ideas) out.push({ id: `idea-${idea.slug}`, url: ideaPath(idea), title: idea.name, heading: idea.tagline, text: idea.summary });
  return out;
}

let index: Promise<{ search: MiniSearch<Passage>; byId: Map<string, Passage> }> | null = null;

function build() {
  index ??= passages().then((docs) => {
    const search = new MiniSearch<Passage>({
      fields: ["title", "heading", "text"],
      storeFields: ["id"],
      searchOptions: { boost: { title: 2, heading: 2.5 }, prefix: true, fuzzy: 0.15, combineWith: "OR" },
    });
    search.addAll(docs);
    return { search, byId: new Map(docs.map((d) => [d.id, d])) };
  });
  return index;
}

const stop = new Set("a an and are as at be can do does for from how i in is it my of on or our should the to we what when where which who why will with you your".split(" "));

/** The best passages for a question, at most one per page. */
export async function searchGuides(query: string, limit = 4, mode: "OR" | "AND" = "OR"): Promise<Hit[]> {
  const q = query
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter((w) => w.length > 1 && !stop.has(w))
    .join(" ");
  if (!q) return [];
  const { search, byId } = await build();
  const seen = new Set<string>();
  const hits: Hit[] = [];
  for (const r of search.search(q, { combineWith: mode })) {
    const p = byId.get(r.id as string);
    if (!p || seen.has(p.url)) continue;
    seen.add(p.url);
    hits.push({ ...p, score: r.score });
    if (hits.length >= limit) break;
  }
  return hits;
}

/** The first two sentences of a passage, for a short extractive answer. */
export function snippet(text: string, max = 320) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = "";
  for (const s of sentences) {
    if ((out + s).length > max && out) break;
    out += s;
    if (out.length > max * 0.6) break;
  }
  return out.trim().slice(0, max + 40);
}
