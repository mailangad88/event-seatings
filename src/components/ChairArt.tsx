import Image from "next/image";
import { chairAlt, chairImage, type Chair } from "@/data/chairs";
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
  const src = chairImage(chair);
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ background: chairTint(chair.slug) }}>
        <Image
          src={src}
          alt={chairAlt(chair)}
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
        aria-label={`Illustration of the ${chairAlt(chair)}`}
        className="h-[72%] w-auto -translate-y-[6%] text-[#efe4cf]"
        strokeWidth={1.7}
      />
    </StudioBackdrop>
  );
}
