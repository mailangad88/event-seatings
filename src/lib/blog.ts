import "server-only";
import { existsSync, promises as fs } from "fs";
import { readImageManifest } from "./image-manifest";
import path from "path";
import { marked } from "marked";
import { chairs, getChair } from "@/data/chairs";
import { downloadForPost } from "@/data/downloads";
import { assignHeroes, type GuideHero } from "@/lib/guide-heroes";

// Blog posts are Markdown files in /content/blog with a small header, e.g.
//
// ---
// title: Your title
// description: One-sentence summary for Google and the blog list
// date: 2026-10-05
// tags: Chiavari alternatives, Rustic
// chair: cross-back            (optional: the chair image shown with the post)
// image: /blog/art/tables.svg   (optional hero art; used instead of the chair image)
// imageAlt: Round and banquet tables set for dinner   (alt text for `image`)
// keyword: table rental chicago (optional: the main search phrase the post targets)
// updated: 2026-11-02          (optional "last updated" date)
// ---
//
// The first tag is the post's topic (see `topics` below), which drives the
// /blog/topic/[topic] hub pages and the "Related guides" list on each post.
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
  /** Slug of the chair pictured with the post (from `chair:` or picked from the slug). */
  chair: string;
  readingMinutes: number;
  image?: string;
  imageAlt?: string;
  keyword?: string;
  updated?: string;
  /** Slug of the free download offered on this post (from `download:`, else matched in src/data/downloads.ts). */
  download?: string;
  /** The first tag: the topic hub the post belongs to. */
  topic: string;
  /** A 3D render picked for this guide by keyword (see src/lib/guide-heroes.ts), when one exists. */
  hero?: GuideHero;
};

export type Faq = { q: string; a: string };

// Topic hubs, in display order. A post joins a hub through its first tag.
export const topics = [
  { name: "Chairs", blurb: "Every chair style we rent, what it suits and how to style it." },
  { name: "Tables", blurb: "Round, banquet, farm, cocktail and kids tables: sizes, counts and layouts." },
  { name: "Linens & Napkins", blurb: "Tablecloth sizes, napkin folds, runners, overlays and color planning." },
  { name: "Dinnerware", blurb: "China, chargers and place settings for every menu and service style." },
  { name: "Glassware & Bar", blurb: "Glass counts, flatware, bar setups and beverage stations." },
  { name: "Tents", blurb: "Tent types, sizes, permits, sidewalls, flooring and weather plans." },
  { name: "Lighting & Power", blurb: "String lights, uplighting, generators, heaters, fans and AV." },
  { name: "Dance Floors & Decor", blurb: "Dance floors, stages, draping, arches, backdrops and aisle decor." },
  { name: "Catering Equipment", blurb: "Buffet setups, chafing dishes, beverage and food station rentals." },
  { name: "Lounge & Specialty", blurb: "Lounge furniture, photo booths, games, kids rentals and restroom trailers." },
  { name: "Weddings", blurb: "Rental planning for every part of the wedding weekend." },
  { name: "Cultural Celebrations", blurb: "Seating and rentals for the traditions celebrated across Chicagoland." },
  { name: "Parties", blurb: "Birthdays, showers, graduations, holidays and backyard parties." },
  { name: "Corporate & Nonprofit", blurb: "Galas, conferences, launches, picnics and fundraisers." },
  { name: "Chicago Planning", blurb: "Permits, buildings, parking and logistics for events in the city." },
  { name: "Suburb Guides", blurb: "Planning an event in the Chicago suburbs, town by town." },
  { name: "Budget & Booking", blurb: "Quotes, deposits, fees, contracts and how to book rentals well." },
  { name: "Layouts & Floor Plans", blurb: "Floor plans, spacing, capacity and seating charts by guest count." },
  { name: "Seasons & Venues", blurb: "Chicago weather month by month, and how to rent for each kind of venue." },
  { name: "Planning", blurb: "Seating guides, styling ideas and how-tos." },
] as const;

