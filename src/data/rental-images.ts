import images from "./rental-images.json";

// 3D-rendered product and event-scene images (Blender, see blender/rentals/README.md).
// Product shots are 1:1 at 1600px on a warm #EFE9DF studio sweep; scenes are 16:9 at 1920x1080.
// Slugs match the catalog item ids. Regenerate with `python blender/rentals/publish.py`.

export type RentalImage = {
  src: string;
  category: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  kind: "product" | "scene";
};

const all = images as Record<string, RentalImage>;

export function rentalImage(slug: string): RentalImage | undefined {
  return all[slug];
}

export const rentalImages = Object.entries(all).map(([slug, img]) => ({ slug, ...img }));
export const productImages = rentalImages.filter((i) => i.kind === "product");
export const sceneImages = rentalImages.filter((i) => i.kind === "scene");

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
  { id: "decor", label: "Decor & photo booths" },
  { id: "games", label: "Games & kids" },
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
