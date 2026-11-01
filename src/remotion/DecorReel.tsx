import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { display, displayItalic, sans } from "./fonts";

// Vertical 9:16 reel built from the Blender decor renders (see blender/README.md).
// Clip and stills live in public/social/. Swap the clip for an AI-animated one
// with the same name and this reel picks it up.

export type DecorTheme = "gilded-ivory" | "midnight-gold" | "blush-garden";

export const DECOR_THEMES: { id: DecorTheme; label: string; hook: string; detail: string }[] = [
  { id: "gilded-ivory", label: "Gilded Ivory Ballroom", hook: "Your reception, but make it gold", detail: "Gold Chiavari · ivory cushion" },
  { id: "midnight-gold", label: "Midnight Gold Gala", hook: "Black tie, gold chairs, no notes", detail: "Gold Chiavari · black cushion" },
  { id: "blush-garden", label: "Blush Garden Romance", hook: "The softest table in Chicagoland", detail: "Rose-gold Chiavari · blush linen" },
];

// Brand shown on the reels. Kept here so reels match the locked brand even before the site rename lands.
const BRAND = "Beyond Chiavari";
const DOMAIN = "beyondchiavari.com";

export const REEL_FPS = 24;
const CLIP = 96;
const HOLD = 60;
export const REEL_FRAMES = CLIP + HOLD * 2;

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GOLD = "#c9a96a";
const CREAM = "#f4ead8";

function Caption({ kicker, title, sub, delay = 6 }: { kicker?: string; title: string; sub?: string; delay?: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 18], [0, 1], { ...clamp, easing: ease });
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(10,8,6,0.88) 0%, rgba(10,8,6,0) 42%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 260, textAlign: "center", color: CREAM, opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
        {kicker && (
          <div style={{ fontFamily: sans, fontSize: 26, letterSpacing: 9, textTransform: "uppercase", color: GOLD, marginBottom: 22 }}>{kicker}</div>
        )}
        <div style={{ fontFamily: display, fontWeight: 300, fontSize: 84, lineHeight: 1.05 }}>{title}</div>
        {sub && <div style={{ fontFamily: displayItalic, fontSize: 44, color: "#dccdb2", marginTop: 20 }}>{sub}</div>}
      </div>
    </>
  );
}

function Still({ src }: { src: string }) {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, HOLD], [1.0, 1.06]);
  const fade = interpolate(frame, [0, 8], [0, 1], clamp);
  return <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, opacity: fade }} />;
}

export function DecorReel({ theme }: { theme: DecorTheme }) {
  const t = DECOR_THEMES.find((x) => x.id === theme)!;
  return (
    <AbsoluteFill style={{ background: "#0c0907" }}>
      <Sequence durationInFrames={CLIP}>
        <OffthreadVideo src={staticFile(`social/clips/${theme}-dolly.mp4`)} muted />
        <Caption kicker={t.label} title={t.hook} />
      </Sequence>
      <Sequence from={CLIP} durationInFrames={HOLD}>
        <Still src={`social/stills/${theme}-hero-start.jpg`} />
        <Caption title={t.detail} sub="Delivered, set and collected" delay={4} />
      </Sequence>
      <Sequence from={CLIP + HOLD} durationInFrames={HOLD}>
        <Still src={`social/stills/${theme}-reveal-end.jpg`} />
        <Caption kicker={BRAND} title="Free 15-min seating plan" sub={`${DOMAIN} · link in bio`} delay={4} />
      </Sequence>
    </AbsoluteFill>
  );
}
