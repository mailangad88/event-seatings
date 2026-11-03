"use client";

import { barPlan } from "@/lib/tools/calc";
import { NumberField, PriceLines, ShareBar, Stat, ToolFrame, Toggles, useUrlState, type ToolPrice } from "./controls";

const glassName: Record<string, string> = {
  "wine-glass": "Wine glasses",
  "pilsner-glass": "Beer glasses",
  "rocks-glass": "Rocks glasses",
  "highball-glass": "Highball glasses",
  "champagne-flute": "Champagne flutes",
  "water-goblet": "Water goblets",
};

export function BarTool({ prices }: { prices: Record<string, ToolPrice> }) {
  const [s, set] = useUrlState({ guests: 120, hours: 5, first: 2, later: 1, wine: 40, beer: 30, cocktails: 20, soft: 10, glasses: 1.5, extras: ["toast", "water"], ice: 1.5, bartender: 75 });
  const r = barPlan({
    guests: s.guests,
    hours: s.hours,
    firstHour: s.first,
    laterHours: s.later,
    mix: { wine: s.wine, beer: s.beer, cocktails: s.cocktails, soft: s.soft },
    glassesPerGuest: s.glasses,
    toast: s.extras.includes("toast"),
    water: s.extras.includes("water"),
    icePerGuest: s.ice,
    guestsPerBartender: s.bartender,
  });
  const glassLines = Object.entries(r.glassware).filter(([, q]) => q > 0).map(([id, qty]) => ({ id, qty }));
  const bars = r.bartenders ? Math.max(1, Math.ceil(r.bartenders / 2)) : 0;

  return (
    <ToolFrame
      inputs={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="bar-guests" label="Guests of drinking age" value={s.guests} onChange={(n) => set({ guests: n })} max={5000} step={5} />
            <NumberField id="bar-hours" label="Hours the bar is open" value={s.hours} onChange={(n) => set({ hours: n })} min={1} max={12} />
            <NumberField id="bar-first" label="Drinks per guest, first hour" value={s.first} onChange={(n) => set({ first: n })} step={0.5} max={5} />
            <NumberField id="bar-later" label="Drinks per guest, each hour after" value={s.later} onChange={(n) => set({ later: n })} step={0.5} max={5} />
          </div>
          <p className="-mt-3 text-sm text-muted">Two drinks in the first hour and one an hour after is a common planning rule, not a measurement. Adjust it for your crowd.</p>
          <fieldset>
            <legend className="label">What people will drink (share of drinks)</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField id="bar-wine" label="Wine" suffix="%" step={5} max={100} value={s.wine} onChange={(n) => set({ wine: n })} />
              <NumberField id="bar-beer" label="Beer" suffix="%" step={5} max={100} value={s.beer} onChange={(n) => set({ beer: n })} />
              <NumberField id="bar-cocktails" label="Cocktails and spirits" suffix="%" step={5} max={100} value={s.cocktails} onChange={(n) => set({ cocktails: n })} />
              <NumberField id="bar-soft" label="Soft drinks and mocktails" suffix="%" step={5} max={100} value={s.soft} onChange={(n) => set({ soft: n })} />
            </div>
            <p className="hint">Doesn&apos;t need to add up to 100: we scale it.</p>
          </fieldset>
          <NumberField id="bar-glasses" label="Glasses per guest for each drink served" value={s.glasses} onChange={(n) => set({ glasses: n })} step={0.5} min={1} max={4} hint="1 if the bar washes and reuses glasses; more if it doesn't. Ask your caterer." />
          <Toggles label="Also" value={s.extras} options={[{ id: "toast", label: "Champagne toast" }, { id: "water", label: "Water glass at every seat" }]} onChange={(v) => set({ extras: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="bar-ice" label="Ice per guest" suffix="lb" step={0.5} max={5} value={s.ice} onChange={(n) => set({ ice: n })} hint="Go higher on hot days." />
            <NumberField id="bar-tender" label="Guests per bartender" step={5} min={10} max={200} value={s.bartender} onChange={(n) => set({ bartender: n })} hint="Your staffing choice. Fewer means shorter lines." />
          </div>
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={r.drinks.toLocaleString()} label="Drinks in total" note={`${r.perGuest} per guest over ${s.hours} hours`} />
            <Stat big value={r.bartenders} label="Bartenders" note={`About ${bars} bar${bars === 1 ? "" : "s"} at two bartenders each`} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <Stat value={r.wineBottles} label="Bottles of wine" note={`${r.wineDrinks} glasses`} />
            <Stat value={r.beer} label="Beers" />
            <Stat value={r.spiritBottles} label="Bottles of spirits" note={`${r.cocktailDrinks} drinks, 750 ml`} />
            <Stat value={`${r.iceLbs} lb`} label="Ice" />
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm font-medium">Glassware to rent</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {glassLines.map((l) => (
                <li key={l.id} className="flex justify-between py-2"><span>{glassName[l.id]}</span><span className="tabular-nums">{l.qty}</span></li>
              ))}
            </ul>
          </div>
          <PriceLines lines={[...glassLines, { id: "portable-bar", qty: bars }]} prices={prices} />
          <p className="mt-4 text-xs leading-5 text-muted">Please serve responsibly. Check your venue&apos;s and your town&apos;s rules on serving alcohol; many venues require a licensed bartender or caterer.</p>
          <ShareBar tool="bar" quoteHref={`/quote?items=${[...glassLines.map((l) => l.id), "portable-bar"].join(",")}&guests=${s.guests}&from=tool-bar`} />
        </div>
      }
    />
  );
}
