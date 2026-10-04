import { C } from "../palette";
import { Cypress, FlowerPot } from "./Botanicals";

// Everything here is drawn in the 1080x1920 canvas's own coordinates.
export const WALL_TOP = 1190;
const BAND = 80;
const WALL_BOTTOM = 1700;
const ARCHES = [
  { cx: 105, w: 140 },
  { cx: 290, w: 130 },
  { cx: 540, w: 250 },
  { cx: 790, w: 130 },
  { cx: 975, w: 140 },
];

export function GardenDefs() {
  return (
    <defs>
      <pattern id="jaali" width={28} height={28} patternUnits="userSpaceOnUse">
        <rect width={28} height={28} fill={C.sage} />
        <path d="M0 14 L14 0 L28 14 L14 28 Z" fill="none" stroke={C.sageLight} strokeWidth={3} />
        <circle cx={14} cy={14} r={2.4} fill={C.sageLight} />
      </pattern>
      <pattern id="dots" width={22} height={22} patternUnits="userSpaceOnUse">
        <rect width={22} height={22} fill="#e46aa6" />
        <circle cx={6} cy={6} r={4} fill="#fff3f8" />
        <circle cx={17} cy={17} r={4} fill="#fff3f8" />
      </pattern>
      <linearGradient id="archGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fbf6ef" />
        <stop offset="1" stopColor="#f6e2ea" />
      </linearGradient>
    </defs>
  );
}

function archPath(cx: number, w: number, top: number, bottom: number) {
  const r = w / 2;
  return `M${cx - r} ${bottom} L${cx - r} ${top + r} A${r} ${r} 0 0 1 ${cx + r} ${top + r} L${cx + r} ${bottom} Z`;
}

// Sage lattice wall with a band of round portholes and five arched openings.
export function JaaliWall() {
  const archTop = WALL_TOP + BAND + 50;
  return (
    <g>
      <rect x={0} y={WALL_TOP} width={1080} height={BAND} fill={C.sageDark} />
      <rect x={0} y={WALL_TOP} width={1080} height={8} fill={C.sageLight} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <circle cx={54 + i * 108} cy={WALL_TOP + BAND / 2 + 4} r={22} fill="#f8f1e8" stroke={C.sageLight} strokeWidth={4} />
          {i < 9 ? <rect x={100 + i * 108} y={WALL_TOP + 20} width={16} height={BAND - 30} rx={8} fill="#f8f1e8" opacity={0.85} /> : null}
        </g>
      ))}
      <rect x={0} y={WALL_TOP + BAND} width={1080} height={WALL_BOTTOM - WALL_TOP - BAND} fill="url(#jaali)" />
      <rect x={0} y={WALL_TOP + BAND} width={1080} height={10} fill={C.sageDark} />
      {ARCHES.map((a) => (
        <g key={a.cx}>
          <path d={archPath(a.cx, a.w + 34, archTop - 22, WALL_BOTTOM)} fill={C.sageLight} />
          <path d={archPath(a.cx, a.w, archTop, WALL_BOTTOM)} fill="url(#archGlow)" />
          <line x1={a.cx} y1={archTop - 18} x2={a.cx} y2={archTop + 30} stroke={C.pinkDeep} strokeWidth={2} />
          <circle cx={a.cx} cy={archTop + 34} r={5} fill={C.pinkDeep} />
        </g>
      ))}
      {[200, 415, 665, 880].map((x) => (
        <rect key={x} x={x - 9} y={WALL_TOP + BAND} width={18} height={WALL_BOTTOM - WALL_TOP - BAND} fill={C.sageLight} opacity={0.75} />
      ))}
    </g>
  );
}

// Grass and a pink checkerboard floor in one-point perspective.
export function Lawn() {
  const vx = 540;
  const vy = 1350;
  const y0 = 1735;
  const y1 = 1920;
  const rows = [0, 0.16, 0.34, 0.54, 0.76, 1];
  const ys = rows.map((t) => y0 + (y1 - y0) * t);
  const tile = 92;
  const spread = (x: number, y: number) => vx + (x - vx) * ((y - vy) / (y1 - vy));
  const quads = [];
  for (let r = 0; r < ys.length - 1; r++) {
    for (let c = -7; c < 7; c++) {
      const xa = vx + c * tile;
      const xb = xa + tile;
      const pts = [
        [spread(xa, ys[r]), ys[r]],
        [spread(xb, ys[r]), ys[r]],
        [spread(xb, ys[r + 1]), ys[r + 1]],
        [spread(xa, ys[r + 1]), ys[r + 1]],
      ];
      quads.push(<polygon key={`${r}${c}`} points={pts.map((p) => p.join(",")).join(" ")} fill={(r + c) % 2 ? "#f6b3cd" : "#fde0eb"} />);
    }
  }
  return (
    <g>
      <rect x={0} y={WALL_BOTTOM} width={1080} height={1920 - WALL_BOTTOM} fill={C.grass} />
      <path d={`M0 ${WALL_BOTTOM} Q540 ${WALL_BOTTOM + 30} 1080 ${WALL_BOTTOM}`} fill="#b5dc85" />
      <clipPath id="floorClip">
        <path d={`M210 ${y0} L870 ${y0} L1080 1880 L1080 1920 L0 1920 L0 1880 Z`} />
      </clipPath>
      <g clipPath="url(#floorClip)">{quads}</g>
    </g>
  );
}

