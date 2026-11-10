import Image from "next/image";
import { rentalImage } from "@/data/rental-images";
import type { Side } from "@/data/comparisons";
import { sceneFor } from "@/lib/scenes";

export function sideImage(s: Side) {
  const r = rentalImage(s.id);
  return r ? { src: r.src, alt: r.alt } : { src: sceneFor(s.id).src, alt: sceneFor(s.id).alt };
}

// No price shown here (2026-11-09): this card is used to introduce the two options being
// compared, not to quote them. The exact price only shows once someone requests a quote.
export function SideCard({ side, label }: { side: Side; label: string }) {
  const img = sideImage(side);
  return (
    <figure className="card overflow-hidden">
      <div className="media aspect-square rounded-none">
        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
      </div>
      <figcaption className="p-4">
        <span className="badge">{label}</span>
        <p className="mt-2 font-heading font-semibold text-xl">{side.name}</p>
      </figcaption>
    </figure>
  );
}
