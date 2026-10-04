import { random } from "remotion";
import { C } from "../palette";

type Pt = { x: number; y: number };

function quad(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
}

function quadTangent(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const x = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const y = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
}

// A garden rose seen from above: rings of soft petals around a tight centre.
export function Rose({ x, y, r, hue = C.rose }: { x: number; y: number; r: number; hue?: string }) {
  const rings = [
    { n: 7, d: 0.62, w: 0.55, o: 0.85, c: C.pinkLight },
    { n: 6, d: 0.42, w: 0.48, o: 0.9, c: hue },
    { n: 5, d: 0.24, w: 0.4, o: 0.95, c: C.pinkDeep },
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 0.95} fill={C.pinkLight} opacity={0.6} />
      {rings.map((ring, k) =>
        Array.from({ length: ring.n }, (_, i) => {
          const a = (i / ring.n) * 360 + k * 23;
          return (
            <ellipse
              key={`${k}-${i}`}
              cx={0}
              cy={-r * ring.d}
              rx={r * ring.w * 0.62}
              ry={r * ring.w}
              transform={`rotate(${a})`}
              fill={ring.c}
              opacity={ring.o}
              stroke={C.pinkDeep}
              strokeOpacity={0.25}
              strokeWidth={1}
            />
          );
        }),
      )}
      <circle r={r * 0.14} fill={C.magenta} opacity={0.8} />
    </g>
  );
}

function Leaf({ x, y, len, angle, fill = C.leaf }: { x: number; y: number; len: number; angle: number; fill?: string }) {
  const w = len * 0.38;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M0 0 Q${len * 0.5} ${-w} ${len} 0 Q${len * 0.5} ${w} 0 0 Z`} fill={fill} />
      <path d={`M0 0 L${len * 0.92} 0`} stroke={C.leafDark} strokeWidth={1.2} opacity={0.6} />
    </g>
  );
}

// Stem with leaves, a bud and an open rose, like a botanical print.
export function RoseStem({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 260 Q-12 150 6 0" stroke={C.leafDark} strokeWidth={5} fill="none" />
      <path d="M-4 180 Q-60 120 -70 60" stroke={C.leafDark} strokeWidth={3.5} fill="none" />
      <Leaf x={-2} y={210} len={70} angle={200} />
      <Leaf x={2} y={150} len={64} angle={-20} fill={C.leafLight} />
      <Leaf x={-30} y={130} len={52} angle={230} />
      <Leaf x={4} y={90} len={58} angle={-35} />
      <Leaf x={-50} y={95} len={44} angle={160} fill={C.leafLight} />
      <ellipse cx={-70} cy={48} rx={16} ry={24} fill={C.rose} />
      <path d="M-86 60 Q-70 30 -54 60" fill={C.leaf} />
      <Rose x={6} y={-10} r={70} />
    </g>
  );
}

// A pointed-petal lotus in bloom.
export function Lotus({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  const petals = [-75, -50, -25, 0, 25, 50, 75];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {petals.map((a, i) => (
        <path
          key={a}
          d="M0 0 Q-26 -50 0 -110 Q26 -50 0 0 Z"
          transform={`rotate(${a})`}
          fill={i % 2 ? "#f2b5cf" : "#e58db3"}
          stroke="#c8578a"
          strokeOpacity={0.4}
          opacity={0.92}
        />
      ))}
      <ellipse cx={0} cy={-12} rx={26} ry={14} fill="#e9c96a" />
      {[-14, -5, 5, 14].map((dx) => (
        <circle key={dx} cx={dx} cy={-16} r={3} fill="#7c8c3a" />
      ))}
    </g>
  );
}

// A vertical sprig of small white five-petal flowers, as on the pink mehrab panel.
export function FlowerVine({ x, y, h, seed }: { x: number; y: number; h: number; seed: string }) {
  const nodes = Math.floor(h / 70);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 ${h} Q-18 ${h * 0.5} 0 0`} stroke="#6d4f5b" strokeWidth={3} fill="none" />
      {Array.from({ length: nodes }, (_, i) => {
        const yy = h - (i + 0.5) * (h / nodes);
        const side = i % 2 ? 1 : -1;
        const len = 50 + random(`${seed}-l${i}`) * 50;
        return (
          <g key={i}>
            <path d={`M-6 ${yy} q${side * len * 0.5} -20 ${side * len} -38`} stroke="#6d4f5b" strokeWidth={2} fill="none" />
            <Leaf x={-6} y={yy} len={30} angle={side > 0 ? -30 : 210} fill="#8c7a5a" />
            <Blossom x={side * len - 6} y={yy - 38} r={13} />
          </g>
        );
      })}
    </g>
  );
}

export function Blossom({ x, y, r, fill = "#fdf6f0" }: { x: number; y: number; r: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.6} rx={r * 0.42} ry={r * 0.6} transform={`rotate(${a})`} fill={fill} />
      ))}
      <circle r={r * 0.22} fill="#e2b34d" />
    </g>
  );
}

