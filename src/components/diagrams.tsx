import type { BanquetLayout, TheaterLayout } from "@/lib/planning";
import { CELL } from "@/lib/planning";

// Server-rendered SVG diagrams. Every one is role="img" with <title>/<desc> so search
// engines, screen readers and AI crawlers get a text equivalent of the picture.

const ink = { fill: "var(--ink)" } as const;
const muted = { fill: "var(--muted)" } as const;
const lineStroke = "var(--line)";
const gold = "var(--gold)";

function Svg({ viewBox, title, desc, children }: { viewBox: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={title} className="h-auto w-full" xmlns="http://www.w3.org/2000/svg">
      <title>{title}</title>
      <desc>{desc}</desc>
      {children}
    </svg>
  );
}

export function BanquetDiagram({ layout, title, desc }: { layout: BanquetLayout; title: string; desc: string }) {
  const s = 10; // px per ft
  const pad = 20;
  const { W, L, cols, tables, perTable, tableBlockL, danceDepth } = layout;
  const items = Array.from({ length: tables }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return { cx: pad + (4 + c * CELL + CELL / 2) * s, cy: pad + (3 + r * CELL + CELL / 2) * s };
  });
  const seatsOn = (n: number) => Array.from({ length: n }, (_, k) => (k / n) * Math.PI * 2);
  return (
    <Svg viewBox={`0 0 ${W * s + pad * 2} ${L * s + pad * 2 + 14}`} title={title} desc={desc}>
      <rect x={pad} y={pad} width={W * s} height={L * s} rx={4} fill="var(--surface)" stroke={lineStroke} strokeWidth={2} />
      {danceDepth > 0 && (
        <g>
          <rect x={pad + 4 * s} y={pad + (tableBlockL + 1) * s} width={(W - 8) * s} height={(danceDepth - 2) * s} rx={4} fill="var(--gold-soft)" stroke={gold} strokeDasharray="6 5" />
          <text x={pad + (W * s) / 2} y={pad + (tableBlockL + danceDepth / 2) * s + 4} textAnchor="middle" fontSize={14} {...ink}>
            Dance floor
          </text>
        </g>
      )}
      {items.map((t, i) => (
        <g key={i}>
          {seatsOn(perTable).map((a, k) => (
            <circle key={k} cx={t.cx + Math.cos(a) * 3.6 * s} cy={t.cy + Math.sin(a) * 3.6 * s} r={0.8 * s} fill={gold} opacity={0.85} />
          ))}
          <circle cx={t.cx} cy={t.cy} r={2.5 * s} fill="var(--surface-2)" stroke={lineStroke} strokeWidth={1.5} />
        </g>
      ))}
      <text x={pad} y={L * s + pad * 2 + 6} fontSize={12} {...muted}>
        {W} ft × {L} ft · {tables} tables of {perTable} · scale 1 square ≈ 11 ft
      </text>
    </Svg>
  );
}

export function TheaterDiagram({ layout, title, desc }: { layout: TheaterLayout; title: string; desc: string }) {
  const s = 10;
  const pad = 20;
  const { W, L, seatsPerRow, rows, aisle, guests } = layout;
  const half = Math.ceil(seatsPerRow / 2);
  const seats: React.ReactNode[] = [];
  let n = 0;
  for (let r = 0; r < rows && n < guests; r++) {
    for (let c = 0; c < seatsPerRow && n < guests; c++) {
      const left = c < half;
      const x = pad + (3 + (left ? c * 1.5 : half * 1.5 + aisle + (c - half) * 1.5)) * s;
      const y = pad + (8 + r * 2.5) * s;
      seats.push(<rect key={`${r}-${c}`} x={x} y={y} width={1.2 * s} height={1.4 * s} rx={3} fill={gold} opacity={0.85} />);
      n++;
    }
  }
  return (
    <Svg viewBox={`0 0 ${W * s + pad * 2} ${L * s + pad * 2 + 14}`} title={title} desc={desc}>
      <rect x={pad} y={pad} width={W * s} height={L * s} rx={4} fill="var(--surface)" stroke={lineStroke} strokeWidth={2} />
      <rect x={pad + (W * s) / 2 - 5 * s} y={pad + 1 * s} width={10 * s} height={4 * s} rx={4} fill="var(--gold-soft)" stroke={gold} strokeDasharray="6 5" />
      <text x={pad + (W * s) / 2} y={pad + 3.5 * s} textAnchor="middle" fontSize={14} {...ink}>
        Altar / ceremony space
      </text>
      {seats}
      <text x={pad} y={L * s + pad * 2 + 6} fontSize={12} {...muted}>
        {W} ft × {L} ft · {rows} rows × {seatsPerRow} · {aisle} ft center aisle
      </text>
    </Svg>
  );
}

export type Bar = { label: string; value: number; display?: string; highlight?: boolean };

