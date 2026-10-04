import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { getChair } from "@/data/chairs";
import { StudioBackdrop, chairTint } from "@/components/studio";
import { site } from "@/lib/site";
import { DrawnChair } from "./DrawnChair";
import { display, displayItalic, sans } from "./fonts";

export const SHOWCASE_SLUGS = ["cross-back", "ghost", "velvet-dining", "rattan-garden"];
export const SHOWCASE_SEGMENT = 96;
export const SHOWCASE_FRAMES = SHOWCASE_SLUGS.length * SHOWCASE_SEGMENT;

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const INK = "#2a241e";
const GOLD = "#a88a5a";

function Segment({ slug, index }: { slug: string; index: number }) {
  const frame = useCurrentFrame();
  const chair = getChair(slug)!;

  const draw = interpolate(frame, [6, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const fillAmount = interpolate(frame, [40, 64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const text = interpolate(frame, [24, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const rule = interpolate(frame, [30, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const fade = interpolate(frame, [0, 10, SHOWCASE_SEGMENT - 12, SHOWCASE_SEGMENT], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, SHOWCASE_SEGMENT], [0, -14]);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <StudioBackdrop tint={chairTint(slug)} floor={66} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 26,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: GOLD,
          opacity: text,
        }}
      >
        No. {String(index + 1).padStart(2, "0")} · {chair.styles[0]}
      </div>

      <div style={{ position: "absolute", top: 230, left: 0, right: 0, height: 700, display: "flex", justifyContent: "center", transform: `translateY(${drift}px)`, color: INK, zIndex: 3 }}>
        <DrawnChair
          silhouette={chair.silhouette}
          fill={chair.finishes[0].hex}
          draw={draw}
          fillAmount={fillAmount}
          style={{ height: "100%", width: "auto" }}
        />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", color: INK, zIndex: 3 }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: 84,
            lineHeight: 1.05,
            opacity: text,
            transform: `translateY(${(1 - text) * 28}px)`,
          }}
        >
          {chair.name}
        </div>
        <div style={{ margin: "26px auto", height: 2, width: 140 * rule, background: GOLD }} />
        <div
          style={{
            fontFamily: displayItalic,
            fontSize: 38,
            color: "#5e554b",
            opacity: text,
          }}
        >
          {chair.tagline}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 20,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: "#776d62",
        }}
      >
        {site.name}
      </div>
    </AbsoluteFill>
  );
}

// 4:5 looping showcase, 1080x1350. Works as the website hero and as an Instagram post.
export function ChairShowcase() {
  return (
    <AbsoluteFill style={{ background: "#f7f3ec" }}>
      {SHOWCASE_SLUGS.map((slug, i) => (
        <Sequence key={slug} from={i * SHOWCASE_SEGMENT} durationInFrames={SHOWCASE_SEGMENT} layout="none">
          <Segment slug={slug} index={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
