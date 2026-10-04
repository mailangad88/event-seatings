import { chairs } from "@/data/chairs";

// A soft "photo studio" backdrop: gentle light from above, a floor plane with a
// contact shadow, and fine paper grain. Free of Next.js imports so Remotion can use it.

function mix(hex: string, to: string, t: number) {
  const a = hex.replace("#", "");
  const b = to.replace("#", "");
  const ch = (s: string, i: number) => parseInt(s.slice(i, i + 2), 16);
  const out = [0, 2, 4].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t));
  return `rgb(${out.join(",")})`;
}

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .2  0 0 0 0 .16  0 0 0 0 .12  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function StudioBackdrop({
  tint,
  floor = 85 as number | null,
  className = "",
  style,
  children,
}: {
  tint: string;
  /** Where the chair's feet land, as a percentage of the height. */
  floor?: number | null;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(120% 85% at 50% 28%, ${mix(tint, "#ffffff", 0.6)} 0%, ${tint} 52%, ${mix(tint, "#2e261e", 0.2)} 100%)`,
        ...style,
      }}
    >
      {floor !== null && (
        <>
      {/* floor plane */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${floor - 1}%`,
          bottom: 0,
          background: `linear-gradient(to bottom, ${mix(tint, "#2e261e", 0.1)}, ${mix(tint, "#2e261e", 0.22)})`,
          opacity: 0.55,
        }}
      />
      {/* contact shadow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: `${floor}%`,
          width: "46%",
          height: "4%",
          transform: "translate(-50%, -40%)",
          background: "radial-gradient(ellipse at center, rgba(28,22,16,.42) 0%, rgba(28,22,16,0) 70%)",
          filter: "blur(5px)",
        }}
      />
        </>
      )}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
      {/* grain */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          backgroundImage: grain,
          mixBlendMode: "multiply",
          opacity: 0.22,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Quiet stone and linen backdrops, one per chair, so the grid reads like a lookbook.
const tints = ["#e8e0d3", "#ddd4c6", "#e4ddd5", "#d8d9cf", "#e7dcd3", "#d9cfc1"];
export function chairTint(slug: string) {
  const i = chairs.findIndex((c) => c.slug === slug);
  return tints[(i < 0 ? 0 : i) % tints.length];
}
