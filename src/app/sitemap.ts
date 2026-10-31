import type { MetadataRoute } from "next";
import { chairs } from "@/data/chairs";
import { looks } from "@/data/looks";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/chairs", "/looks", "/plan", "/quiz", "/quote", "/blog", "/about", "/faq", "/privacy", "/terms"].map((p) => ({
    url: `${site.url}${p}`,
  }));
  const chairPages = chairs.map((c) => ({ url: `${site.url}/chairs/${c.slug}` }));
  const lookPages = looks.map((l) => ({ url: `${site.url}/looks/${l.slug}` }));
  const posts = (await getPosts()).map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date }));
  return [...pages, ...chairPages, ...lookPages, ...posts];
}
