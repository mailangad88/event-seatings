import type { Silhouette } from "@/data/chairs";

// Line-art drawings for each chair family (viewBox 0 0 120 160).
// Kept free of Next.js imports so the Remotion bundle can use them too.

export const chairDrawings: Record<Silhouette, (fill: string) => React.ReactNode> = {
  crossback: (f) => (
    <>
      <path d="M32 18 V150 M88 18 V150 M30 22 H90" />
      <path d="M34 34 L86 84 M86 34 L34 84" />
      <rect x="26" y="88" width="68" height="10" rx="2" fill={f} fillOpacity=".55" />
      <path d="M32 128 H88" />
    </>
  ),
  ghost: (f) => (
    <>
      <ellipse cx="60" cy="52" rx="28" ry="34" fill={f} fillOpacity=".35" />
      <ellipse cx="60" cy="52" rx="20" ry="26" />
      <path d="M28 96 Q60 86 92 96 L90 104 Q60 96 30 104 Z" fill={f} fillOpacity=".35" />
      <path d="M32 104 Q28 128 34 150 M88 104 Q92 128 86 150" />
    </>
  ),
  rattan: (f) => (
    <>
      <path d="M24 92 Q20 30 60 24 Q100 30 96 92" fill={f} fillOpacity=".45" />
      <path d="M34 88 Q32 42 60 36 Q88 42 86 88" />
      <path d="M40 50 L80 80 M80 50 L40 80 M60 40 V88 M36 64 H84" strokeOpacity=".5" />
      <ellipse cx="60" cy="94" rx="38" ry="8" fill={f} fillOpacity=".55" />
      <path d="M30 100 L28 150 M90 100 L92 150 M48 102 L46 150 M72 102 L74 150" />
    </>
  ),
  bentwood: (f) => (
    <>
      <path d="M36 92 Q30 20 60 18 Q90 20 84 92" />
      <path d="M44 88 Q40 40 60 38 Q80 40 76 88" />
      <ellipse cx="60" cy="94" rx="32" ry="7" fill={f} fillOpacity=".55" />
      <path d="M32 98 Q26 124 24 150 M88 98 Q94 124 96 150 M50 100 L48 150 M70 100 L72 150" />
      <ellipse cx="60" cy="128" rx="30" ry="5" />
    </>
  ),
  wishbone: (f) => (
    <>
      <path d="M22 60 Q60 40 98 60" strokeWidth="3.5" />
      <path d="M60 50 V72 M60 72 L46 90 M60 72 L74 90" />
      <path d="M26 62 L32 150 M94 62 L88 150" />
      <rect x="28" y="88" width="64" height="10" rx="2" fill={f} fillOpacity=".5" />
      <path d="M34 92 H86 M34 95 H86" strokeOpacity=".5" strokeWidth="1.5" />
    </>
  ),
  velvet: (f) => (
    <>
      <path d="M32 90 V36 Q32 20 60 20 Q88 20 88 36 V90 Z" fill={f} fillOpacity=".75" />
      <path d="M46 26 V88 M60 22 V88 M74 26 V88" strokeOpacity=".4" />
      <rect x="26" y="86" width="68" height="16" rx="7" fill={f} fillOpacity=".85" />
      <path d="M34 102 L36 150 M86 102 L84 150" strokeWidth="2.5" />
    </>
  ),
  infinity: (f) => (
    <>
      <path d="M32 18 V150 M88 18 V150 M30 20 H90" />
      <circle cx="47" cy="50" r="14" />
      <circle cx="73" cy="50" r="14" />
      <path d="M32 74 H88" />
      <rect x="26" y="88" width="68" height="10" rx="4" fill={f} fillOpacity=".5" />
      <path d="M32 128 H88" />
    </>
  ),
  cane: (f) => (
    <>
      <path d="M32 18 V150 M88 18 V150 M30 20 H90" />
      <rect x="38" y="28" width="44" height="50" rx="4" fill={f} fillOpacity=".3" />
      <path
        d="M38 38 H82 M38 48 H82 M38 58 H82 M38 68 H82 M48 28 V78 M60 28 V78 M72 28 V78"
        strokeOpacity=".45"
        strokeWidth="1.5"
      />
      <rect x="26" y="88" width="68" height="10" rx="2" fill={f} fillOpacity=".55" />
    </>
  ),
  windsor: (f) => (
    <>
      <path d="M28 88 Q24 18 60 16 Q96 18 92 88" />
      <path d="M44 88 V24 M52 88 V20 M60 88 V18 M68 88 V20 M76 88 V24" strokeWidth="2" />
      <path d="M24 90 Q60 82 96 90 L94 100 Q60 94 26 100 Z" fill={f} fillOpacity=".55" />
      <path d="M30 100 L22 150 M90 100 L98 150 M30 128 H90" />
    </>
  ),
  louis: (f) => (
    <>
      <ellipse cx="60" cy="50" rx="30" ry="34" />
      <ellipse cx="60" cy="50" rx="23" ry="27" fill={f} fillOpacity=".7" />
      <circle cx="60" cy="14" r="4" />
      <rect x="24" y="88" width="72" height="14" rx="6" fill={f} fillOpacity=".7" />
      <path d="M30 102 Q22 126 32 150 M90 102 Q98 126 88 150" />
    </>
  ),
  shell: (f) => (
    <>
      <path
        d="M22 54 Q22 96 60 98 Q98 96 98 54 Q94 46 86 52 Q84 82 60 84 Q36 82 34 52 Q26 46 22 54 Z"
        fill={f}
        fillOpacity=".8"
      />
      <path d="M44 98 L32 150 M76 98 L88 150 M44 98 L88 150 M76 98 L32 150" strokeWidth="2" />
    </>
  ),
  folding: (f) => (
    <>
      <path d="M34 18 V96 M86 18 V96" />
      <path d="M34 28 H86 M34 40 H86 M34 52 H86" strokeWidth="6" stroke={f} />
      <rect x="28" y="88" width="64" height="10" rx="2" fill={f} fillOpacity=".7" />
      <path d="M34 98 L86 150 M86 98 L34 150" />
    </>
  ),
  throne: (f) => (
    <>
      <path
        d="M28 96 V40 Q28 8 60 6 Q92 8 92 40 V96"
        fill={f}
        fillOpacity=".35"
      />
      <path d="M38 92 V44 Q38 20 60 18 Q82 20 82 44 V92" fill={f} fillOpacity=".55" />
      <circle cx="60" cy="10" r="5" />
      <path d="M18 70 Q18 60 28 62 M102 70 Q102 60 92 62 M18 70 V100 M102 70 V100" />
      <rect x="22" y="92" width="76" height="14" rx="6" fill={f} fillOpacity=".7" />
      <path d="M30 106 Q24 128 32 150 M90 106 Q96 128 88 150" />
    </>
  ),
};

export function ChairDrawing({
  silhouette,
  fill,
  svgRef,
  ...props
}: {
  silhouette: Silhouette;
  fill: string;
  svgRef?: React.Ref<SVGSVGElement>;
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {chairDrawings[silhouette](fill)}
    </svg>
  );
}
