import Image from "next/image";
import { chairs, type Chair } from "@/data/chairs";
import { ChairDrawing } from "./chair-drawings";

// Line-art placeholders for each chair family. Replaced automatically by a real
// photo once `image` is set on the chair in src/data/chairs.ts.

// Quiet stone and linen backdrops, one per chair, so the grid reads like a lookbook.
const tints = ["#e8e0d3", "#ddd4c6", "#e4ddd5", "#d8d9cf", "#e7dcd3", "#d9cfc1"];
export function chairTint(slug: string) {
  const i = chairs.findIndex((c) => c.slug === slug);
  return tints[(i < 0 ? 0 : i) % tints.length];
}

export function ChairArt({
  chair,
  className = "",
  priority = false,
}: {
  chair: Chair;
  className?: string;
  priority?: boolean;
}) {
  if (chair.image) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ background: chairTint(chair.slug) }}>
        <Image
          src={chair.image}
          alt={chair.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
    );
  }
  const fill = chair.finishes[0]?.hex ?? "#c69c6d";
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ background: chairTint(chair.slug) }}>
      <ChairDrawing
        silhouette={chair.silhouette}
        fill={fill}
        role="img"
        aria-label={`Illustration of the ${chair.name}`}
        className="h-[72%] w-auto text-[var(--ink)]"
      />
    </div>
  );
}
