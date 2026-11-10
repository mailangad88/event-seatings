"use client";

import { danceFloor } from "@/lib/tools/calc";
import { NumberField, PriceLines, ShareBar, Stat, ToolFrame, useUrlState, type ToolPrice } from "./controls";

function FloorGrid({ w, l }: { w: number; l: number }) {
  const cell = Math.min(28, 320 / Math.max(w, l));
  return (
    <svg viewBox={`0 0 ${l * cell + 2} ${w * cell + 2}`} role="img" aria-labelledby="df-t" className="w-full max-w-sm">
      <title id="df-t">{`Dance floor of ${w} by ${l} panels, each 3 feet square`}</title>
      {Array.from({ length: w * l }, (_, i) => (
        <rect key={i} x={1 + (i % l) * cell} y={1 + Math.floor(i / l) * cell} width={cell - 1} height={cell - 1} fill={(i + Math.floor(i / l)) % 2 ? "var(--surface-2)" : "var(--gold-soft)"} stroke="var(--line)" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

export function DanceFloorTool({ prices }: { prices: Record<string, ToolPrice> }) {
  const [s, set] = useUrlState({ guests: 150, share: 25 });
  const r = danceFloor(s.guests, s.share);
  const w = r.widthFt / 3;
  const l = r.lengthFt / 3;
  return (
    <ToolFrame
      inputs={
        <>
          <NumberField id="df-guests" label="Guests" value={s.guests} onChange={(n) => set({ guests: n })} max={3000} step={5} />
          <NumberField id="df-share" label="Guests on the floor at once" suffix="%" step={5} min={5} max={100} value={s.share} onChange={(n) => set({ share: n })} hint="A crowd that loves to dance: go higher. A dinner crowd: go lower. This is your call, not a statistic." />
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat big value={`${r.widthFt}' x ${r.lengthFt}'`} label="Floor size" />
            <Stat big value={r.panels} label="3' x 3' panels" />
            <Stat big value={r.sqft} label="Square feet" note={`For about ${r.dancers} dancers`} />
          </div>
          <figure className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <FloorGrid w={w} l={l} />
            <figcaption className="mt-2 text-xs text-muted">Each square is one 3&apos; x 3&apos; panel. Edging adds a few inches on every side.</figcaption>
          </figure>
          <PriceLines lines={[{ id: "dance-floor", qty: r.panels }]} prices={prices} quoteHref={`/quote?items=dance-floor&guests=${s.guests}&from=tool-dance-floor`} />
          <ShareBar tool="dance-floor" quoteHref={`/quote?items=dance-floor&guests=${s.guests}&from=tool-dance-floor`} />
        </div>
      }
    />
  );
}
