import { hasPublicFile } from "@/lib/public-files";
import Image from "next/image";
import { chairAlt, getChair } from "@/data/chairs";
import type { Look } from "@/data/looks";
import renders from "@/data/renders.json";

// True when a /public file is present at build time, so media from other branches can be
// referenced before it lands without showing a broken image.
const has = (src?: string): src is string => hasPublicFile(src);

// Media for a look: its own still and video when they exist (see src/data/looks.ts).
export function lookMedia(look: Look) {
  const video = has(look.video) ? look.video : undefined;
  const poster = has(look.poster) ? look.poster : undefined;
  const still = has(look.still) ? look.still : poster;
  const captions = has(look.captions) ? look.captions : undefined;
  return { video, poster: poster ?? still, still, captions };
}

// A styled "set" for a decor look: the look's rendered still, or else the studio render of the
// hero chair framed in an arched window. Videos are shown with VideoFeature, not here.
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
  const media = lookMedia(look);
  const chair = getChair(look.heroChair);
  const src = chair?.image ?? (renders.includes(look.heroChair) ? `/chairs/render/${look.heroChair}.jpg` : undefined);
  const [glow, shade] = look.light;

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{ background: `radial-gradient(130% 90% at 50% 18%, ${glow} 0%, ${shade} 72%)` }}
    >
      {media.still ? (
        <Image
          src={media.still}
          alt={look.mediaAlt ?? `${look.name} decor look: ${look.kicker.toLowerCase()}.`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 90vw, 40vw"
          className="object-cover"
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
                alt={
                  chair
                    ? `${look.name} decor look, built around the ${chairAlt(chair)}`
                    : `${look.name} decor look`
                }
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
