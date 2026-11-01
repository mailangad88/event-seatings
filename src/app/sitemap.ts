import type { MetadataRoute } from "next";
import { chairs } from "@/data/chairs";
import { families } from "@/lib/guide-content";
import { GUIDES_UPDATED } from "@/lib/planning";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

// Split sitemaps: /sitemap/0.xml is the core site; each guide family gets its own file
// (/sitemap/1.xml, /sitemap/2.xml, ...). robots.txt lists every one of them.
export async function generateSitemaps() {
  return [{ id: 0 }, ...families.map((_, i) => ({ id: i + 1 }))];
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  if (id > 0) {
    const f = families[id - 1];
    if (!f) return [];
    return [
      { url: `${site.url}${f.base}`, lastModified: GUIDES_UPDATED, priority: 0.7 },
      ...f.slugs().map((s) => ({ url: `${site.url}${f.base}/${s}`, lastModified: GUIDES_UPDATED, changeFrequency: "monthly" as const, priority: 0.6 })),
    ];
  }
  const priority: Record<string, number> = { "": 1, "/chairs": 0.9, "/book": 0.9, "/quote": 0.8, "/faq": 0.7 };
  const pages = ["", "/chairs", "/book", "/quote", "/faq", "/quiz", "/blog", "/about", "/privacy", "/terms"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: priority[p] ?? 0.5,
  }));
  const chairPages = chairs.map((c) => ({ url: `${site.url}/chairs/${c.slug}`, priority: 0.8 }));
  const posts = (await getPosts()).map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date }));
  return [...pages, ...chairPages, ...posts];
}
