import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ChairArt } from "@/components/ChairArt";
import { getCategory, type CategoryId } from "@/data/catalog-products";
import { getChair } from "@/data/chairs";
import { isPhotoFirst, photosForItem, stockAlt } from "@/data/stock-photos";
import { similarPhoto } from "@/data/similar-photo";
import { readImageManifest } from "@/lib/image-manifest";
import { site } from "@/lib/site";
import { RentalIcon } from "./RentalIcon";
import { ExampleChip, StockImg } from "./StockPhoto";

// Picks the best visual for a rental item, in order (items in `photoFirst` skip straight to 3):
// 1. the styled event scene (Gemini, scripts/styled-scenes.py) or else the 3D render at public/rentals/<category folder>/<id>.webp (from the render pipeline),
// 2. the chair render/illustration from the chair collection,
// 3. a real photo of the same item type at an event (Unsplash, labelled "Example photo"),
// 4. a styled category illustration.
// Runs on the server at build time, so a render appears as soon as the file is committed.

// Render manifest with the Gemini styled event scenes laid over it (see src/lib/image-manifest.ts).
const readManifest = readImageManifest;

const exists = (rel: string) => fs.existsSync(path.join(process.cwd(), "public", rel));

export function rentalImagePath(id: string, category: CategoryId) {
  const fromManifest = readManifest()[id]?.src;
  if (fromManifest && exists(fromManifest)) return fromManifest;
  const folder = getCategory(category)?.imageFolder ?? category;
  const rel = `/rentals/${folder}/${id}.webp`;
  return exists(rel) ? rel : undefined;
}

/** Alt text for a similar item's photo standing in for a catalog row. */
export const similarAlt = (img: { alt: string }, itemName: string) => `Similar item to ${itemName}: ${img.alt.charAt(0).toLowerCase()}${img.alt.slice(1)}`;

export const rentalAlt = (name: string, specs: string, id?: string) =>
  (id && readManifest()[id]?.alt) || `${name} for rent in ${site.market} and the suburbs (${specs})`;

export function RentalVisual({
  item,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
  photoWidth = 480,
}: {
  item: { id: string; name: string; specs: string; categoryId: CategoryId; chairSlug?: string; section?: string };
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Display width in CSS pixels for real photos (they are served from Unsplash's CDN at this size). */
  photoWidth?: number;
}) {
  // Photo-first items skip the plain render, but a styled event scene beats a stock photo.
  const photoFirst = isPhotoFirst(item.id) && !readManifest()[item.id]?.ai;
  const src = photoFirst ? undefined : rentalImagePath(item.id, item.categoryId);
  const alt = rentalAlt(item.name, item.specs, item.id);
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }
  // No photo of its own: the studio photo of the same kind of piece from the featured range, labelled.
  const similar = similarPhoto(item);
  if (similar) {
    return (
      <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
        <Image src={similar.src} alt={similarAlt(similar, item.name)} fill priority={priority} sizes={sizes} className="object-cover" />
        <ExampleChip label="Similar item" />
      </div>
    );
  }
  const chair = item.chairSlug ? getChair(item.chairSlug) : undefined;
  if (chair) return <ChairArt chair={chair} className={className} priority={priority} />;
  // Only a photo of the same item type; a general category photo would misrepresent the item.
  const { photos, matched } = photosForItem(item);
  if (matched) {
    return (
      <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
        <StockImg photo={photos[0]} alt={stockAlt(photos[0], item.name, true, site.market)} width={photoWidth} priority={priority} />
        <ExampleChip />
      </div>
    );
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-surface-2 text-gold ${className}`}
      style={{ backgroundImage: "radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--gold) 14%, transparent), transparent 65%)" }}
    >
      <RentalIcon category={item.categoryId} title={`Illustration: ${alt}`} className="h-1/2 w-1/2" />
    </div>
  );
}
