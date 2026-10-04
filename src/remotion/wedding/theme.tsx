import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";

export const MAROON = "#5b0e1d";
export const MAROON_DEEP = "#2c050d";
export const GOLD = "#d9b26a";
export const GOLD_LIGHT = "#f3dca4";
export const CREAM = "#fbf3e2";

export const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fades and lifts its children in, starting `at` frames into the scene.
export function Reveal({ at, children, style }: { at: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 26], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 36}px)`, ...style }}>{children}</div>;
}

// Deep maroon with a warm glow in the middle, like candlelight on silk.
export function Backdrop() {
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(ellipse 80% 60% at 50% 45%, #7a1a2b 0%, ${MAROON} 45%, ${MAROON_DEEP} 100%)` }}
    />
  );
}

function Corner({ style }: { style: React.CSSProperties }) {
  return (
    <svg width={170} height={170} viewBox="0 0 170 170" style={{ position: "absolute", ...style }}>
      <g fill="none" stroke={GOLD} strokeWidth={2.2}>
        <path d="M6 150 V40 Q6 6 40 6 H150" />
        <path d="M22 150 V52 Q22 22 52 22 H150" strokeWidth={1.2} />
        <path d="M40 40 Q70 46 76 76 Q46 70 40 40 Z" fill={GOLD} fillOpacity={0.25} />
        <path d="M76 76 Q96 70 112 84 M76 76 Q70 96 84 112" />
        <circle cx={118} cy={88} r={5} fill={GOLD} />
        <circle cx={88} cy={118} r={5} fill={GOLD} />
      </g>
    </svg>
  );
}

// Gold double border with ornamental corners. It draws itself in over the first second.
export function OrnateFrame() {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: ease });
  const inset = 44;
  return (
    <AbsoluteFill style={{ opacity: t }}>
      <div style={{ position: "absolute", inset, border: `2px solid ${GOLD}`, opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: inset + 14, border: `1px solid ${GOLD}`, opacity: 0.5 }} />
      <Corner style={{ top: inset - 8, left: inset - 8 }} />
      <Corner style={{ top: inset - 8, right: inset - 8, transform: "scaleX(-1)" }} />
      <Corner style={{ bottom: inset - 8, left: inset - 8, transform: "scaleY(-1)" }} />
      <Corner style={{ bottom: inset - 8, right: inset - 8, transform: "scale(-1, -1)" }} />
    </AbsoluteFill>
  );
}

// A small gold divider: line, diamond, line.
export function Divider({ width = 360 }: { width?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, margin: "0 auto" }}>
      <div style={{ width: width / 2 - 30, height: 1.5, background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
      <div style={{ width: 14, height: 14, background: GOLD, transform: "rotate(45deg)" }} />
      <div style={{ width: width / 2 - 30, height: 1.5, background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
    </div>
  );
}

const PETAL_COLORS = ["#f39c12", "#f5b041", "#e67e22", "#f7c948", "#d35400"];

// Marigold petals drifting down. Positions come from seeded random(), so every render matches.
export function Petals({ count = 26, seed = "petals" }: { count?: number; seed?: string }) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const speed = 90 + r("speed") * 120; // px per second
        const size = 14 + r("size") * 16;
        const travel = height + 200;
        const y = ((r("start") * travel + (frame / fps) * speed) % travel) - 100;
        const x = r("x") * width + Math.sin(frame / (20 + r("sway") * 30) + i) * 40;
        const rot = r("rot") * 360 + frame * (r("spin") - 0.5) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size * 0.62,
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              background: PETAL_COLORS[i % PETAL_COLORS.length],
              opacity: 0.55 + r("o") * 0.35,
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}
