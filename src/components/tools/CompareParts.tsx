import Image from "next/image";
import { rentalImage } from "@/data/rental-images";
import type { Side } from "@/data/comparisons";
import { sceneFor } from "@/lib/scenes";
import { formatPrice } from "@/components/ui";
import type { ToolPrice } from "./controls";

export function sideImage(s: Side) {
  const r = rentalImage(s.id);
  return r ? { src: r.src, alt: r.alt } : { src: sceneFor(s.id).src, alt: sceneFor(s.id).alt };
}

export function SideCard({ side, price, label }: { side: Side; price?: ToolPrice; label: string }) {
  const img = sideImage(side);
  return (
    <figure className="card overflow-hidden">
      <div className="media aspect-square rounded-none">
        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
      </div>
      <figcaption className="p-4">
        <span className="badge">{label}</span>
        <p className="mt-2 font-serif text-xl">{side.name}</p>
        {price && (
          <p className="mt-1 text-sm text-muted">
            From {formatPrice(price.price)} {price.unit}
            {price.estimated && " (estimate)"}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
