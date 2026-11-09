"use client";

import { clothFor, drops, linenTables, type Drop, type LinenTable } from "@/lib/tools/calc";
import { Choice, NumberField, PriceLines, ShareBar, Stat, ToolFrame, Toggles, useUrlState, type ToolPrice } from "./controls";

// Catalog linens we can price, by table shape and drop.
const priceId = (table: LinenTable, drop: Drop) => {
  if (table === "highboy-30") return "spandex-highboy";
  const shape = table.startsWith("round") ? "round" : "banquet";
  return `${shape}-${drop === "floor" ? "floor" : "lap"}-length`;
};

function DropDiagram({ drop }: { drop: Drop }) {
  const h = { lap: 22, half: 32, floor: 70 }[drop];
  return (
    <svg viewBox="0 0 220 110" role="img" aria-labelledby="drop-t" className="w-full max-w-xs">
      <title id="drop-t">{`Side view of a table with a ${drops[drop].label.toLowerCase()} tablecloth`}</title>
      <line x1="10" y1="100" x2="210" y2="100" stroke="var(--line)" strokeWidth="2" />
      <rect x="50" y="28" width="120" height="6" fill="var(--ink)" />
      <rect x="58" y="34" width="5" height="66" fill="var(--muted)" />
      <rect x="157" y="34" width="5" height="66" fill="var(--muted)" />
      <path d={`M44 26 H176 V${26 + h} H44 Z`} fill="var(--gold)" opacity="0.35" />
      <text x="190" y={30 + h / 2} fontSize="11" fill="var(--muted)">{drops[drop].inches}&quot;</text>
    </svg>
  );
}

export function LinensTool({ prices }: { prices: Record<string, ToolPrice> }) {
  const [s, set] = useUrlState({ table: "round-60", drop: "floor", tables: 15, guests: 120, napkinSpare: 10, extras: ["napkins", "runners"] });
  const table = (s.table in linenTables ? s.table : "round-60") as LinenTable;
  const drop = (s.drop in drops ? s.drop : "floor") as Drop;
  const c = clothFor(table, drop);
  const napkins = s.extras.includes("napkins") ? Math.ceil(s.guests * (1 + s.napkinSpare / 100)) : 0;
  const runners = s.extras.includes("runners") ? s.tables : 0;
  const lines = [
    { id: priceId(table, drop), qty: s.tables },
    { id: "cloth-napkins", qty: napkins },
    { id: "table-runner", qty: runners },
  ];

  return (
    <ToolFrame
      inputs={
        <>
          <Choice label="Table" value={table} options={(Object.keys(linenTables) as LinenTable[]).map((k) => ({ id: k, label: linenTables[k].label }))} onChange={(k) => set({ table: k })} />
          <Choice label="Drop" value={drop} options={(Object.keys(drops) as Drop[]).map((k) => ({ id: k, label: drops[k].label, note: drops[k].note }))} onChange={(k) => set({ drop: k })} />
          <p className="-mt-4 text-sm text-muted">{drops[drop].note}</p>
          <NumberField id="ln-tables" label="How many of these tables" value={s.tables} onChange={(n) => set({ tables: n })} max={500} />
          <Toggles label="Also count" value={s.extras} options={[{ id: "napkins", label: "Cloth napkins" }, { id: "runners", label: "Table runners" }]} onChange={(v) => set({ extras: v })} />
          {s.extras.includes("napkins") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField id="ln-guests" label="Guests" value={s.guests} onChange={(n) => set({ guests: n })} max={5000} step={5} />
              <NumberField id="ln-spare" label="Spare napkins" suffix="%" value={s.napkinSpare} onChange={(n) => set({ napkinSpare: n })} max={50} />
            </div>
          )}
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={c.size} label={c.spandex ? "Spandex highboy cover" : "Tablecloth size"} note={c.spandex ? "A fitted spandex cover is the usual pick for highboys" : `You need about ${c.need}; this standard size gives a ${c.actualDrop}" drop`} />
            <Stat big value={s.tables} label="Tablecloths" />
            {napkins > 0 && <Stat value={napkins} label="Napkins" note={`${s.guests} guests + ${s.napkinSpare}% spare`} />}
            {runners > 0 && <Stat value={runners} label="Runners" note="One per table" />}
          </div>
          <figure className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <DropDiagram drop={drop} />
            <figcaption className="mt-2 text-xs text-muted">The drop is how far the cloth hangs from the table edge.</figcaption>
          </figure>
          <PriceLines lines={lines} prices={prices} quoteHref={`/quote?items=${lines.filter((l) => l.qty).map((l) => l.id).join(",")}&guests=${s.guests}&from=tool-linens`} />
          <ShareBar tool="linens" quoteHref={`/quote?items=${lines.filter((l) => l.qty).map((l) => l.id).join(",")}&guests=${s.guests}&from=tool-linens`} />
        </div>
      }
    />
  );
}
