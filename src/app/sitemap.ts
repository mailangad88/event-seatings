import type { MetadataRoute } from "next";
import { chairs } from "@/data/chairs";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/chairs", "/quiz", "/quote", "/blog", "/about", "/faq"].map((p) => ({
    url: `${site.url}${p}`,
  }));
  const chairPages = chairs.map((c) => ({ url: `${site.url}/chairs/${c.slug}` }));
  const posts = (await getPosts()).map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date }));
  return [...pages, ...chairPages, ...posts];
}
