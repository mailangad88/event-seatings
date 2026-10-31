import type { MetadataRoute } from "next";
import { chairs } from "@/data/chairs";
import { eventPath, eventTypes, geoContentUpdated, locationPath, locations } from "@/data/geo";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/chairs", "/quiz", "/quote", "/blog", "/about", "/faq", "/privacy", "/terms"].map((p) => ({
    url: `${site.url}${p}`,
  }));
  const chairPages = chairs.map((c) => ({ url: `${site.url}/chairs/${c.slug}` }));
  const posts = (await getPosts()).map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date }));
  const geoPages = [
    { url: `${site.url}/chair-rentals`, lastModified: geoContentUpdated },
    { url: `${site.url}/events`, lastModified: geoContentUpdated },
    ...locations.map((l) => ({ url: `${site.url}${locationPath(l)}`, lastModified: geoContentUpdated })),
    ...eventTypes.map((e) => ({ url: `${site.url}${eventPath(e)}`, lastModified: geoContentUpdated })),
  ];
  return [...pages, ...chairPages, ...geoPages, ...posts];
}
