import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ChairArt } from "@/components/ChairArt";
import { getCategory, type CategoryId } from "@/data/catalog-products";
import { getChair } from "@/data/chairs";
import { site } from "@/lib/site";
import { RentalIcon } from "./RentalIcon";

// Picks the best visual for a rental item, in order:
// 1. the 3D render at public/rentals/<category folder>/<id>.webp (from the render pipeline),
// 2. the chair render/illustration from the chair collection,
// 3. a styled category illustration.
// Runs on the server at build time, so a render appears as soon as the file is committed.

export function rentalImagePath(id: string, category: CategoryId) {
  const folder = getCategory(category)?.imageFolder ?? category;
  const rel = `/rentals/${folder}/${id}.webp`;
  return fs.existsSync(path.join(process.cwd(), "public", rel)) ? rel : undefined;
}

export const rentalAlt = (name: string, specs: string) =>
  `${name} for rent in ${site.market} and the suburbs (${specs})`;

export function RentalVisual({
  item,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  item: { id: string; name: string; specs: string; categoryId: CategoryId; chairSlug?: string };
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const src = rentalImagePath(item.id, item.categoryId);
  const alt = rentalAlt(item.name, item.specs);
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-[#efe9df] ${className}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }
  const chair = item.chairSlug ? getChair(item.chairSlug) : undefined;
  if (chair) return <ChairArt chair={chair} className={className} priority={priority} />;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-surface-2 text-gold ${className}`}
      style={{ backgroundImage: "radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--gold) 14%, transparent), transparent 65%)" }}
    >
      <RentalIcon category={item.categoryId} title={`Illustration: ${alt}`} className="h-1/2 w-1/2" />
    </div>
  );
}
