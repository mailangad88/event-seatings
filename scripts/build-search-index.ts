// Builds public/search-index.json: a small, build-time index of every public page, used by
// src/app/search/page.tsx and the header search box. Each entry is just {url, title, text, type}
// (no vendor names, no prices) so the file stays small even with ~7,600 pages. Run automatically
// before every build (npm prebuild); run `npx tsx scripts/build-search-index.ts` after adding
// content if you need it sooner.
import { promises as fs } from "node:fs";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { catalogItems, categories, canonicalItem } from "../src/data/catalog";
import { chairs } from "../src/data/chairs";
import { venues, venuePath } from "../src/data/venues";
import { locations, eventTypes, locationPath, eventPath } from "../src/data/geo";
import { localAreas, costCategories, areaRentalsPath, costPath, localCategories, localCategoryPath } from "../src/data/local-rentals";
import { priceComparisonPagesEnabled } from "../src/lib/price-pages";
import { ideas, partyTypes, ideaPath, typePath } from "../src/data/party-ideas";
import { looks } from "../src/data/looks";
import { families } from "../src/lib/guide-content";
import { downloads } from "../src/data/downloads";
import { answerTopics } from "../src/data/answers";
import { buyerPages } from "../src/data/buyer-pages";
import { tools } from "../src/data/tools";
import { comparisons, comparisonPath } from "../src/data/comparisons";

export type SearchEntry = { url: string; title: string; text: string; type: string };

const trim = (s: string | undefined, max = 160) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Lightweight read of content/blog frontmatter only (title, description, date), avoiding
// src/lib/blog.ts, which is marked "server-only" and also fetches from Sanity at build time.
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
async function blogPosts(): Promise<{ slug: string; title: string; description: string }[]> {
  const dir = path.join(process.cwd(), "content", "blog");
  const files = (await fs.readdir(dir).catch(() => [] as string[])).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      const meta: Record<string, string> = {};
      for (const line of (m?.[1] ?? "").split("\n")) {
        const i = line.indexOf(":");
        if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
      }
      return { slug: file.replace(/\.md$/, ""), title: meta.title ?? "", description: meta.description ?? "", date: meta.date ?? "" };
    }),
  );
  return posts.filter((p) => p.date && p.date <= today());
}

async function build(): Promise<SearchEntry[]> {
  const out: SearchEntry[] = [];
  const add = (url: string, title: string, text: string, type: string) => {
    if (!title) return;
    out.push({ url, title: trim(title, 90), text: trim(text), type });
  };

  // A handful of key static pages people might type the name of.
  add("/", "Beyond Chiavari", "Every event rental in Chicago, one quote.", "page");
  add("/rentals", "All rentals", "Browse every category of event rental we offer in Chicago.", "page");
  add("/quote", "Build a quote", "Pick items and see prices as you go.", "page");
  add("/book", "Book a call", "Talk through your event and get help picking rentals.", "page");
  add("/faq", "FAQ", "Answers to common questions about booking event rentals.", "page");
  add("/how-it-works", "How it works", "How booking and delivery works, start to finish.", "page");
  add("/pricing", "Pricing", "How our pricing works, no hidden fees.", "page");
  add("/venues", "Venue guides", "Chicago-area venues that don't supply furniture, and what to rent.", "page");
  add("/party-ideas", "Party ideas", "Ideas and setups for every kind of event.", "page");
  add("/ideas", "Idea board", "Save looks, ideas and rentals for your event.", "page");
  add("/downloads", "Free planning downloads", "Free checklists and spreadsheets for planning your event.", "page");
  add("/glossary", "Glossary", "Plain-English definitions of event rental terms.", "page");
  add("/compare", "Compare rentals", "Side-by-side comparisons to help you choose.", "page");
  add("/party-rentals", "Party rentals by area", "Event rental pricing and tips for your part of Chicago.", "page");
  if (priceComparisonPagesEnabled()) add("/rental-cost", "Rental cost guides", "What things cost to rent in Chicago, and what changes the price.", "page");
  add("/big-celebrations", "Big celebrations", "Rentals for large weddings, galas and milestone events.", "page");
  add("/venues-and-planners", "Venues & planners", "Information for venues and planners who refer us work.", "page");
  add("/answers", "Answers", "Quick answers to common event-planning questions.", "page");
  add("/tools", "Free tools", "Calculators and planning tools for your event.", "page");
  add("/blog", "Blog", "Planning guides and tips for Chicago events.", "page");

  // Rentals: category hubs, then each item (once per canonical item, skipping variants).
  for (const c of categories) add(`/rentals/${c.id}`, c.name, c.blurb, "rental category");
  for (const i of catalogItems) {
    if (canonicalItem(i) !== i) continue;
    add(`/rentals/${i.categoryId}/${i.id}`, i.name, i.description, "rental");
  }

  // Chairs.
  for (const c of chairs) add(`/chairs/${c.slug}`, c.name, c.description, "chair");

  // Blog posts.
  for (const p of await blogPosts()) add(`/blog/${p.slug}`, p.title, p.description, "blog post");

  // Venue guides.
  for (const v of venues) add(venuePath(v), v.name, `${v.neighborhoodOrCity}: ${v.whyFit}`, "venue");

  // Chicago-area and event-type landing pages.
  for (const l of locations) add(locationPath(l), l.name, l.metaDescription, "area");
  for (const e of eventTypes) add(eventPath(e), e.name, e.metaDescription, "event type");

  // "[item] rental [area]" and "[item] rental cost" local pages.
  for (const l of localAreas) add(areaRentalsPath(l.slug), `Party rentals in ${l.name}`, l.metaDescription, "area");
  for (const l of localAreas)
    for (const c of localCategories.filter((c) => !c.thin)) add(localCategoryPath(l.slug, c), `${c.label} in ${l.name}`, c.sizingNote, "rental category");
  if (priceComparisonPagesEnabled()) for (const c of costCategories) add(costPath(c.id), c.question, c.drivers[0]?.body, "cost guide");

  // Party ideas.
  for (const t of partyTypes) add(typePath(t.slug), t.metaTitle, t.metaDescription, "party ideas");
  for (const i of ideas) add(ideaPath(i), i.name, i.summary, "party ideas");

  // Styled looks.
  for (const l of looks) add(`/looks/${l.slug}`, l.name, l.name, "look");

  // Planning guides (seating layouts, room size, comparisons, cost, fit, table seating, seasons).
  for (const f of families) {
    add(f.base, f.hubTitle, f.hubDescription, "guide");
    for (const slug of f.slugs()) {
      const props = f.build(slug);
      if (props) add(`${f.base}/${slug}`, props.title, props.description, "guide");
    }
  }

  // Free downloads, "answers" hub, buyer guides, calculators and item comparisons.
  for (const d of downloads) add(`/downloads/${d.slug}`, d.title, d.description, "download");
  for (const t of answerTopics) add(`/answers#${t.id}`, t.title, t.answers[0]?.a, "answer");
  for (const b of buyerPages) add(`/${b.kind}/${b.slug}`, b.title, b.description, "guide");
  for (const t of tools) add(`/tools/${t.slug}`, t.name, t.name, "tool");
  for (const c of comparisons) add(comparisonPath(c), c.title, c.title, "comparison");

  // One entry per URL: keep the first (most specific/important source wins).
  const seen = new Set<string>();
  return out.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));
}

build().then((entries) => {
  const file = path.join(process.cwd(), "public", "search-index.json");
  writeFileSync(file, JSON.stringify(entries));
  console.log(`search-index: ${entries.length} pages indexed -> ${path.relative(process.cwd(), file)}`);
});