// A peacock perched on the wall, its train spilling down the lattice. `sway` moves the train.
export function Peacock({ x, sway }: { x: number; sway: number }) {
  const y = WALL_TOP;
  const feathers = Array.from({ length: 9 }, (_, i) => i);
  return (
    <g transform={`translate(${x} ${y})`}>
      {feathers.map((i) => {
        const spread = (i - 4) * 13;
        const len = 150 + (4 - Math.abs(i - 4)) * 16;
        const ex = 60 + spread * 1.4 + sway * (1 + i * 0.08);
        const ey = len;
        return (
          <g key={i}>
            <path d={`M40 -6 Q${70 + spread} ${ey * 0.4} ${ex} ${ey}`} stroke="#3e7d4f" strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d={`M40 -6 Q${70 + spread} ${ey * 0.4} ${ex} ${ey}`} stroke="#79b25c" strokeWidth={3} fill="none" opacity={0.7} />
            <ellipse cx={ex} cy={ey} rx={13} ry={18} fill="#4f9a5a" />
            <ellipse cx={ex} cy={ey + 2} rx={8} ry={12} fill="#d9b24a" />
            <ellipse cx={ex} cy={ey + 4} rx={5} ry={7} fill="#1f4f9a" />
          </g>
        );
      })}
      <ellipse cx={0} cy={-34} rx={62} ry={36} fill="#1f5fa8" transform="rotate(-12)" />
      <path d="M-30 -60 Q-60 -120 -42 -160" stroke="#1f5fa8" strokeWidth={26} fill="none" strokeLinecap="round" />
      <ellipse cx={-30} cy={-34} rx={30} ry={20} fill="#2a72c0" />
      <path d="M10 -50 Q40 -40 58 -20 Q30 -16 6 -24 Z" fill="#3e7d4f" />
      <circle cx={-44} cy={-166} r={18} fill="#1f5fa8" />
      <path d="M-58 -164 L-76 -158 L-58 -156 Z" fill="#c9a24a" />
      <circle cx={-48} cy={-170} r={4} fill="#fff" />
      <circle cx={-49} cy={-170} r={2} fill="#111" />
      {[-12, 0, 12].map((d) => (
        <g key={d}>
          <line x1={-42} y1={-182} x2={-42 + d} y2={-210} stroke="#1f5fa8" strokeWidth={2} />
          <circle cx={-42 + d} cy={-212} r={5} fill="#2a72c0" />
        </g>
      ))}
      <path d="M-8 0 l-6 14 M8 0 l6 14" stroke="#9a7a5a" strokeWidth={4} />
    </g>
  );
}

