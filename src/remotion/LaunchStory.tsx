import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { getChair } from "@/data/chairs";
import { site } from "@/lib/site";
import { DrawnChair } from "./DrawnChair";
import { display, displayItalic, sans } from "./fonts";

export const STORY_FRAMES = 240;

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GOLD = "#c4a874";

function Line({ at, children, style }: { at: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 28], [0, 1], { ...clampOpts, easing: ease });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 40}px)`, ...style }}>{children}</div>;
}

// 9:16 launch announcement for Instagram / TikTok / Pinterest stories, 1080x1920.
export function LaunchStory() {
  const frame = useCurrentFrame();
  const chair = getChair("velvet-dining")!;

  const out = interpolate(frame, [96, 120], [1, 0], clampOpts);
  const inn = interpolate(frame, [112, 136], [0, 1], clampOpts);
  const draw = interpolate(frame, [118, 176], [0, 1], { ...clampOpts, easing: ease });
  const fillAmount = interpolate(frame, [160, 190], [0, 1], clampOpts);
  const cardBg = interpolate(frame, [96, 130], [0, 1], clampOpts);

  return (
    <AbsoluteFill style={{ background: "#26201b" }}>
      {/* Scene 1: the statement */}
      <AbsoluteFill style={{ opacity: out, justifyContent: "center", padding: "0 100px", color: "#f7f3ec" }}>
        <Line at={6} style={{ fontFamily: sans, fontSize: 28, letterSpacing: 12, textTransform: "uppercase", color: GOLD }}>
          {site.launch.seasonLabel}
        </Line>
        <Line at={22} style={{ fontFamily: display, fontWeight: 300, fontSize: 190, lineHeight: 0.95, marginTop: 50 }}>
          Seating,
        </Line>
        <Line at={38} style={{ fontFamily: displayItalic, fontSize: 190, lineHeight: 0.95, color: GOLD }}>
          beyond
        </Line>
        <Line at={54} style={{ fontFamily: display, fontWeight: 300, fontSize: 190, lineHeight: 0.95 }}>
          Chiavari.
        </Line>
      </AbsoluteFill>

      {/* Scene 2: the chair and the call to action */}
      <AbsoluteFill style={{ opacity: inn, background: "#f7f3ec" }}>
        <AbsoluteFill style={{ background: "#d8d9cf", opacity: cardBg }} />
        <div style={{ position: "absolute", top: 210, left: 0, right: 0, height: 900, display: "flex", justifyContent: "center", color: "#1b1815" }}>
          <DrawnChair silhouette={chair.silhouette} fill={chair.finishes[0].hex} draw={draw} fillAmount={fillAmount} style={{ height: "100%", width: "auto" }} />
        </div>
        <div style={{ position: "absolute", bottom: 230, left: 0, right: 0, textAlign: "center", color: "#1b1815" }}>
          <Line at={150} style={{ fontFamily: display, fontWeight: 300, fontSize: 96, lineHeight: 1.05 }}>
            Reserve your date
          </Line>
          <Line at={166} style={{ fontFamily: sans, fontSize: 28, letterSpacing: 10, textTransform: "uppercase", color: "#776d62", marginTop: 34 }}>
            {site.domain}
          </Line>
          <Line at={178} style={{ fontFamily: displayItalic, fontSize: 40, color: "#5e554b", marginTop: 20 }}>
            {site.city}
          </Line>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
