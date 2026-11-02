import type { MetadataRoute } from "next";
import { rentalImagePath } from "@/components/rentals/RentalVisual";
import { catalogItems, categories, PRICES_CHECKED_AT } from "@/data/catalog";
import { chairImage, chairs, getChair } from "@/data/chairs";
import { eventPath, eventTypes, geoContentUpdated, locationPath, locations } from "@/data/geo";
import { rentalImages } from "@/data/rental-images";
import { getPosts, topicSlug, topics } from "@/lib/blog";
import { looks } from "@/data/looks";
import { coverImage, downloads } from "@/data/downloads";
import { families } from "@/lib/guide-content";
import { GUIDES_UPDATED } from "@/lib/planning";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const priority: Record<string, number> = { "": 1, "/chairs": 0.9, "/book": 0.9, "/quote": 0.8, "/faq": 0.7 };
  const pages = ["", "/chairs", "/book", "/quote", "/faq", "/how-it-works", "/booking-promise", "/partners", "/looks", "/quiz", "/seating-planner", "/answers", "/tools", "/tools/seating-readiness", "/downloads", "/blog", "/about", "/privacy", "/terms", "/photo-credits"].map((p) => ({
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
  const downloadPages = downloads.map((d) => ({ url: `${site.url}/downloads/${d.slug}`, priority: 0.8, images: [`${site.url}${coverImage(d.slug)}`] }));
  const hubs = topics
    .filter((t) => all.some((p) => p.topic === t.name))
    .map((t) => ({ url: `${site.url}/blog/topic/${topicSlug(t.name)}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  const rentalPages = [
    { url: `${site.url}/rentals`, priority: 0.9, lastModified: PRICES_CHECKED_AT },
    ...categories.map((c) => ({ url: `${site.url}/rentals/${c.id}`, priority: 0.85, lastModified: PRICES_CHECKED_AT })),
    ...catalogItems.map((i) => {
      const src = rentalImagePath(i.id, i.categoryId);
      return {
        url: `${site.url}/rentals/${i.categoryId}/${i.id}`,
        priority: 0.7,
        lastModified: i.priceCheckedAt,
        images: src ? [`${site.url}${src}`] : i.chairSlug ? img(i.chairSlug) : [],
      };
    }),
  ];
  const gallery = { url: `${site.url}/gallery`, priority: 0.7, images: rentalImages.map((i) => `${site.url}${i.src}`) };
  const geoPages = [
    { url: `${site.url}/chair-rentals`, priority: 0.8, lastModified: geoContentUpdated },
    { url: `${site.url}/events`, priority: 0.8, lastModified: geoContentUpdated },
    ...locations.map((l) => ({ url: `${site.url}${locationPath(l)}`, priority: 0.7, lastModified: geoContentUpdated })),
    ...eventTypes.map((e) => ({ url: `${site.url}${eventPath(e)}`, priority: 0.7, lastModified: geoContentUpdated })),
  ];
  const guidePages = families.flatMap((f) => [
    { url: `${site.url}${f.base}`, lastModified: GUIDES_UPDATED, priority: 0.7 },
    ...f.slugs().map((s) => ({ url: `${site.url}${f.base}/${s}`, lastModified: GUIDES_UPDATED, priority: 0.5 })),
  ]);
  const lookPages = looks.map((l) => ({ url: `${site.url}/looks/${l.slug}`, priority: 0.8, images: img(l.heroChair) }));
  return [...pages, gallery, ...lookPages, ...geoPages, ...guidePages, ...chairPages, ...rentalPages, ...hubs, ...posts, ...downloadPages];
}
