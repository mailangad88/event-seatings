import {
  ARCH,
  ARCH_LINE,
  CHAIR_THICK,
  CHAIR_THIN,
  FINIALS,
  FINIAL_R,
  NAME_CAP,
  NAME_PATH,
  NAME_WIDTH,
  SEAT,
  THIN_RATIO,
} from "./logo-paths";

// The Beyond Chiavari logo: a Chiavari chair inside an arched doorway, next to the name.
// Drawn as SVG outlines (see scripts/brand/build-logo.py), coloured by the --brand-* tokens in
// globals.css, so it flips by itself inside dark bands (.tone-dark / bg-espresso).

/** Arch + chair, drawn in a 64×64 box. Use inside an <svg> or via <BrandMark>. */
function MarkShapes({ hairline = true }: { hairline?: boolean }) {
  return (
    <>
      <path d={ARCH} fill="var(--brand-arch)" />
      {hairline && <path d={ARCH_LINE} fill="none" stroke="var(--brand-chair)" strokeWidth={0.9} opacity={0.55} />}
      <g stroke="var(--brand-chair)" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={CHAIR_THICK} strokeWidth={2} />
        <path d={CHAIR_THIN} strokeWidth={2 * THIN_RATIO} />
      </g>
      <rect {...SEAT} fill="var(--brand-chair)" />
      {FINIALS.map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={FINIAL_R} fill="var(--brand-chair)" />
      ))}
    </>
  );
}

/** The mark on its own (arch + chair). Decorative unless a title is given. */
export function BrandMark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <MarkShapes />
    </svg>
  );
}

/** The name "BEYOND CHIAVARI" as outlines (caps only, so the box is exactly cap height). Size it with an h-* class. */
export function BrandName({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 ${-NAME_CAP - 0.5} ${NAME_WIDTH.toFixed(1)} ${(NAME_CAP + 1).toFixed(1)}`} className={className} aria-hidden>
      <path d={NAME_PATH} fill="var(--brand-name)" />
    </svg>
  );
}
