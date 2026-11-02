import type { MetadataRoute } from "next";
import { chairImage, chairs, getChair } from "@/data/chairs";
import { getPosts, topicSlug, topics } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const priority: Record<string, number> = { "": 1, "/chairs": 0.9, "/book": 0.9, "/quote": 0.8, "/faq": 0.7 };
  const pages = ["", "/chairs", "/book", "/quote", "/faq", "/how-it-works", "/quiz", "/blog", "/about", "/privacy", "/terms"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: priority[p] ?? 0.5,
  }));
  // Image entries help Google Images and AI search find every chair photo.
  const img = (slug: string) => {
    const c = getChair(slug);
    const src = c && chairImage(c);
    return src ? [`${site.url}${src}`] : [];
  };
  const chairPages = chairs.map((c) => ({ url: `${site.url}/chairs/${c.slug}`, priority: 0.8, images: img(c.slug) }));
  const all = await getPosts();
  const posts = all.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: p.updated ?? p.date,
    images: p.image ? [`${site.url}${p.image}`] : img(p.chair),
  }));
  const hubs = topics
    .filter((t) => all.some((p) => p.topic === t.name))
    .map((t) => ({ url: `${site.url}/blog/topic/${topicSlug(t.name)}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...pages, ...chairPages, ...hubs, ...posts];
}
