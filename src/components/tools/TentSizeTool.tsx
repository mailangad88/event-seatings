"use client";

import { layouts, spaceExtras, spaceFor, tentOptions, type Layout } from "@/lib/tools/calc";
import { Choice, NumberField, PriceLines, ShareBar, Stat, ToolFrame, Toggles, useUrlState, type ToolPrice } from "./controls";

// Catalog tents we can price directly, by footprint.
const catalogTent: Record<string, string> = { "20x20": "frame-tent-20x20", "20x40": "frame-tent-20x40", "30x60": "frame-tent-30x60", "40x60": "pole-tent-40x60" };

function TentPlan({ w, l, used }: { w: number; l: number; used: number }) {
  const scale = 300 / Math.max(w, l);
  const fill = Math.min(1, used / (w * l));
  return (
    <svg viewBox={`0 0 ${l * scale + 20} ${w * scale + 40}`} role="img" aria-labelledby="tent-plan-t" className="w-full max-w-md">
      <title id="tent-plan-t">{`Top view of a ${w}' x ${l}' tent, about ${Math.round(fill * 100)}% filled by your layout`}</title>
      <rect x="10" y="10" width={l * scale} height={w * scale} fill="var(--surface)" stroke="var(--gold)" strokeWidth="2" rx="4" />
      <rect x="10" y="10" width={l * scale * fill} height={w * scale} fill="var(--gold)" opacity="0.18" rx="4" />
      <line x1="10" y1="10" x2={10 + l * scale} y2={10 + w * scale} stroke="var(--line)" strokeDasharray="4 4" />
      <line x1={10 + l * scale} y1="10" x2="10" y2={10 + w * scale} stroke="var(--line)" strokeDasharray="4 4" />
      <text x={10 + (l * scale) / 2} y={w * scale + 32} textAnchor="middle" fontSize="13" fill="var(--muted)">{`${l} ft`}</text>
    </svg>
  );
}

export function TentSizeTool({ prices }: { prices: Record<string, ToolPrice> }) {
  const [s, set] = useUrlState({ guests: 100, layout: "rounds", extras: ["dance", "bar", "buffet", "band"], dance: 25 });
  const layout = (s.layout in layouts ? s.layout : "rounds") as Layout;
  const space = spaceFor(s.guests, layout, s.extras, s.dance);
  const t = tentOptions(space.total);
  const key = (x?: [number, number]) => (x ? `${x[0]}x${x[1]}` : "");
  const pick = t.roomy ?? t.snug;
  const priced = catalogTent[key(pick)] ?? catalogTent[key(t.snug)];

  return (
    <ToolFrame
      inputs={
        <>
          <NumberField id="ts-guests" label="Guests under the tent" value={s.guests} onChange={(n) => set({ guests: n })} max={2000} step={5} />
          <Choice label="Layout" value={layout} options={(Object.keys(layouts) as Layout[]).filter((k) => k !== "classroom").map((k) => ({ id: k, label: layouts[k].label }))} onChange={(k) => set({ layout: k })} />
          <Toggles label="Also under the tent" value={s.extras} options={spaceExtras.map((e) => ({ id: e.id, label: e.label }))} onChange={(v) => set({ extras: v })} />
          {s.extras.includes("dance") && <NumberField id="ts-dance" label="Guests dancing at once" suffix="%" step={5} min={5} max={100} value={s.dance} onChange={(n) => set({ dance: n })} />}
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={space.total.toLocaleString()} label="Square feet needed" />
            <Stat
              big
              value={t.tooBig ? "2+ tents" : `${pick![0]}' x ${pick![1]}'`}
              label={t.tooBig ? "More than one tent" : "Comfortable tent size"}
              note={t.tooBig ? `Larger than a ${t.largest[0]}' x ${t.largest[1]}'. Ask about a custom or connected tent.` : t.snug && key(t.snug) !== key(pick) ? `Tightest fit: ${t.snug[0]}' x ${t.snug[1]}'` : "With room for walkways"}
            />
          </div>
          {pick && (
            <figure className="mt-6 rounded-2xl border border-line bg-surface p-5">
              <TentPlan w={pick[0]} l={pick[1]} used={space.total} />
              <figcaption className="mt-2 text-xs text-muted">Shaded area: the space your layout uses. The rest is walkways, service and breathing room.</figcaption>
            </figure>
          )}
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm font-medium">Where the space goes</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              <li className="flex justify-between py-2"><span>{layouts[layout].label} ({layouts[layout].sqft} sq ft per guest)</span><span className="tabular-nums">{space.seating.toLocaleString()}</span></li>
              {space.parts.map((p) => (
                <li key={p.id} className="flex justify-between py-2"><span>{p.label}</span><span className="tabular-nums">{p.sqft.toLocaleString()}</span></li>
              ))}
            </ul>
          </div>
          {priced && <PriceLines lines={[{ id: priced, qty: 1 }]} prices={prices} quoteHref={`/quote?items=${priced ?? "frame-tent-20x40"},tent-sidewall&guests=${s.guests}&from=tool-tent-size`} />}
          <ShareBar tool="tent-size" quoteHref={`/quote?items=${priced ?? "frame-tent-20x40"},tent-sidewall&guests=${s.guests}&from=tool-tent-size`} />
        </div>
      }
    />
  );
}