// Carved wooden settee heaped with cushions, in front of three cypresses.
export function Settee() {
  return (
    <g>
      <Cypress x={490} y={1600} h={210} />
      <Cypress x={540} y={1590} h={260} />
      <Cypress x={590} y={1600} h={210} />
      <path d="M395 1640 L395 1572 Q420 1560 440 1572 Q470 1548 500 1566 Q540 1530 580 1566 Q610 1548 640 1572 Q660 1560 685 1572 L685 1640 Z" fill={C.wood} />
      <path d="M410 1636 L410 1584 L670 1584 L670 1636 Z" fill="#a8734e" />
      <rect x={420} y={1590} width={110} height={64} rx={16} fill="#f08a4b" />
      <rect x={550} y={1590} width={110} height={64} rx={16} fill="#f6a35f" />
      <rect x={370} y={1646} width={340} height={58} rx={22} fill={C.magenta} />
      <rect x={380} y={1650} width={320} height={14} rx={7} fill="#cf4f95" />
      <ellipse cx={384} cy={1650} rx={30} ry={34} fill="#e8b94a" />
      <ellipse cx={384} cy={1650} rx={14} ry={34} fill="#d4a032" />
      <ellipse cx={696} cy={1650} rx={30} ry={34} fill="#e8b94a" />
      <ellipse cx={696} cy={1650} rx={14} ry={34} fill="#d4a032" />
      <rect x={430} y={1608} width={70} height={64} rx={14} fill="url(#dots)" transform="rotate(-10 465 1640)" />
      <rect x={500} y={1612} width={80} height={60} rx={14} fill="#e9b04a" />
      <rect x={580} y={1608} width={70} height={64} rx={14} fill="url(#dots)" transform="rotate(10 615 1640)" />
      <path d="M392 1704 l-6 30 M688 1704 l6 30 M470 1704 l0 26 M610 1704 l0 26" stroke={C.wood} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
}

// A pink scalloped garden parasol.
export function Parasol({ x, y }: { x: number; y: number }) {
  const scallops = 7;
  const w = 290;
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={-60} x2={0} y2={270} stroke="#b88a63" strokeWidth={8} />
      <path d={`M${-w / 2} 40 Q${-w / 2 + 20} -60 0 -96 Q${w / 2 - 20} -60 ${w / 2} 40 Z`} fill={C.pink} />
      {[-0.6, -0.3, 0, 0.3, 0.6].map((t) => (
        <path key={t} d={`M0 -96 Q${t * w * 0.45} -40 ${t * w * 0.75} 40`} stroke="#f7c4d8" strokeWidth={3} fill="none" />
      ))}
      {Array.from({ length: scallops }, (_, i) => {
        const sx = -w / 2 + (i * w) / scallops;
        const sw = w / scallops;
        return (
          <g key={i}>
            <path d={`M${sx} 40 Q${sx + sw / 2} 84 ${sx + sw} 40 Z`} fill="#f4b3cc" stroke={C.pinkDeep} strokeOpacity={0.35} />
            <circle cx={sx + sw / 2} cy={66} r={6} fill="#c9709a" />
            <line x1={sx + sw / 2} y1={72} x2={sx + sw / 2} y2={92} stroke="#c9709a" strokeWidth={3} />
          </g>
        );
      })}
      <circle cx={0} cy={-100} r={9} fill="#d9b56a" />
    </g>
  );
}

// A fringed lampshade hanging on a cord. `swing` is in degrees, pivoting at the ceiling.
export function Lamp({ x, cord, swing }: { x: number; cord: number; swing: number }) {
  return (
    <g transform={`translate(${x} 0) rotate(${swing})`}>
      <line x1={0} y1={0} x2={0} y2={cord} stroke="#9a8a6a" strokeWidth={3} />
      <path d={`M-40 ${cord} Q-50 ${cord + 50} -100 ${cord + 110} L100 ${cord + 110} Q50 ${cord + 50} 40 ${cord} Z`} fill="#c6e3b8" stroke="#8fbf86" strokeWidth={3} />
      {[-70, -35, 0, 35, 70].map((d) => (
        <path key={d} d={`M${d * 0.5} ${cord + 4} Q${d * 0.8} ${cord + 60} ${d * 1.25} ${cord + 108}`} stroke="#a9d39c" strokeWidth={3} fill="none" />
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const sx = -100 + i * (200 / 6);
        return <path key={i} d={`M${sx} ${cord + 110} Q${sx + 200 / 12} ${cord + 130} ${sx + 200 / 6} ${cord + 110}`} fill="#c6e3b8" stroke="#8fbf86" strokeWidth={2} />;
      })}
      {Array.from({ length: 21 }, (_, i) => (
        <line key={i} x1={-96 + i * 9.6} y1={cord + 118} x2={-96 + i * 9.6} y2={cord + 148} stroke="#e7d9b0" strokeWidth={2} />
      ))}
    </g>
  );
}

// A small green parakeet in flight. `flap` runs 0..1 through one wingbeat.
export function Parrot({ x, y, flap, scale = 1 }: { x: number; y: number; flap: number; scale?: number }) {
  const wing = Math.sin(flap * Math.PI * 2) * 34;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-40 6 L-78 22 L-74 12 Z" fill="#3f8a3a" />
      <ellipse cx={0} cy={0} rx={38} ry={17} fill="#57b04a" />
      <circle cx={34} cy={-8} r={14} fill="#57b04a" />
      <path d="M46 -8 Q58 -4 48 4 Z" fill="#d9483a" />
      <circle cx={38} cy={-11} r={2.5} fill="#111" />
      <path d={`M-4 -6 Q-20 ${-40 - wing} -44 ${-30 - wing} Q-20 -14 -4 -6 Z`} fill="#3f8a3a" />
    </g>
  );
}

export function Planters() {
  return (
    <g>
      <FlowerPot x={110} y={1860} s={1.05} seed="potL" pot="#f1b3c8" />
      <FlowerPot x={985} y={1870} s={1.15} seed="potR" pot="#f4d7a8" />
      <FlowerPot x={250} y={1800} s={0.7} seed="potM" pot="#e9a3bf" />
    </g>
  );
}
