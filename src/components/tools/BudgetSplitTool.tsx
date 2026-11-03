"use client";

import { useState } from "react";
import { budgetPresets, rebalance, type BudgetLine } from "@/lib/tools/calc";
import { Choice, NumberField, ShareBar, Stat, ToolFrame, money, useUrlState } from "./controls";

const palette = ["var(--gold)", "var(--sage)", "var(--rose)", "var(--ink)", "var(--gold-bright)", "var(--muted)", "#6d7f95", "#a07a5a"];

function decode(raw: string, preset: string): BudgetLine[] {
  const base = budgetPresets[preset]?.lines ?? budgetPresets.wedding.lines;
  if (!raw) return base;
  const nums = raw.split(".").map(Number);
  if (nums.length !== base.length || nums.some((n) => !Number.isFinite(n)) || nums.reduce((a, b) => a + b, 0) !== 100) return base;
  return base.map((l, i) => ({ ...l, pct: nums[i] }));
}

export function BudgetSplitTool() {
  const [s, set] = useUrlState({ preset: "wedding", total: 30000, guests: 120, split: "", hosts: 2, shares: "50.50" });
  const [locked, setLocked] = useState<string[]>([]);
  const lines = decode(s.split, s.preset);
  const setLines = (next: BudgetLine[]) => set({ split: next.map((l) => l.pct).join(".") });
  const hostShares = s.shares.split(".").map(Number).slice(0, s.hosts);
  const shares = hostShares.length === s.hosts && hostShares.reduce((a, b) => a + b, 0) === 100 ? hostShares : Array.from({ length: s.hosts }, (_, i) => Math.floor(100 / s.hosts) + (i < 100 % s.hosts ? 1 : 0));

  // Donut segments
  const segs = lines.map((l, i) => ({ ...l, start: lines.slice(0, i).reduce((a, x) => a + x.pct, 0), color: palette[i % palette.length] }));

  return (
    <ToolFrame
      inputs={
        <>
          <Choice label="Event" value={s.preset} options={Object.entries(budgetPresets).map(([id, p]) => ({ id, label: p.label }))} onChange={(k) => { setLocked([]); set({ preset: k, split: "" }); }} />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="bs-total" label="Total budget" suffix="$" step={500} max={10_000_000} value={s.total} onChange={(n) => set({ total: n })} />
            <NumberField id="bs-guests" label="Guests" step={5} max={5000} value={s.guests} onChange={(n) => set({ guests: n })} />
          </div>
          <fieldset>
            <legend className="label">Split by category</legend>
            <p className="hint -mt-1 mb-3">Starting splits are a placeholder, not survey data. Drag to match your priorities; the others adjust so it always adds to 100%. Lock a line to hold it.</p>
            <ul className="space-y-4">
              {segs.map((l) => (
                <li key={l.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label htmlFor={`bs-${l.id}`} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: l.color }} aria-hidden />
                      {l.label}
                    </label>
                    <span className="flex items-center gap-3">
                      <span className="tabular-nums">{l.pct}%</span>
                      <button type="button" className="text-xs text-muted underline" aria-pressed={locked.includes(l.id)} onClick={() => setLocked(locked.includes(l.id) ? locked.filter((x) => x !== l.id) : [...locked, l.id])}>
                        {locked.includes(l.id) ? "Unlock" : "Lock"}
                      </button>
                    </span>
                  </div>
                  <input id={`bs-${l.id}`} type="range" min={0} max={100} value={l.pct} disabled={locked.includes(l.id)} onChange={(e) => setLines(rebalance(lines, l.id, Number(e.target.value), locked))} className="mt-1 w-full accent-[var(--gold)]" />
                </li>
              ))}
            </ul>
            <button type="button" className="mt-3 text-sm link" onClick={() => { setLocked([]); set({ split: "" }); }}>Reset to the starting split</button>
          </fieldset>
          <fieldset className="border-t border-line pt-6">
            <legend className="label">Split between hosts</legend>
            <NumberField id="bs-hosts" label="How many people or families are paying?" min={1} max={6} value={s.hosts} onChange={(n) => set({ hosts: n, shares: "" })} />
            {s.hosts > 1 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {shares.map((p, i) => (
                  <NumberField
                    key={i}
                    id={`bs-h${i}`}
                    label={`Host ${i + 1} share`}
                    suffix="%"
                    step={5}
                    max={100}
                    value={p}
                    onChange={(n) => {
                      const next = [...shares];
                      next[i] = n;
                      const rest = 100 - n;
                      const others = next.map((_, j) => j).filter((j) => j !== i);
                      others.forEach((j, k) => (next[j] = Math.floor(rest / others.length) + (k < rest % others.length ? 1 : 0)));
                      set({ shares: next.join(".") });
                    }}
                  />
                ))}
              </div>
            )}
          </fieldset>
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={money(s.total)} label="Total budget" />
            <Stat big value={money(s.guests ? s.total / s.guests : 0)} label="Per guest" />
          </div>
          <figure className="mt-6 flex flex-col items-center gap-6 rounded-2xl border border-line bg-surface p-5 sm:flex-row">
            <svg viewBox="0 0 42 42" className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-labelledby="bs-t">
              <title id="bs-t">{`Budget split: ${lines.map((l) => `${l.label} ${l.pct}%`).join(", ")}`}</title>
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--surface-2)" strokeWidth="6" />
              {segs.map((g) => (
                <circle key={g.id} cx="21" cy="21" r="15.915" fill="none" stroke={g.color} strokeWidth="6" strokeDasharray={`${g.pct} ${100 - g.pct}`} strokeDashoffset={-g.start} />
              ))}
            </svg>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {segs.map((g) => (
                  <tr key={g.id}>
                    <td className="py-1.5 pr-2">{g.label}</td>
                    <td className="py-1.5 text-right tabular-nums">{money((s.total * g.pct) / 100)}</td>
                    <td className="py-1.5 pl-3 text-right text-muted tabular-nums">{money(s.guests ? (s.total * g.pct) / 100 / s.guests : 0)}/guest</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
          {s.hosts > 1 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {shares.map((p, i) => (
                <Stat key={i} value={money((s.total * p) / 100)} label={`Host ${i + 1} pays`} note={`${p}% of the total`} />
              ))}
            </div>
          )}
          <ShareBar tool="budget-splitter" quoteHref={`/quote?guests=${s.guests}&from=tool-budget-splitter`} />
        </div>
      }
    />
  );
}