export function topicSlug(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Blender scene renders (from the rendering work) that replace each topic's illustrated art
// once the file exists in public/rentals/scenes/. Until then the SVG art is used.
const topicRenders: Record<string, string> = {
  chairs: "hero-chairs", tables: "hero-tables", "linens-and-napkins": "hero-linens", dinnerware: "hero-dinnerware",
  "glassware-and-bar": "hero-glassware", "catering-equipment": "hero-catering", "lounge-and-specialty": "hero-lounge",
  "dance-floors-and-decor": "hero-dance-decor", parties: "hero-parties", "cultural-celebrations": "hero-celebrations",
  "corporate-and-nonprofit": "hero-corporate", "layouts-and-floor-plans": "hero-layouts", weddings: "wedding-reception",
  tents: "tent-reception-dusk", "lighting-and-power": "cocktail-hour", "seasons-and-venues": "tent-reception-dusk",
  "chicago-planning": "garden-ceremony", planning: "garden-ceremony", "suburb-guides": "farm-table-dinner",
  "budget-and-booking": "hero-dinnerware",
};

/** Hero art for a topic: the styled event scene or Blender render when it exists, otherwise the illustrated SVG. */
export function topicArt(slug: string, fallbackAlt?: string): { src: string; alt: string; render: boolean } {
  const render = topicRenders[slug];
  const entry = render ? readImageManifest()[render] : undefined;
  if (entry && existsSync(path.join(process.cwd(), "public", entry.src))) {
    return { src: entry.src, alt: entry.alt ?? fallbackAlt ?? "", render: true };
  }
  return { src: `/blog/art/${slug}.svg`, alt: fallbackAlt ?? "", render: false };
}

export function getTopic(slug: string) {
  return topics.find((t) => topicSlug(t.name) === slug);
}

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
        .replace(/<[^>]+>/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return { q: q.trim(), a };
    })
    .filter((f) => f.q && f.a);
}

// Every post gets a visual: the chair named in its header, else one picked from its slug.
function pickChair(slug: string, named?: string) {
  if (named && getChair(named)) return named;
  const hit = chairs.find((c) => slug.includes(c.slug) || slug.includes(c.silhouette));
  if (hit) return hit.slug;
  const n = [...slug].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return chairs[n % chairs.length].slug;
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
    chair: pickChair(file.replace(/\.md$/, ""), meta.chair),
    readingMinutes: Math.max(1, Math.round(body.replace(/<svg[\s\S]*?<\/svg>/g, "").split(/\s+/).length / 230)),
    image: meta.image || undefined,
    imageAlt: meta.imageAlt || undefined,
    keyword: meta.keyword || undefined,
    updated: meta.updated || undefined,
    download: downloadForPost(file.replace(/\.md$/, ""), (meta.tags ?? "").split(","), meta.download || undefined).slug,
    topic: "",
  };
  const first = post.tags[0] ?? "";
  post.topic = topics.find((t) => t.name.toLowerCase() === first.toLowerCase())?.name ?? "Planning";
  const art = post.image?.match(/^\/blog\/art\/([a-z0-9-]+)\.svg$/);
  if (art) {
    const a = topicArt(art[1], post.imageAlt);
    post.image = a.src;
    post.imageAlt = a.render ? a.alt : post.imageAlt;
  }
  return { post, body };
}

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

let heroMap: Promise<Map<string, GuideHero>> | null = null;
function heroes(posts: Post[]) {
  heroMap ??= Promise.resolve(assignHeroes(posts));
  return heroMap;
}

function withHero(post: Post, map: Map<string, GuideHero>) {
  const hero = map.get(post.slug);
  if (hero) Object.assign(post, { hero, image: hero.src, imageAlt: hero.alt });
  return post;
}

async function readAll(): Promise<Post[]> {
  const files = (await fs.readdir(dir).catch(() => [])).filter((f) => f.endsWith(".md"));
  return Promise.all(files.map(async (f) => parse(f, await fs.readFile(path.join(dir, f), "utf8")).post));
}

export async function getPosts(): Promise<Post[]> {
  const posts = await readAll();
  const map = await heroes(posts);
  return posts
    .map((p) => withHero(p, map))
    .filter((p) => p.date <= today())
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const raw = await fs.readFile(path.join(dir, `${slug}.md`), "utf8").catch(() => null);
  if (!raw) return null;
  const { post, body } = parse(`${slug}.md`, raw);
  if (post.date > today()) return null;
  withHero(post, await heroes(await readAll()));
  // Scrollable tables must be keyboard-focusable (axe: scrollable-region-focusable).
  const html = (await marked.parse(body)).replace(
    /<div class="table-wrap">/g,
    '<div class="table-wrap" tabindex="0" role="region" aria-label="Scrollable table">',
  );
  return { post, html, faqs: extractFaqs(body) };
}

/** Up to `n` other posts from the same topic, then from shared tags. */
export async function getRelated(post: Post, n = 4) {
  const all = (await getPosts()).filter((p) => p.slug !== post.slug);
  const score = (p: Post) =>
    (p.topic === post.topic ? 10 : 0) + p.tags.filter((t) => post.tags.includes(t)).length;
  // A stable shuffle per post, so each post links to a different slice of its hub.
  const seed = (s: string) => [...(post.slug + s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return all
    .map((p) => ({ p, s: score(p), r: seed(p.slug) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.r - b.r)
    .slice(0, n)
    .map((x) => x.p);
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