// Hanging bougainvillea: a vine of magenta bracts with dark leaves, seeded so it never jitters.
export function Bougainvillea({ x, y, flip = false, seed }: { x: number; y: number; flip?: boolean; seed: string }) {
  const clusters = 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      {Array.from({ length: clusters }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const cx = r("x") * 220 + (i < 8 ? 0 : 20);
        const cy = r("y") * (i < 8 ? 120 : 260);
        const s = 0.6 + r("s") * 0.7;
        return (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`}>
            <Leaf x={0} y={0} len={30} angle={r("a") * 360} fill={r("c") > 0.5 ? C.leaf : C.leafDark} />
            {[0, 120, 240].map((a) => (
              <path
                key={a}
                d="M0 0 Q-12 -12 0 -22 Q12 -12 0 0 Z"
                transform={`rotate(${a + r("rot") * 60})`}
                fill={r("p") > 0.4 ? "#e0479a" : "#f07fb8"}
              />
            ))}
            <circle r={2.5} fill="#f6f1c8" />
          </g>
        );
      })}
    </g>
  );
}

// A date palm. `sway` rotates the crown a few degrees for a breeze.
export function Palm({ x, y, h, lean, sway, seed }: { x: number; y: number; h: number; lean: number; sway: number; seed: string }) {
  const top = { x: lean, y: -h };
  const ctrl = { x: lean * 0.15, y: -h * 0.55 };
  const base = { x: 0, y: 0 };
  const rings = 14;
  const fronds = [-170, -145, -120, -95, -70, -45, -20, 5, -110, -60];
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={`M-12 0 Q${ctrl.x - 10} ${ctrl.y} ${top.x - 6} ${top.y} L${top.x + 6} ${top.y} Q${ctrl.x + 10} ${ctrl.y} 12 0 Z`}
        fill="#a07a55"
      />
      {Array.from({ length: rings }, (_, i) => {
        const p = quad(base, ctrl, top, (i + 0.5) / rings);
        return <path key={i} d={`M${p.x - 10} ${p.y} q10 6 20 0`} stroke="#7a5a3d" strokeWidth={2} fill="none" />;
      })}
      <g transform={`translate(${top.x} ${top.y}) rotate(${sway})`}>
        {fronds.map((deg, i) => {
          const len = 150 + random(`${seed}-f${i}`) * 70;
          const a = (deg * Math.PI) / 180;
          const p0 = { x: 0, y: 0 };
          const p2 = { x: Math.cos(a) * len, y: Math.sin(a) * len + len * 0.55 };
          const p1 = { x: Math.cos(a) * len * 0.55, y: Math.sin(a) * len * 0.55 - 30 };
          const leaflets = 16;
          const col = i % 3 === 0 ? C.leafDark : i % 3 === 1 ? C.leaf : "#7aa84f";
          return (
            <g key={i}>
              <path d={`M0 0 Q${p1.x} ${p1.y} ${p2.x} ${p2.y}`} stroke={col} strokeWidth={4} fill="none" />
              {Array.from({ length: leaflets }, (_, j) => {
                const t = 0.12 + (j / leaflets) * 0.86;
                const p = quad(p0, p1, p2, t);
                const tg = quadTangent(p0, p1, p2, t);
                const l = 46 * (1 - t * 0.7);
                return [-1, 1].map((side) => {
                  const nx = -tg.y * side;
                  const ny = tg.x * side;
                  const ex = p.x + (nx * 0.8 + tg.x * 0.6) * l;
                  const ey = p.y + (ny * 0.8 + tg.y * 0.6) * l + l * 0.35;
                  return <path key={`${j}${side}`} d={`M${p.x} ${p.y} L${ex} ${ey}`} stroke={col} strokeWidth={4} strokeLinecap="round" />;
                });
              })}
            </g>
          );
        })}
        {[-14, 0, 14].map((dx) => (
          <circle key={dx} cx={dx} cy={8} r={8} fill="#c9a24a" />
        ))}
      </g>
    </g>
  );
}

export function Cypress({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 ${-h} Q${h * 0.17} ${-h * 0.4} ${h * 0.11} 0 L${-h * 0.11} 0 Q${-h * 0.17} ${-h * 0.4} 0 ${-h} Z`} fill="#2f5a34" />
      <path d={`M0 ${-h} Q${h * 0.08} ${-h * 0.4} ${h * 0.05} 0`} stroke="#4a7a45" strokeWidth={3} fill="none" />
    </g>
  );
}

// A planter overflowing with blooms.
export function FlowerPot({ x, y, s = 1, pot = "#e9a3bf", seed }: { x: number; y: number; s?: number; pot?: string; seed: string }) {
  const colors = ["#e0479a", "#f28c3a", "#f7c1d6", "#fdfbf5", "#c53b6f", "#f5a8c7"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <Leaf key={`l${i}`} x={0} y={-60} len={60 + random(`${seed}-ll${i}`) * 30} angle={180 + i * 15 + random(`${seed}-la${i}`) * 10} fill={i % 2 ? C.leaf : C.leafDark} />
      ))}
      {Array.from({ length: 16 }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        return <Blossom key={i} x={(r("x") - 0.5) * 130} y={-70 - r("y") * 90} r={10 + r("r") * 10} fill={colors[i % colors.length]} />;
      })}
      <path d="M-58 -60 L58 -60 L44 30 L-44 30 Z" fill={pot} />
      <rect x={-64} y={-68} width={128} height={16} rx={4} fill={pot} stroke="#c9718f" strokeOpacity={0.5} />
      <path d="M-40 -30 q40 14 80 0" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} fill="none" />
    </g>
  );
}
