import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { site } from "@/lib/site";
import { display, displayItalic, sans } from "./fonts";

export const STORY_FRAMES = 240;

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GOLD = "#c9a96a";
const CREAM = "#efe4cf";

function Line({ at, children, style }: { at: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 28], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 40}px)`, ...style }}>{children}</div>;
}

// 9:16 launch announcement for Instagram / TikTok / Pinterest stories, 1080x1920.
export function LaunchStory() {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [96, 122], [1, 0], clamp);
  const inn = interpolate(frame, [108, 138], [0, 1], clamp);
  const zoom = interpolate(frame, [100, STORY_FRAMES], [1.12, 1], clamp);

  return (
    <AbsoluteFill style={{ background: "#0c0907" }}>
      {/* Scene 1: the statement */}
      <AbsoluteFill style={{ opacity: out, justifyContent: "center", padding: "0 100px", color: CREAM }}>
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

      {/* Scene 2: the room and the call to action */}
      <AbsoluteFill style={{ opacity: inn }}>
        <Img
          src={staticFile("chairs/render/royal-throne.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
        />
        <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(10,8,6,0.96) 0%, rgba(10,8,6,0) 48%)" }} />
        <div style={{ position: "absolute", bottom: 220, left: 0, right: 0, textAlign: "center", color: CREAM }}>
          <Line at={146} style={{ fontFamily: display, fontWeight: 300, fontSize: 104, lineHeight: 1.05 }}>
            Reserve your date
          </Line>
          <Line at={162} style={{ fontFamily: sans, fontSize: 28, letterSpacing: 10, textTransform: "uppercase", color: GOLD, marginTop: 34 }}>
            {site.domain}
          </Line>
          <Line at={176} style={{ fontFamily: displayItalic, fontSize: 40, color: "#cdbfa5", marginTop: 20 }}>
            {site.city}
          </Line>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
