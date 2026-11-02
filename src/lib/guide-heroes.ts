import "server-only";
import { existsSync, readFileSync } from "fs";
import path from "path";

// Picks a distinct Blender render for each guide's hero, by keyword. Reads the render
// manifest (src/data/rental-images.json, from the rendering work) and only uses images
// whose file exists in public/, so guides keep their current art until renders land.

export type GuideHero = { src: string; alt: string; caption?: string; width?: number; height?: number };

type Render = GuideHero & { id: string; kind: string; category: string; strong: Set<string>; weak: Set<string> };
type PostInfo = { slug: string; title: string; keyword?: string; tags: string[]; topic: string };

const STOP = new Set(
  "a an and are at be by can do for from guide guides how i in is it many much my of on or rental rentals the to vs what when which with you your chicago event events".split(" "),
);
// Words too common in guide titles to say which image fits ("table" is in hundreds of titles).
const GENERIC = new Set("table chair tent linen glass plate light floor rental set setup party wedding cover".split(" "));
const stem = (w: string) => (w.length > 4 && w.endsWith("ies") ? w.slice(0, -3) + "y" : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)).map(stem);

// Topic hub -> manifest categories to fall back on when no keyword matches.
const topicCategories: Record<string, string[]> = {
  Chairs: ["chairs"],
  Tables: ["tables"],
  "Linens & Napkins": ["linens"],
  Dinnerware: ["tableware"],
  "Glassware & Bar": ["tableware", "catering"],
  Tents: ["tents"],
  "Lighting & Power": ["lighting"],
  "Dance Floors & Decor": ["floors", "decor"],
  "Catering Equipment": ["catering"],
  "Lounge & Specialty": ["lounge", "decor", "games"],
  "Seasons & Venues": ["tents", "heating"],
};

function loadRenders(): Render[] {
  let data: Record<string, Record<string, unknown>>;
  try {
    data = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/rental-images.json"), "utf8"));
  } catch {
    return [];
  }
  const out: Render[] = [];
  for (const [id, v] of Object.entries(data)) {
    const src = typeof v.src === "string" ? v.src : "";
    if (!src.startsWith("/") || !existsSync(path.join(process.cwd(), "public", src))) continue;
    const str = (k: string) => (typeof v[k] === "string" ? (v[k] as string) : "");
    out.push({
      id,
      src,
      alt: str("alt"),
      caption: str("caption") || undefined,
      width: typeof v.width === "number" ? v.width : undefined,
      height: typeof v.height === "number" ? v.height : undefined,
      kind: str("kind") || "product",
      category: str("category"),
      strong: new Set(words(`${id} ${str("parent")} ${str("variant")}`)),
      weak: new Set(words(`${str("caption")} ${str("category")}`)),
    });
  }
  return out;
}

function score(r: Render, title: Set<string>, all: Set<string>) {
  let s = 0;
  for (const w of r.strong) if (!GENERIC.has(w) && all.has(w)) s += title.has(w) ? 3 : 2;
  for (const w of r.weak) if (!GENERIC.has(w) && all.has(w) && !r.strong.has(w)) s += 0.5;
  // A matching colour variant is the most specific image there is.
  if (r.kind === "variant" && [...r.strong].some((w) => !GENERIC.has(w) && title.has(w))) s += 1;
  if (r.kind === "scene") s += 0.25;
  return s;
}

/** Assigns one hero per guide, spreading renders so neighbouring guides rarely repeat. */
export function assignHeroes(posts: PostInfo[]): Map<string, GuideHero> {
  const renders = loadRenders();
  const result = new Map<string, GuideHero>();
  if (!renders.length) return result;
  const uses = new Map<string, number>();
  const ordered = [...posts].sort((a, b) => a.topic.localeCompare(b.topic) || a.slug.localeCompare(b.slug));
  let previous = "";
  for (const p of ordered) {
    const title = new Set(words(`${p.title} ${p.keyword ?? ""}`));
    const all = new Set([...title, ...words(`${p.slug} ${p.tags.join(" ")}`)]);
    const cats = topicCategories[p.topic] ?? [];
    let best: Render | undefined;
    let bestScore = 0;
    for (const r of renders) {
      if (r.id === previous) continue;
      const base = score(r, title, all) + (cats.includes(r.category) ? 0.75 : 0);
      if (base < 0.75) continue;
      const s = base - 0.4 * (uses.get(r.id) ?? 0);
      if (!best || s > bestScore) [best, bestScore] = [r, s];
    }
    if (!best) continue;
    uses.set(best.id, (uses.get(best.id) ?? 0) + 1);
    previous = best.id;
    result.set(p.slug, { src: best.src, alt: best.alt, caption: best.caption, width: best.width, height: best.height });
  }
  return result;
}
