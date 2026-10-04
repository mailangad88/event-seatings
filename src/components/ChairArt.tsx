import Image from "next/image";
import type { Chair } from "@/data/chairs";
import { ChairDrawing } from "./chair-drawings";
import { StudioBackdrop, chairTint } from "./studio";

// Line-art placeholders for each chair family. Replaced automatically by a real
// photo once `image` is set on the chair in src/data/chairs.ts.

export { chairTint };

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
    <StudioBackdrop tint={chairTint(chair.slug)} floor={77} className={className}>
      <ChairDrawing
        silhouette={chair.silhouette}
        fill={fill}
        role="img"
        aria-label={`Illustration of the ${chair.name}`}
        className="h-[72%] w-auto -translate-y-[6%] text-[#2a241e]"
        strokeWidth={1.7}
      />
    </StudioBackdrop>
  );
}
