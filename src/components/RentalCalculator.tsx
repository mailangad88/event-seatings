"use client";

import Image from "next/image";
import Link from "@/components/Link";
import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { ThumbZoom } from "./ui/ThumbZoom";

export type CalcItem = { id: string; name: string; price: number; unit: string; estimated: boolean; image?: string; alt: string };
export type CalcGroup = { id: string; label: string; optional?: string; lines: { item: CalcItem; per: "guest" | "table" | "ten" }[] };

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 100 ? 2 : 0 });

// Guest count in, quantities and a priced list out, then one click into the quote builder with the same list.
export function RentalCalculator({ chairs, groups }: { chairs: CalcItem[]; groups: CalcGroup[] }) {
  const [guests, setGuests] = useState(100);
  const [perTable, setPerTable] = useState(8);
  const [chair, setChair] = useState(chairs[0]?.id ?? "");
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(groups.map((g) => [g.id, !g.optional])));

  const g = Math.max(1, Math.min(2000, Math.floor(guests) || 1));
  const tables = Math.ceil(g / perTable);
  const rows = useMemo(() => {
    const out: { group: string; item: CalcItem; qty: number }[] = [];
    const c = chairs.find((x) => x.id === chair);
    if (c) out.push({ group: "Seating", item: c, qty: g });
    for (const grp of groups) {
      if (!on[grp.id]) continue;
      for (const l of grp.lines) {
        const qty = l.per === "guest" ? g : l.per === "table" ? tables : Math.ceil(g / 10);
        out.push({ group: grp.label, item: l.item, qty });
      }
    }
    return out;
  }, [g, tables, chair, chairs, groups, on]);
  const total = rows.reduce((s, r) => s + r.qty * r.item.price, 0);
  const href = `/quote?guests=${g}&items=${rows.map((r) => r.item.id).join(",")}&from=rental-calculator`;

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <div className="card h-fit space-y-6 p-6 lg:sticky lg:top-28">
        <div>
          <label htmlFor="calc-guests" className="label">Guests</label>
          <input id="calc-guests" type="number" inputMode="numeric" min={1} max={2000} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="field" />
        </div>
        <div>
          <label htmlFor="calc-per" className="label">Guests per table</label>
          <select id="calc-per" className="field" value={perTable} onChange={(e) => setPerTable(Number(e.target.value))}>
            <option value={8}>8 (60-inch round, roomy)</option>
            <option value={10}>10 (60-inch round, snug)</option>
          </select>
        </div>
        <div>
          <label htmlFor="calc-chair" className="label">Chair style</label>
          <select id="calc-chair" className="field" value={chair} onChange={(e) => setChair(e.target.value)}>
            {chairs.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({usd(c.price)})</option>
            ))}
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="label">Include</legend>
          {groups.map((grp) => (
            <label key={grp.id} className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={!!on[grp.id]} onChange={(e) => setOn({ ...on, [grp.id]: e.target.checked })} className="accent-[var(--gold)]" />
              {grp.label}
              {grp.optional && <span className="text-xs text-muted">{grp.optional}</span>}
            </label>
          ))}
        </fieldset>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-muted">
            {g} guests · {tables} tables · {rows.length} items
          </p>
          <p className="text-right">
            <span className="block text-xs text-muted">Rental estimate before delivery, setup and tax</span>
            <span className="font-heading font-semibold text-4xl tabular-nums" aria-live="polite">{usd(total)}</span>
          </p>
        </div>
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
          {rows.map((r) => (
            <li key={r.item.id} className="flex items-center gap-4 p-4">
              {r.item.image ? (
                <ThumbZoom src={r.item.image} alt={r.item.alt} className="h-14 w-14 shrink-0 rounded-xl">
                  <span className="relative block h-14 w-14 overflow-hidden rounded-xl border border-line bg-surface-2">
                    <Image src={r.item.image} alt={r.item.alt} fill sizes="56px" className="object-cover" />
                  </span>
                </ThumbZoom>
              ) : (
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{r.item.name}</span>
                <span className="block text-xs text-muted">
                  {r.group} · {usd(r.item.price)} {r.item.unit}
                  {r.item.estimated ? " · Est." : ""}
                </span>
              </span>
              <span className="text-right tabular-nums">
                <span className="block font-medium">{r.qty.toLocaleString()}</span>
                <span className="block text-xs text-muted">{usd(r.qty * r.item.price)}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href={href} className="btn-primary btn-lg" onClick={() => track("cta_click", { cta: "calculator_to_quote", guests: g })}>
            Price this exact list
          </Link>
          <Link href="/book" className="btn-ghost">Talk it through on a call</Link>
        </div>
        <p className="mt-3 text-xs text-muted">
          Prices are our current one-day rental prices, with no separate booking fee. &quot;Est.&quot; marks an estimate we confirm on your quote.
          Many planners add a few spare plates and glasses for breakage.
        </p>
      </div>
    </div>
  );
}
