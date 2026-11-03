"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { useFeatureValue } from "@/lib/experiments";

// Small shared inputs and result blocks for the /tools calculators.

type Val = string | number | boolean | string[];

/** State that mirrors itself into the page URL, so a result can be shared or bookmarked. */
type Widen<T> = { [K in keyof T]: T[K] extends boolean ? boolean : T[K] extends number ? number : T[K] extends string ? string : T[K] };

export function useUrlState<D extends Record<string, Val>>(defaults: D): [Widen<D>, (patch: Partial<Widen<D>>) => void] {
  type T = Widen<D>;
  const [state, setState] = useState<T>(defaults as T);
  const ready = useRef(false);
  const initial = useRef(defaults);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const next = { ...defaults } as T;
    for (const [k, d] of Object.entries(defaults)) {
      const raw = sp.get(k);
      if (raw === null) continue;
      const v: Val = Array.isArray(d) ? (raw ? raw.split(",") : []) : typeof d === "number" ? Number(raw) : typeof d === "boolean" ? raw === "1" : raw;
      if (typeof v === "number" && !Number.isFinite(v)) continue;
      (next as Record<string, Val>)[k] = v;
    }
    // Restoring shared state from the URL once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(next);
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const sp = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(state)) {
      const d = (initial.current as Record<string, Val>)[k];
      const s = Array.isArray(v) ? v.join(",") : typeof v === "boolean" ? (v ? "1" : "0") : String(v);
      const ds = Array.isArray(d) ? d.join(",") : typeof d === "boolean" ? (d ? "1" : "0") : String(d);
      if (s === ds) sp.delete(k);
      else sp.set(k, s);
    }
    const q = sp.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`);
  }, [state]);

  return [state, (patch) => setState((s) => ({ ...s, ...patch }))];
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 1,
  suffix,
  hint,
  id,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Less ${label}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-lg hover:border-gold" onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}>−</button>
        <div className="relative flex-1">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={Number.isFinite(value) ? value : ""}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
            className="field pr-14 text-center tabular-nums"
          />
          {suffix && <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
        </div>
        <button type="button" aria-label={`More ${label}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-lg hover:border-gold" onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}>+</button>
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function Choice<K extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: K;
  options: { id: K; label: string; note?: string }[];
  onChange: (k: K) => void;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            title={o.note}
            onClick={() => onChange(o.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${value === o.id ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:border-gold"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Toggles({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: { id: string; label: string }[];
  onChange: (v: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-gold bg-gold-soft text-ink" : "border-line bg-surface hover:border-gold"}`}
            >
              {on ? "✓ " : "+ "}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Stat({ value, label, note, big = false }: { value: React.ReactNode; label: string; note?: React.ReactNode; big?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className={`font-serif tabular-nums ${big ? "text-5xl" : "text-3xl"}`}>{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      {note && <p className="mt-1 text-xs leading-5 text-muted">{note}</p>}
    </div>
  );
}

/** Two-column tool frame: inputs on the left, sticky results on the right. */
export function ToolFrame({ inputs, results }: { inputs: React.ReactNode; results: React.ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
      <div className="card space-y-7 p-6 sm:p-8">{inputs}</div>
      <div className="lg:sticky lg:top-24 lg:self-start" aria-live="polite">
        {results}
      </div>
    </div>
  );
}

export function ShareBar({ tool, quoteHref }: { tool: string; quoteHref?: string }) {
  const [copied, setCopied] = useState(false);
  // A/B test (GrowthBook feature "tool-quote-cta"): the label on the main button under every calculator.
  const ctaLabel = useFeatureValue("tool-quote-cta", "Price these rentals");
  return (
    <div className="mt-6 flex flex-wrap gap-3 print:hidden">
      {quoteHref && (
        <Link href={quoteHref} className="btn-accent" onClick={() => track("tool_quote_click", { tool, label: ctaLabel })}>
          {ctaLabel}
        </Link>
      )}
      <button
        type="button"
        className="btn-ghost"
        onClick={async () => {
          await navigator.clipboard?.writeText(window.location.href).catch(() => {});
          setCopied(true);
          track("tool_share", { tool });
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Link copied" : "Copy link to this result"}
      </button>
      <button type="button" className="btn-ghost" onClick={() => window.print()}>
        Print
      </button>
    </div>
  );
}

export type ToolPrice = { id: string; name: string; price: number; unit: string; estimated: boolean };

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Rough cost of the counted items at catalog prices (items only). */
export function PriceLines({ lines, prices }: { lines: { id: string; qty: number }[]; prices: Record<string, ToolPrice> }) {
  const rows = lines.filter((l) => l.qty > 0 && prices[l.id]).map((l) => ({ ...prices[l.id], qty: l.qty, total: prices[l.id].price * l.qty }));
  if (!rows.length) return null;
  const total = rows.reduce((a, r) => a + r.total, 0);
  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm font-medium">Rough rental cost at our catalog prices</p>
      <table className="mt-3 w-full text-sm">
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="py-2 pr-2">
                {r.qty} × {r.name}
                {r.estimated && <span className="ml-1 text-xs text-muted">(estimate)</span>}
              </td>
              <td className="py-2 text-right tabular-nums">{money(r.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="pt-3 font-medium">Items total</td>
            <td className="pt-3 text-right font-medium tabular-nums">{money(total)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-3 text-xs leading-5 text-muted">
        Items only, before delivery, setup and fees. Prices are based on local rental companies&apos; published rates plus our booking fee; the rental company confirms the final quote for your date.
      </p>
    </div>
  );
}
