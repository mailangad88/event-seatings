import type { MetadataRoute } from "next";
import { chairs } from "@/data/chairs";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
