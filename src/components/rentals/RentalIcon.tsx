import type { CategoryId } from "@/data/catalog-products";

// Line illustrations for each rental category, used until (and alongside) the 3D renders.
const paths: Record<CategoryId, React.ReactNode> = {
  chairs: (
    <>
      <path d="M20 8c0 0 2 22 2 26h20c0-4 2-26 2-26" />
      <path d="M22 16h20M22 22h20M22 28h20" />
      <path d="M18 34h28v4H18z" />
      <path d="M20 38l-2 18M44 38l2 18M24 38l-1 14M40 38l1 14" />
    </>
  ),
  tables: (
    <>
      <ellipse cx="32" cy="24" rx="24" ry="7" />
      <path d="M8 24v3c0 4 11 7 24 7s24-3 24-7v-3" />
      <path d="M32 34v18M22 56h20" />
    </>
  ),
  linens: (
    <>
      <ellipse cx="32" cy="18" rx="22" ry="6" />
      <path d="M10 18c-1 10-2 26-2 36 8 3 16 4 24 4s16-1 24-4c0-10-1-26-2-36" />
      <path d="M18 24c0 10-1 20-2 31M32 25v33M46 24c0 10 1 20 2 31" />
    </>
  ),
  dinnerware: (
    <>
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="15" />
      <circle cx="32" cy="32" r="9" />
    </>
  ),
  flatware: (
    <>
      <path d="M18 8v14a4 4 0 0 0 8 0V8M22 8v48" />
      <path d="M36 8c4 0 6 6 6 14s-3 10-6 10v24" />
      <path d="M48 8c3 0 5 4 5 9s-2 8-5 8v31" />
    </>
  ),
  glassware: (
    <>
      <path d="M18 8h16c0 12-3 20-8 20s-8-8-8-20z" />
      <path d="M26 28v20M19 48h14" />
      <path d="M40 14h10l-1 6c0 6-2 9-4 9s-4-3-4-9z" />
      <path d="M45 29v19M40 48h10" />
    </>
  ),
  "catering-equipment": (
    <>
      <path d="M10 30c0-10 10-16 22-16s22 6 22 16z" />
      <path d="M32 10v4M8 30h48v6H8z" />
      <path d="M14 36l-2 16M50 36l2 16M24 44h16" />
    </>
  ),
  tents: (
    <>
      <path d="M4 34L32 10l28 24" />
      <path d="M10 30v24M54 30v24M32 10v44" />
      <path d="M10 34c7 3 15 3 22 0 7 3 15 3 22 0" />
      <path d="M4 54h56" />
    </>
  ),
  "dance-floors-staging": (
    <>
      <path d="M8 40l24-12 24 12-24 12z" />
      <path d="M20 34l24 12M32 28v24M44 34L20 46" />
      <path d="M8 40v4l24 12 24-12v-4" />
      <path d="M26 12l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </>
  ),
  lighting: (
    <>
      <path d="M4 14c10 8 18 10 28 10s18-2 28-10" />
      <path d="M12 19v4M22 22v4M32 24v4M42 22v4M52 19v4" />
      <circle cx="12" cy="26" r="3" />
      <circle cx="22" cy="29" r="3" />
      <circle cx="32" cy="31" r="3" />
      <circle cx="42" cy="29" r="3" />
      <circle cx="52" cy="26" r="3" />
      <path d="M26 56l6-14 6 14z" />
    </>
  ),
  "heating-cooling": (
    <>
      <path d="M18 10h28l-4 8H22z" />
      <path d="M32 18v32M24 56h16M28 50h8" />
      <path d="M24 26c2 2 2 4 0 6M32 24c2 2 2 4 0 6M40 26c2 2 2 4 0 6" />
    </>
  ),
  lounge: (
    <>
      <path d="M12 26c0-4 3-6 6-6h28c3 0 6 2 6 6v6H12z" />
      <path d="M6 32c0-3 2-5 4-5s4 2 4 5v8h36v-8c0-3 2-5 4-5s4 2 4 5v14H6z" />
      <path d="M10 46v6M54 46v6" />
    </>
  ),
  decor: (
    <>
      <path d="M14 56V30a18 18 0 0 1 36 0v26" />
      <circle cx="20" cy="22" r="3" />
      <circle cx="32" cy="13" r="3" />
      <circle cx="44" cy="22" r="3" />
      <path d="M26 15l-3 4M38 15l3 4M8 56h48" />
    </>
  ),
  "games-kids": (
    <>
      <path d="M8 54V30l8-10 8 10 8-10 8 10 8-10 8 10v24z" />
      <path d="M24 54V40a8 8 0 0 1 16 0v14" />
      <path d="M16 20v-8M32 20v-8M48 20v-8" />
    </>
  ),
};

export function RentalIcon({ category, className = "", title }: { category: CategoryId; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {paths[category]}
    </svg>
  );
}
