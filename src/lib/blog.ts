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
// ---
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
};

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
  return { post, html: await marked.parse(body) };
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
