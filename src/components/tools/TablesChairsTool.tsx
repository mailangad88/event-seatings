"use client";

import { extraTables, tableTypes, tablesAndChairs, type TableType } from "@/lib/tools/calc";
import { Choice, NumberField, PriceLines, ShareBar, Stat, ToolFrame, Toggles, useUrlState, type ToolPrice } from "./controls";

const label = (id: string) => (id === "cocktail-highboy" ? "Cocktail highboy" : tableTypes[id as TableType].label);

export function TablesChairsTool({ prices }: { prices: Record<string, ToolPrice> }) {
  const [s, set] = useUrlState({ guests: 120, table: "round-60", per: 8, ceremony: false, cocktail: true, highboy: 8, extras: ["head", "gifts", "cake", "dj"], spare: 3, chair: "white-folding" });
  const table = (s.table in tableTypes ? s.table : "round-60") as TableType;
  const r = tablesAndChairs({ guests: s.guests, table, perTable: s.per, ceremony: s.ceremony, cocktail: s.cocktail, guestsPerHighboy: s.highboy, extras: s.extras, sparePct: s.spare });
  const lines = [
    ...[...r.tableCounts.entries()].map(([id, qty]) => ({ id, qty })),
    { id: s.chair, qty: r.receptionChairs + r.ceremonyChairs },
  ];

  return (
    <ToolFrame
      inputs={
        <>
          <NumberField id="tc-guests" label="Guests" value={s.guests} onChange={(n) => set({ guests: n })} max={3000} step={5} />
          <Choice
            label="Guest tables"
            value={table}
            options={(Object.keys(tableTypes) as TableType[]).map((k) => ({ id: k, label: tableTypes[k].label }))}
            onChange={(k) => set({ table: k, per: tableTypes[k].seats })}
          />
          <NumberField id="tc-per" label="Guests per table" value={s.per} onChange={(n) => set({ per: n })} min={2} max={tableTypes[table].max} hint={`${tableTypes[table].label} seats ${tableTypes[table].seats} comfortably, ${tableTypes[table].max} at most.`} />
          <Choice label="Chairs" value={s.chair} options={[{ id: "white-folding", label: "White folding" }, { id: "gold-chiavari", label: "Gold Chiavari" }]} onChange={(k) => set({ chair: k })} />
          <Toggles label="Extra tables" value={s.extras} options={extraTables.map((e) => ({ id: e.id, label: e.label }))} onChange={(v) => set({ extras: v })} />
          <Toggles
            label="Other parts of the day"
            value={[...(s.ceremony ? ["ceremony"] : []), ...(s.cocktail ? ["cocktail"] : [])]}
            options={[{ id: "ceremony", label: "Separate ceremony seating" }, { id: "cocktail", label: "Cocktail hour highboys" }]}
            onChange={(v) => set({ ceremony: v.includes("ceremony"), cocktail: v.includes("cocktail") })}
          />
          {s.cocktail && <NumberField id="tc-highboy" label="Guests per highboy" value={s.highboy} onChange={(n) => set({ highboy: n })} min={4} max={20} hint="Fewer guests per table feels more relaxed." />}
          <NumberField id="tc-spare" label="Spare chairs" suffix="%" value={s.spare} onChange={(n) => set({ spare: n })} max={20} />
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={r.guestTables} label={`${tableTypes[table].label} guest tables`} note={r.emptySeats ? `${r.emptySeats} empty seat${r.emptySeats === 1 ? "" : "s"} across all tables` : "Every seat filled"} />
            <Stat big value={r.receptionChairs + r.ceremonyChairs} label="Chairs in total" note={r.ceremonyChairs ? `${r.receptionChairs} reception + ${r.ceremonyChairs} ceremony` : "Includes spares"} />
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm font-medium">Table order</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {[...r.tableCounts.entries()].map(([id, qty]) => (
                <li key={id} className="flex justify-between py-2">
                  <span>{label(id)}</span>
                  <span className="tabular-nums">{qty}</span>
                </li>
              ))}
            </ul>
            {r.extras.length > 0 && <p className="mt-3 text-xs leading-5 text-muted">Includes {r.extras.map((e) => `${e.count} for the ${e.label.toLowerCase().replace(/ \(.*\)/, "")}`).join(", ")}.</p>}
          </div>
          <PriceLines lines={lines} prices={prices} quoteHref={`/quote?items=${encodeURIComponent([...r.tableCounts.keys(), s.chair].join(","))}&guests=${s.guests}&from=tool-tables-and-chairs`} />
          <ShareBar tool="tables-and-chairs" quoteHref={`/quote?items=${encodeURIComponent([...r.tableCounts.keys(), s.chair].join(","))}&guests=${s.guests}&from=tool-tables-and-chairs`} />
        </div>
      }
    />
  );
}
