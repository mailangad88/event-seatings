import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { getChair } from "@/data/chairs";
import { site } from "@/lib/site";
import { display, displayItalic, sans } from "./fonts";

export const SHOWCASE_SLUGS = ["royal-throne", "velvet-dining", "louis-medallion", "ghost"];
export const SHOWCASE_SEGMENT = 96;
export const SHOWCASE_FRAMES = SHOWCASE_SLUGS.length * SHOWCASE_SEGMENT;

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GOLD = "#c9a96a";
const CREAM = "#efe4cf";

function Segment({ slug, index }: { slug: string; index: number }) {
  const frame = useCurrentFrame();
  const chair = getChair(slug)!;

  const zoom = interpolate(frame, [0, SHOWCASE_SEGMENT], [1.07, 1]);
  const text = interpolate(frame, [18, 48], [0, 1], { ...clamp, easing: ease });
  const rule = interpolate(frame, [26, 62], [0, 1], { ...clamp, easing: ease });
  const fade = interpolate(frame, [0, 12, SHOWCASE_SEGMENT - 12, SHOWCASE_SEGMENT], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: fade, background: "#0c0907" }}>
      <Img
        src={staticFile(`chairs/render/${slug}.jpg`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(10,8,6,0.94) 0%, rgba(10,8,6,0) 46%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(10,8,6,0.55) 0%, rgba(10,8,6,0) 22%)" }} />

      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 24,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: GOLD,
          opacity: text,
        }}
      >
        No. {String(index + 1).padStart(2, "0")} · {chair.styles[0]}
      </div>

      <div style={{ position: "absolute", left: 60, right: 60, bottom: 120, textAlign: "center", color: CREAM }}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 300,
            fontSize: 88,
            lineHeight: 1.04,
            opacity: text,
            transform: `translateY(${(1 - text) * 28}px)`,
          }}
        >
          {chair.name}
        </div>
        <div style={{ margin: "26px auto", height: 2, width: 150 * rule, background: GOLD }} />
        <div style={{ fontFamily: displayItalic, fontSize: 40, color: "#cdbfa5", opacity: text }}>{chair.tagline}</div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: sans,
          fontSize: 20,
          letterSpacing: 9,
          textTransform: "uppercase",
          color: "#a89d87",
        }}
      >
        {site.name}
      </div>
    </AbsoluteFill>
  );
}

// 4:5 looping showcase, 1080x1350. Works as an Instagram post or a website video.
export function ChairShowcase() {
  return (
    <AbsoluteFill style={{ background: "#0c0907" }}>
      {SHOWCASE_SLUGS.map((slug, i) => (
        <Sequence key={slug} from={i * SHOWCASE_SEGMENT} durationInFrames={SHOWCASE_SEGMENT} layout="none">
          <Segment slug={slug} index={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
