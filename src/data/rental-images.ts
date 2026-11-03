import images from "./rental-images.json";
import styled from "./styled-images.json";
import { site } from "@/lib/site";

// Photorealistic product and event-scene images built in Blender (see blender/rentals/README.md): real HDRI
// lighting, photo-scanned floors and lawns, depth of field and a camera finish. Product shots are 1:1
// (room, linen tabletop or park lawn sets); scenes are 16:9 at 1920x1080.
// Slugs match the catalog item ids. Regenerate with `python blender/rentals/publish.py`.

export type RentalImage = {
  src: string;
  category: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  kind: "product" | "scene" | "angle" | "variant" | "solo";
  /** Where it's pictured: room, table, park, park-dusk, scene, or classic (older studio-sweep render). */
  setting?: string;
  // Angles and colour variants point at the base item they belong to.
  parent?: string;
  variant?: string;
  /** True when this is a Gemini styled event scene (scripts/styled-scenes.py) laid over the Blender render. */
  ai?: boolean;
};

// Styled event scenes made with Gemini from our own render as the reference (scripts/styled-scenes.py). Each one
// replaces the render with the same slug everywhere on the site, keeps its category/kind/parent, and is always
// marked as AI-made only in the machine-readable schema (IPTC digitalSourceType), per Angad on Nov 3.
// Styled-only entries (no render behind them, e.g. hero-concessions) are new event scenes.
type StyledEntry = Pick<RentalImage, "src" | "alt" | "caption" | "width" | "height" | "category"> & { kind?: string };
const styledAll = styled as Record<string, StyledEntry>;
const originals = images as Record<string, RentalImage>;
const all: Record<string, RentalImage> = Object.fromEntries([
  ...Object.entries(originals).map(([slug, img]) => {
    const s = styledAll[slug];
    return [slug, s ? { ...img, src: s.src, alt: s.alt, caption: s.caption, width: s.width, height: s.height, ai: true } : img];
  }),
  ...Object.entries(styledAll)
    .filter(([slug]) => !originals[slug])
    .map(([slug, s]) => [
      slug,
      { src: s.src, alt: s.alt, caption: s.caption, width: s.width, height: s.height, category: s.category, kind: s.kind === "solo" ? ("solo" as const) : ("scene" as const), ai: true },
    ]),
]);

/** The original Blender render, ignoring any styled scene laid over it. */
export const originalImage = (slug: string): RentalImage | undefined => originals[slug];

export function rentalImage(slug: string): RentalImage | undefined {
  return all[slug];
}

export const rentalImages = Object.entries(all).map(([slug, img]) => ({ slug, ...img }));
export const productImages = rentalImages.filter((i) => i.kind === "product");
export const sceneImages = rentalImages.filter((i) => i.kind === "scene");
// Second camera angles and colour/finish variants (slug "<parent>--<variant>").
export const extraImages = rentalImages.filter((i) => i.kind === "angle" || i.kind === "variant");

// Every image of one item: the main render first, then its colour variants, then the second angle.
export function imagesFor(slug: string) {
  const main = all[slug] ? [{ slug, ...all[slug] }] : [];
  const extras = extraImages
    .filter((i) => i.parent === slug)
    .sort((a, b) => (a.kind === b.kind ? a.slug.localeCompare(b.slug) : a.kind === "variant" ? -1 : 1));
  return [...main, ...extras];
}

// Human labels for the gallery and captions, in display order.
export const imageCategories: { id: string; label: string }[] = [
  { id: "chairs", label: "Chairs" },
  { id: "tables", label: "Tables" },
  { id: "linens", label: "Linens & chair covers" },
  { id: "tableware", label: "Dinnerware, flatware & glassware" },
  { id: "catering", label: "Catering & bar" },
  { id: "tents", label: "Tents" },
  { id: "floors", label: "Dance floors & staging" },
  { id: "lighting", label: "Lighting & drape" },
  { id: "heating", label: "Heating" },
  { id: "lounge", label: "Lounge furniture" },
  { id: "decor", label: "Decor" },
  { id: "photo-booths", label: "Photo booths" },
  { id: "concessions", label: "Concessions" },
  { id: "games", label: "Games & kids" },
  { id: "av", label: "AV & sound" },
  { id: "restrooms-power", label: "Restrooms & power" },
  { id: "fencing", label: "Fencing & crowd control" },
];

// Chair collection slugs (src/data/chairs.ts) that have a matching Blender render.
export const chairRenderSlug: Record<string, string> = {
  "cross-back": "crossback",
  ghost: "ghost",
  "rattan-garden": "rattan-garden",
  bentwood: "bentwood",
  wishbone: "wishbone",
  "velvet-dining": "velvet-dining",
  infinity: "infinity",
  "cane-back": "cane-back",
  windsor: "windsor",
  "louis-medallion": "louis-medallion",
  shell: "shell",
  "garden-folding": "garden-folding",
  "royal-throne": "throne-chair",
};

/** schema.org ImageObject for one of our own images, with the caption, alt description and licence details
 *  Google Images and AI search read. */
export function rentalImageJsonLd(img: Pick<RentalImage, "src" | "alt" | "caption" | "width" | "height"> & { ai?: boolean }) {
  const url = `${site.url}${img.src}`;
  return {
    "@type": "ImageObject",
    contentUrl: url,
    url,
    name: img.caption,
    caption: img.caption,
    description: img.alt,
    width: img.width,
    height: img.height,
    encodingFormat: "image/webp",
    creditText: site.name,
    creator: { "@type": "Organization", name: site.name },
    copyrightNotice: `© ${site.name}`,
    license: `${site.url}/terms`,
    acquireLicensePage: `${site.url}/terms`,
    ...(img.ai ? { digitalSourceType: "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia" } : {}),
  };
}


/** Single-piece styled shot of an item (`<slug>--solo`), if one exists. */
export const soloImage = (slug: string): RentalImage | undefined => all[`${slug}--solo`];

/** The styled event scene for a slug, if Gemini has made one. */
export const styledImage = (slug: string) => (styledAll[slug] ? all[slug] : undefined);
export const styledImages = rentalImages.filter((i) => i.ai);
