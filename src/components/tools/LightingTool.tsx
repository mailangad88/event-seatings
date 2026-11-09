"use client";

import { stringLights, type LightPattern } from "@/lib/tools/calc";
import { Choice, NumberField, PriceLines, ShareBar, Stat, ToolFrame, useUrlState, type ToolPrice } from "./controls";

const patterns: { id: LightPattern; label: string }[] = [
  { id: "parallel", label: "Straight runs" },
  { id: "zigzag", label: "Zigzag" },
  { id: "starburst", label: "Starburst" },
  { id: "perimeter", label: "Around the edge" },
];

function Pattern({ p, L, W, s }: { p: LightPattern; L: number; W: number; s: number }) {
  const k = 280 / Math.max(L, W, 1);
  const w = L * k;
  const h = W * k;
  const lines: string[] = [];
  if (p === "perimeter") lines.push(`M0 0 H${w} V${h} H0 Z`);
  if (p === "parallel") for (let x = 0; x <= L + 0.01; x += Math.max(2, s)) lines.push(`M${x * k} 0 V${h}`);
  if (p === "zigzag") {
    let d = "M0 0";
    let top = true;
    for (let x = Math.max(2, s); x <= L + Math.max(2, s) - 0.01; x += Math.max(2, s)) {
      d += ` L${Math.min(x, L) * k} ${top ? h : 0}`;
      top = !top;
    }
    lines.push(d);
  }
  if (p === "starburst") for (const [x, y] of [[0, 0], [w / 2, 0], [w, 0], [w, h / 2], [w, h], [w / 2, h], [0, h], [0, h / 2]]) lines.push(`M${w / 2} ${h / 2} L${x} ${y}`);
  return (
    <svg viewBox={`-10 -10 ${w + 20} ${h + 20}`} role="img" aria-labelledby="lp-t" className="w-full max-w-md">
      <title id="lp-t">{`Top view of a ${L} by ${W} foot space with string lights hung in a ${p} pattern`}</title>
      <rect x="0" y="0" width={w} height={h} fill="var(--espresso)" opacity="0.9" rx="3" />
      {lines.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--gold-bright)" strokeWidth="2" strokeDasharray="1 6" strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function LightingTool({ prices }: { prices: Record<string, ToolPrice> }) {
  const [s, set] = useUrlState({ length: 40, width: 20, pattern: "parallel", spacing: 6, bulb: 12, slack: 10, uplight: 8 });
  const pattern = (patterns.some((p) => p.id === s.pattern) ? s.pattern : "parallel") as LightPattern;
  const r = stringLights({ length: s.length, width: s.width, pattern, spacing: s.spacing, bulbSpacingIn: s.bulb, slackPct: s.slack, uplightSpacing: s.uplight });
  const strands100 = Math.ceil(r.total / 100);

  return (
    <ToolFrame
      inputs={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="lt-l" label="Length" suffix="ft" value={s.length} onChange={(n) => set({ length: n })} max={500} />
            <NumberField id="lt-w" label="Width" suffix="ft" value={s.width} onChange={(n) => set({ width: n })} max={500} />
          </div>
          <Choice label="Pattern" value={pattern} options={patterns} onChange={(k) => set({ pattern: k })} />
          {(pattern === "parallel" || pattern === "zigzag") && <NumberField id="lt-sp" label="Space between runs" suffix="ft" min={2} max={30} value={s.spacing} onChange={(n) => set({ spacing: n })} hint="Closer runs read as a glowing ceiling; wider runs feel airy." />}
          <NumberField id="lt-slack" label="Extra for sag and drops to power" suffix="%" step={5} max={50} value={s.slack} onChange={(n) => set({ slack: n })} />
          <NumberField id="lt-bulb" label="Bulb spacing on the strand" suffix="in" min={6} max={36} value={s.bulb} onChange={(n) => set({ bulb: n })} hint="Check the strand you rent; 12 inches is common." />
          <NumberField id="lt-up" label="One uplight every" suffix="ft of wall" min={4} max={30} value={s.uplight} onChange={(n) => set({ uplight: n })} />
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat big value={`${r.total} ft`} label="String lights" note={`${r.feet} ft of runs + ${s.slack}% slack`} />
            <Stat big value={r.bulbs} label="Bulbs" note={`One every ${s.bulb}"`} />
            <Stat big value={r.uplights} label="Uplights" note="Around the walls" />
          </div>
          <figure className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <Pattern p={pattern} L={s.length} W={s.width} s={s.spacing} />
            <figcaption className="mt-2 text-xs text-muted">{r.runs} run{r.runs === 1 ? "" : "s"}. Lights need a power point near one end of each run.</figcaption>
          </figure>
          <PriceLines lines={[{ id: "string-lights", qty: strands100 }, { id: "uplight", qty: r.uplights }]} prices={prices} quoteHref="/quote?items=string-lights,uplight&from=tool-lighting" />
          <ShareBar tool="lighting" quoteHref="/quote?items=string-lights,uplight&from=tool-lighting" />
        </div>
      }
    />
  );
}
