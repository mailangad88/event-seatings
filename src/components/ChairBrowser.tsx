"use client";

import { useState } from "react";
import { allStyles, allUses, chairs, type EventUse, type Style } from "@/data/chairs";
import { ChairCard } from "./ChairCard";

export function ChairBrowser({ initialStyle = null }: { initialStyle?: Style | null }) {
  const [style, setStyle] = useState<Style | null>(initialStyle);
  const [use, setUse] = useState<EventUse | null>(null);

  const shown = chairs.filter(
    (c) => (!style || c.styles.includes(style)) && (!use || c.uses.includes(use)),
  );

  const pill = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
      active ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
    }`;

  return (
    <div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-20 text-xs font-semibold uppercase tracking-wider text-muted">Style</span>
          <button className={pill(!style)} onClick={() => setStyle(null)}>All</button>
          {allStyles.map((s) => (
            <button key={s} className={pill(style === s)} onClick={() => setStyle(style === s ? null : s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-20 text-xs font-semibold uppercase tracking-wider text-muted">Use</span>
          <button className={pill(!use)} onClick={() => setUse(null)}>All</button>
          {allUses.map((u) => (
            <button key={u} className={pill(use === u)} onClick={() => setUse(use === u ? null : u)}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">{shown.length} chairs</p>
      <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <ChairCard key={c.slug} chair={c} />
        ))}
      </div>
      {shown.length === 0 && (
        <p className="mt-10 text-center text-muted">No chairs match both filters yet. Try clearing one.</p>
      )}
    </div>
  );
}
