"use client";

import Link from "@/components/Link";
import { venueCapacity } from "@/lib/tools/calc";
import { NumberField, ShareBar, Stat, ToolFrame, useUrlState } from "./controls";

export function VenueCapacityTool({ floorPlanHref }: { floorPlanHref?: string }) {
  const [s, set] = useUrlState({ length: 60, width: 40, reserved: 400, usable: 85, guests: 150, posted: 0 });
  const r = venueCapacity({ length: s.length, width: s.width, reserved: s.reserved, usablePct: s.usable });
  const capped = (n: number) => (s.posted > 0 ? Math.min(n, s.posted) : n);
  const max = Math.max(1, ...r.rows.map((x) => x.guests));

  return (
    <ToolFrame
      inputs={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="vc-l" label="Room length" suffix="ft" value={s.length} onChange={(n) => set({ length: n })} max={1000} />
            <NumberField id="vc-w" label="Room width" suffix="ft" value={s.width} onChange={(n) => set({ width: n })} max={1000} />
          </div>
          <NumberField id="vc-usable" label="Usable floor" suffix="%" step={5} min={30} max={100} value={s.usable} onChange={(n) => set({ usable: n })} hint="Take off columns, doorways, fireplaces and odd corners." />
          <NumberField id="vc-reserved" label="Space for dance floor, bar, buffet, stage" suffix="sq ft" step={50} max={20000} value={s.reserved} onChange={(n) => set({ reserved: n })} hint="Use the tent size calculator for a breakdown, or 0 for seating only." />
          <NumberField id="vc-guests" label="Your guest count" value={s.guests} onChange={(n) => set({ guests: n })} max={5000} step={5} />
          <NumberField id="vc-posted" label="Posted occupancy limit (if you know it)" value={s.posted} onChange={(n) => set({ posted: n })} max={10000} step={10} hint="The fire marshal's limit on the venue's sign or contract always wins. 0 = unknown." />
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={r.gross.toLocaleString()} label="Room square feet" />
            <Stat big value={r.usable.toLocaleString()} label="Usable for guests" note="After your deductions" />
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm font-medium">Guests this room holds, by layout</p>
            <ul className="mt-4 space-y-4">
              {r.rows.map((row) => {
                const n = capped(row.guests);
                const fits = n >= s.guests;
                return (
                  <li key={row.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span>{row.label} <span className="text-muted">({row.sqft} sq ft each)</span></span>
                      <span className="shrink-0 tabular-nums font-medium">{n}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className={`h-full rounded-full ${fits ? "bg-gold" : "bg-rose"}`} style={{ width: `${(row.guests / max) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{fits ? `Fits your ${s.guests} guests` : `${s.guests - n} over for this layout`}</p>
                  </li>
                );
              })}
            </ul>
            {s.posted > 0 && <p className="mt-4 text-xs text-muted">Capped at the posted limit of {s.posted}.</p>}
          </div>
          {floorPlanHref && (
            <p className="mt-4 text-sm">
              Want to see it? <Link href={floorPlanHref} className="link">Drag tables into this room in the floor plan builder</Link>.
            </p>
          )}
          <ShareBar tool="venue-capacity" quoteHref={`/quote?guests=${s.guests}&from=tool-venue-capacity`} />
        </div>
      }
    />
  );
}
