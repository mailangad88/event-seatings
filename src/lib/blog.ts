import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { marked } from "marked";

// Blog posts are Markdown files in /content/blog with a small header, e.g.
//
// ---
// title: Your title
// description: One-sentence summary for Google and the blog list
// date: 2026-10-05
// tags: Chiavari alternatives, Rustic
// image: /chairs/render/cross-back.jpg   (optional hero image, also used for sharing)
// imageAlt: Cross-back chairs at a long table  (optional)
// updated: 2026-11-02                    (optional "last updated" date)
// ---
//
// A "## Frequently asked questions" section with "### Question?" headings is
// turned into FAQPage structured data automatically, so Google and AI
// assistants can quote the answers.
//
// Posts dated in the future stay hidden until that day, so you can write a
// week of posts at once and they publish themselves one per day.

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingMinutes: number;
  image?: string;
  imageAlt?: string;
  updated?: string;
};

export type Faq = { q: string; a: string };

// Pulls question/answer pairs out of a "## Frequently asked questions" section.
function extractFaqs(body: string): Faq[] {
  const section = body.match(/^## Frequently asked questions\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1];
  if (!section) return [];
  return section
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const [q, ...rest] = chunk.split("\n");
      // The answer is the first paragraph under the question.
      const a = rest
        .join("\n")
        .trim()
        .split(/\n\s*\n/)[0]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return { q: q.trim(), a };
    })
    .filter((f) => f.q && f.a);
}

const dir = path.join(process.cwd(), "content", "blog");

function parse(file: string, raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  for (const line of (match?.[1] ?? "").split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  const body = match?.[2] ?? raw;
  const post: Post = {
    slug: file.replace(/\.md$/, ""),
    title: meta.title ?? file,
    description: meta.description ?? "",
    date: meta.date ?? "1970-01-01",
    tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 230)),
    image: meta.image || undefined,
    imageAlt: meta.imageAlt || undefined,
    updated: meta.updated || undefined,
  };
  return { post, body };
}

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

export async function getPosts(): Promise<Post[]> {
  const files = (await fs.readdir(dir).catch(() => [])).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (f) => parse(f, await fs.readFile(path.join(dir, f), "utf8")).post),
  );
  return posts.filter((p) => p.date <= today()).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const raw = await fs.readFile(path.join(dir, `${slug}.md`), "utf8").catch(() => null);
  if (!raw) return null;
  const { post, body } = parse(`${slug}.md`, raw);
  if (post.date > today()) return null;
  return { post, html: await marked.parse(body), faqs: extractFaqs(body) };
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