/** Horizontal bar chart with a text label and value on every bar. */
export function BarChart({ bars, title, desc, unit = "" }: { bars: Bar[]; title: string; desc: string; unit?: string }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const rowH = 44;
  const labelW = 190;
  const W = 720;
  return (
    <Svg viewBox={`0 0 ${W} ${bars.length * rowH + 16}`} title={title} desc={desc}>
      {bars.map((b, i) => {
        const w = Math.max(4, ((W - labelW - 130) * b.value) / max);
        return (
          <g key={b.label} transform={`translate(0 ${8 + i * rowH})`}>
            <text x={0} y={22} fontSize={15} {...ink}>
              {b.label}
            </text>
            <rect x={labelW} y={6} width={w} height={26} rx={3} fill={b.highlight ? gold : "var(--surface-2)"} stroke={gold} />
            <text x={labelW + w + 10} y={24} fontSize={15} {...ink}>
              {b.display ?? `${b.value.toLocaleString("en-US")}${unit}`}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

export type FlowStep = { label: string; result: string; pass: boolean | null };

/** Vertical decision flowchart: each node is a question with its computed answer. */
export function Flowchart({ steps, title, desc, outcome }: { steps: FlowStep[]; title: string; desc: string; outcome: string }) {
  const nodeH = 54;
  const gap = 26;
  const W = 720;
  const H = steps.length * (nodeH + gap) + 70;
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} title={title} desc={desc}>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={gold} />
        </marker>
      </defs>
      {steps.map((st, i) => {
        const y = 8 + i * (nodeH + gap);
        const color = st.pass === null ? gold : st.pass ? "#7fa879" : "#c97b6a";
        return (
          <g key={st.label}>
            <rect x={60} y={y} width={W - 120} height={nodeH} rx={10} fill="var(--surface-2)" stroke={color} strokeWidth={2} />
            <text x={80} y={y + 23} fontSize={15} {...ink}>
              {st.label}
            </text>
            <text x={80} y={y + 43} fontSize={13} {...muted}>
              {st.result}
            </text>
            <text x={W - 80} y={y + 33} textAnchor="end" fontSize={22} style={{ fill: color }}>
              {st.pass === null ? "•" : st.pass ? "✓" : "✗"}
            </text>
            <line x1={W / 2} y1={y + nodeH} x2={W / 2} y2={y + nodeH + gap - 4} stroke={gold} strokeWidth={2} markerEnd="url(#arr)" />
          </g>
        );
      })}
      <rect x={60} y={8 + steps.length * (nodeH + gap)} width={W - 120} height={46} rx={23} fill={gold} />
      <text x={W / 2} y={8 + steps.length * (nodeH + gap) + 29} textAnchor="middle" fontSize={16} style={{ fill: "var(--accent-ink)" }}>
        {outcome}
      </text>
    </Svg>
  );
}

/** 12-month strip; `levels` is 0 (avoid) to 3 (prime). */
export function MonthStrip({ levels, current, title, desc }: { levels: number[]; current: number; title: string; desc: string }) {
  const names = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const fills = ["var(--surface)", "var(--surface-2)", "var(--gold-soft)", gold];
  return (
    <Svg viewBox="0 0 720 120" title={title} desc={desc}>
      {levels.map((lv, i) => (
        <g key={i}>
          <rect x={6 + i * 59} y={14} width={55} height={64} rx={6} fill={fills[lv]} stroke={i === current ? "var(--ink)" : lineStroke} strokeWidth={i === current ? 3 : 1.5} />
          <text x={6 + i * 59 + 27.5} y={52} textAnchor="middle" fontSize={20} style={{ fill: lv === 3 ? "var(--accent-ink)" : "var(--ink)" }}>
            {names[i]}
          </text>
        </g>
      ))}
      <text x={6} y={106} fontSize={12} {...muted}>
        Darker gold = easier outdoor / lightest-effort months · outlined month is this page
      </text>
    </Svg>
  );
}

/** A table with seats around it (round) or along its sides (rectangular). */
export function TableDiagram({ shape, seats, label, title, desc }: { shape: "round" | "rect" | "half"; seats: number; label: string; title: string; desc: string }) {
  const cx = 200;
  const cy = 130;
  const dots: React.ReactNode[] = [];
  if (shape === "round" || shape === "half") {
    const r = shape === "round" ? 78 : 70;
    const n = seats;
    for (let k = 0; k < n; k++) {
      const a = shape === "round" ? (k / n) * Math.PI * 2 : Math.PI * 0.15 + (k / Math.max(1, n - 1)) * Math.PI * 0.7;
      dots.push(<circle key={k} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={13} fill={gold} opacity={0.85} />);
    }
  } else {
    const per = Math.ceil(seats / 2);
    for (let k = 0; k < seats; k++) {
      const top = k < per;
      const idx = top ? k : k - per;
      const count = top ? per : seats - per;
      dots.push(<circle key={k} cx={cx - 110 + ((idx + 0.5) * 220) / count} cy={top ? cy - 52 : cy + 52} r={13} fill={gold} opacity={0.85} />);
    }
  }
  return (
    <Svg viewBox="0 0 400 260" title={title} desc={desc}>
      {shape === "round" && <circle cx={cx} cy={cy} r={52} fill="var(--surface-2)" stroke={lineStroke} strokeWidth={2} />}
      {shape === "half" && <path d={`M ${cx - 55} ${cy - 40} A 55 55 0 0 0 ${cx + 55} ${cy - 40} Z`} transform={`translate(0 ${50})`} fill="var(--surface-2)" stroke={lineStroke} strokeWidth={2} />}
      {shape === "rect" && <rect x={cx - 120} y={cy - 32} width={240} height={64} rx={4} fill="var(--surface-2)" stroke={lineStroke} strokeWidth={2} />}
      {dots}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize={15} {...ink}>
        {label}
      </text>
    </Svg>
  );
}
