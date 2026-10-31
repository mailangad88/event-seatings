import Image from "next/image";
import { getChair } from "@/data/chairs";
import type { Look } from "@/data/looks";
import renders from "@/data/renders.json";

// A styled "set" for a decor look: the look's light and palette, with the hero chair
// framed in an arched window. Plays the look's video instead when one is supplied.
export function LookScene({
  look,
  priority = false,
  className = "",
  showPalette = true,
}: {
  look: Look;
  priority?: boolean;
  className?: string;
  showPalette?: boolean;
}) {
  const chair = getChair(look.heroChair);
  const src = chair?.image ?? (renders.includes(look.heroChair) ? `/chairs/render/${look.heroChair}.jpg` : undefined);
  const [glow, shade] = look.light;

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{ background: `radial-gradient(130% 90% at 50% 18%, ${glow} 0%, ${shade} 72%)` }}
    >
      {look.video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={look.video}
          poster={look.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${look.name} styled with the ${chair?.name ?? "featured chair"}`}
        />
      ) : (
        <>
          {/* candle-glow specks */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `radial-gradient(2px 2px at 14% 22%, ${look.palette[2].hex}, transparent),
                radial-gradient(1.5px 1.5px at 82% 16%, ${look.palette[0].hex}, transparent),
                radial-gradient(2px 2px at 70% 34%, ${look.palette[2].hex}, transparent),
                radial-gradient(1.5px 1.5px at 24% 44%, ${look.palette[0].hex}, transparent),
                radial-gradient(2px 2px at 90% 52%, ${look.palette[2].hex}, transparent),
                radial-gradient(1.5px 1.5px at 8% 64%, ${look.palette[0].hex}, transparent)`,
            }}
          />
          {/* arched window holding the chair */}
          <div className="absolute inset-x-[16%] top-[9%] bottom-[15%] overflow-hidden rounded-t-[999px] border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
            {src && (
              <Image
                src={src}
                alt={`${chair?.name ?? "Chair"} styled for ${look.name}`}
                fill
                priority={priority}
                sizes="(max-width: 768px) 70vw, 30vw"
                className="object-cover"
              />
            )}
            {/* tint the studio render toward the look's palette */}
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-soft-light"
              style={{ background: `linear-gradient(180deg, ${look.palette[1].hex}55, ${look.palette[0].hex}22 60%, transparent)` }}
            />
          </div>
          {/* floor reflection */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[22%]"
            style={{ background: `linear-gradient(to bottom, transparent, ${shade})` }}
          />
        </>
      )}
      {showPalette && (
        <ul className="absolute right-4 bottom-4 left-4 flex gap-1.5" aria-label={`${look.name} palette`}>
          {look.palette.map((s) => (
            <li key={s.name} className="h-2 flex-1 ring-1 ring-black/20" style={{ background: s.hex }} title={s.name} />
          ))}
        </ul>
      )}
    </div>
  );
}
