import { buyerPages } from "@/data/buyer-pages";
import type { MetadataRoute } from "next";
import { rentalImagePath } from "@/components/rentals/RentalVisual";
import { catalogItems, categories, PRICES_CHECKED_AT } from "@/data/catalog";
import { chairImage, chairs, getChair } from "@/data/chairs";
import { eventPath, eventTypes, geoContentUpdated, locationPath, locations } from "@/data/geo";
import { imagesFor, originalImage, rentalImages, soloImage, styledImage } from "@/data/rental-images";
import { categoryPhotos, isPhotoFirst, photosForItem, stockPhotos, stockSrc } from "@/data/stock-photos";
import { getPosts, topicSlug, topics } from "@/lib/blog";
import { looks } from "@/data/looks";
import { coverImage, downloads } from "@/data/downloads";
import { families } from "@/lib/guide-content";
import { GUIDES_UPDATED } from "@/lib/planning";
import { site } from "@/lib/site";
import { ideaPath, ideas, PARTY_IDEAS_UPDATED, partyTypes, typePath } from "@/data/party-ideas";
import { toolSitemapEntries } from "@/lib/tools/sitemap";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const priority: Record<string, number> = { "": 1, "/chairs": 0.9, "/book": 0.9, "/quote": 0.8, "/faq": 0.7 };
  const pages = ["", "/chairs", "/book", "/quote", "/faq", "/how-it-works", "/booking-promise", "/partners", "/vendor-listings", "/looks", "/quiz", "/seating-planner", "/answers", "/tools", "/tools/seating-readiness", "/tools/rental-calculator", "/solutions", "/compare", "/glossary", "/ideas", "/my-events", "/downloads", "/blog", "/about", "/privacy", "/terms"].map((p) => ({
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
  const buyer = buyerPages.map((p) => ({ url: `${site.url}/${p.kind}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 }));
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
    ...categories.map((c) => ({
      url: `${site.url}/rentals/${c.id}`,
      priority: 0.85,
      lastModified: PRICES_CHECKED_AT,
      // The category header and "real events" strip photos, then the item images shown in its grid.
      images: [
        ...categoryPhotos(c.id).slice(0, 4).map((p) => stockSrc(p, 1200, 800)),
        ...catalogItems
          .filter((i) => i.categoryId === c.id && (!isPhotoFirst(i.id) || !!styledImage(i.id)))
          .map((i) => rentalImagePath(i.id, i.categoryId))
          .filter((src): src is string => !!src)
          .map((src) => `${site.url}${src}`),
      ],
    })),
    ...catalogItems.map((i) => {
      // Every image on the item page: its own render (main, colour variants, second angle) unless a real
      // photo leads, the chair art, then the real event photos in its gallery.
      const own = isPhotoFirst(i.id) && !styledImage(i.id)
        ? []
        : imagesFor(i.id).length
          ? imagesFor(i.id).map((m) => `${site.url}${m.src}`)
          : [rentalImagePath(i.id, i.categoryId)].filter((src): src is string => !!src).map((src) => `${site.url}${src}`);
      const { photos, matched } = photosForItem(i);
      const gallery = (matched ? photos : categoryPhotos(i.categoryId)).slice(0, 3);
      return {
        url: `${site.url}/rentals/${i.categoryId}/${i.id}`,
        priority: 0.7,
        lastModified: i.priceCheckedAt,
        images: [
          ...own,
          ...(own.length || !i.chairSlug ? [] : img(i.chairSlug)),
          ...(soloImage(i.id) ? [`${site.url}${soloImage(i.id)!.src}`] : []),
          ...(styledImage(i.id) && originalImage(i.id) ? [`${site.url}${originalImage(i.id)!.src}`] : []),
          ...gallery.map((p) => stockSrc(p, 1200, 1200)),
        ],
      };
    }),
  ];
  const gallery = { url: `${site.url}/gallery`, priority: 0.7, images: rentalImages.map((i) => `${site.url}${i.src}`) };
  const credits = { url: `${site.url}/photo-credits`, priority: 0.3, images: Object.values(stockPhotos).map((p) => stockSrc(p, 1200, 800)) };
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
  // Party ideas: hub, one page per party type, one per theme (with its scene image).
  const sceneUrl = (s: string) => `${site.url}${styledImage(s)?.src ?? `/rentals/scenes/${s}.webp`}`;
  const ideaPages = [
    { url: `${site.url}/party-ideas`, priority: 0.8, lastModified: PARTY_IDEAS_UPDATED },
    ...partyTypes.map((t) => ({ url: `${site.url}${typePath(t.slug)}`, priority: 0.75, lastModified: PARTY_IDEAS_UPDATED, images: [sceneUrl(t.scene)] })),
    ...ideas.map((i) => ({ url: `${site.url}${ideaPath(i)}`, priority: 0.7, lastModified: PARTY_IDEAS_UPDATED, images: [sceneUrl(i.scene)] })),
  ];
  // Free tools, countdown, comparison and vendor onboarding pages (src/lib/tools/sitemap.ts).
  const toolPages = toolSitemapEntries(["/countdown"]);
  return [...pages, ...toolPages, ...buyer, ...ideaPages, gallery, credits, ...lookPages, ...geoPages, ...guidePages, ...chairPages, ...rentalPages, ...hubs, ...posts, ...downloadPages];
}
