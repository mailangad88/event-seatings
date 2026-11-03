import Link from "next/link";
import { homeBase, locationPath, locations, type Location } from "@/data/geo";

// A stylised Chicagoland map: Lake Michigan, the Fox River, every area we serve,
// and a line from our St. Charles base to the area on the current page.
const W = 600;
const H = 900;
// Bounds cover the Wisconsin line (Antioch, Harvard) down to Kankakee and west to DeKalb.
const LNG0 = -88.8;
const LNG1 = -87.45;
const LAT0 = 41.05;
const LAT1 = 42.52;

const px = (lng: number) => ((lng - LNG0) / (LNG1 - LNG0)) * W;
const py = (lat: number) => ((LAT1 - lat) / (LAT1 - LAT0)) * H;
const pt = (lng: number, lat: number) => `${px(lng).toFixed(1)},${py(lat).toFixed(1)}`;

const shore: [number, number][] = [
  [-87.8, 42.52],
  [-87.81, 42.42],
  [-87.83, 42.3],
  [-87.82, 42.24],
  [-87.78, 42.18],
  [-87.73, 42.12],
  [-87.69, 42.07],
  [-87.67, 42.03],
  [-87.65, 41.98],
  [-87.63, 41.93],
  [-87.61, 41.89],
  [-87.6, 41.84],
  [-87.58, 41.8],
  [-87.55, 41.75],
  [-87.53, 41.7],
  [-87.52, 41.66],
  [-87.45, 41.62],
];
const lake = `M ${pt(...shore[0])} ${shore.map((s) => `L ${pt(...s)}`).join(" ")} L ${W},${py(41.62)} L ${W},0 Z`;

const fox: [number, number][] = [
  [-88.2, 42.52],
  [-88.2, 42.4],
  [-88.23, 42.3],
  [-88.27, 42.1],
  [-88.29, 42.04],
  [-88.31, 41.96],
  [-88.31, 41.91],
  [-88.31, 41.88],
  [-88.31, 41.84],
  [-88.32, 41.76],
  [-88.38, 41.68],
  [-88.45, 41.62],
];
const river = `M ${fox.map((s) => pt(...s)).join(" L ")}`;

export function AreaMap({ active, className = "" }: { active?: Location; className?: string }) {
  const labelled = new Set(["chicago", "naperville", "evanston", "schaumburg", "aurora", "joliet", "lake-forest", "elgin", "waukegan", "crystal-lake", "dekalb", "kankakee"]);
  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          active
            ? `Map of the Chicago area showing ${active.name} and our St. Charles base`
            : "Map of the Chicago-area towns and neighborhoods we serve"
        }
      >
        <defs>
          <pattern id="map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0H0V30" fill="none" stroke="var(--line)" strokeWidth="0.6" opacity="0.6" />
          </pattern>
          <linearGradient id="map-lake" x1="0" x2="1">
            <stop offset="0" stopColor="#3d5560" stopOpacity="0.55" />
            <stop offset="1" stopColor="#3d5560" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="var(--surface)" />
        <rect width={W} height={H} fill="url(#map-grid)" />
        <path d={lake} fill="url(#map-lake)" stroke="var(--gold)" strokeOpacity="0.5" strokeWidth="1.2" />
        <text x={px(-87.52)} y={py(42.3)} transform={`rotate(90 ${px(-87.52)} ${py(42.3)})`} fill="var(--muted)" fontSize="15" fontFamily="var(--font-body)" letterSpacing="3">
          Lake Michigan
        </text>
        <path d={river} fill="none" stroke="#6f8f9b" strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" opacity="0.9" />
        <text x={px(-88.19)} y={py(42.45)} fill="var(--muted)" fontSize="12" fontFamily="var(--font-body)">
          Fox River
        </text>

        {active && active.slug !== "st-charles" && (
          <line
            x1={px(homeBase.lng)}
            y1={py(homeBase.lat)}
            x2={px(active.lng)}
            y2={py(active.lat)}
            stroke="var(--gold)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            opacity="0.8"
          />
        )}

        {locations.filter((l) => l.kind !== "county").map((l) => {
          const on = active?.slug === l.slug;
          const x = px(l.lng);
          const y = py(l.lat);
          return (
            <Link key={l.slug} href={locationPath(l)} aria-label={`Chair rentals in ${l.name}`}>
              <g className="transition-opacity hover:opacity-100" opacity={active && !on ? 0.75 : 1}>
                <title>{l.name}</title>
                {on && (
                  <>
                    <circle cx={x} cy={y} r="26" fill="var(--gold)" opacity="0.12" />
                    <circle cx={x} cy={y} r="15" fill="none" stroke="var(--gold)" strokeOpacity="0.6" />
                  </>
                )}
                <circle cx={x} cy={y} r={on ? 6.5 : l.kind === "neighborhood" ? 2 : 3} fill={on ? "var(--gold)" : "var(--ink)"} opacity={on ? 1 : 0.7} />
                {(on || (!active && labelled.has(l.slug))) && (
                  <text
                    x={x + (l.lng > -87.75 ? -12 : 12)}
                    y={y + 5}
                    textAnchor={l.lng > -87.75 ? "end" : "start"}
                    fill={on ? "var(--ink)" : "var(--muted)"}
                    fontSize={on ? 22 : 14}
                    fontFamily="var(--font-body)"
                  >
                    {l.name}
                  </text>
                )}
              </g>
            </Link>
          );
        })}

        <g transform={`translate(${px(homeBase.lng)} ${py(homeBase.lat)})`}>
          <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" fill="var(--bg)" stroke="var(--gold)" strokeWidth="2" />
          {active?.slug !== "st-charles" && (
            <text x="-14" y="26" textAnchor="middle" fill="var(--gold)" fontSize="11" letterSpacing="2.5">
              OUR BASE
            </text>
          )}
        </g>

        <g transform={`translate(${W - 46} ${H - 70})`} opacity="0.7">
          <path d="M0 -18 L6 0 L0 -4 L-6 0 Z" fill="var(--gold)" />
          <text y="16" textAnchor="middle" fill="var(--muted)" fontSize="11" letterSpacing="2">
            N
          </text>
        </g>
      </svg>
    </figure>
  );
}
