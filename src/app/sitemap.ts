import type { MetadataRoute } from "next";
import { rentalImagePath } from "@/components/rentals/RentalVisual";
import { catalogItems, categories, PRICES_CHECKED_AT } from "@/data/catalog";
import { chairImage, chairs, getChair } from "@/data/chairs";
import { getPosts } from "@/lib/blog";
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
  const posts = (await getPosts()).map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, images: img(p.chair) }));
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
  return [...pages, ...chairPages, ...rentalPages, ...posts];
}
