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
    `rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-bold lowercase transition-all ${
      active ? "bg-ink text-white shadow-[2px_2px_0_0_var(--accent)]" : "bg-surface hover:bg-butter"
    }`;

  return (
    <div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-14 text-sm font-bold">vibe</span>
          <button className={pill(!style)} onClick={() => setStyle(null)}>All</button>
          {allStyles.map((s) => (
            <button key={s} className={pill(style === s)} onClick={() => setStyle(style === s ? null : s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 w-14 text-sm font-bold">use</span>
          <button className={pill(!use)} onClick={() => setUse(null)}>All</button>
          {allUses.map((u) => (
            <button key={u} className={pill(use === u)} onClick={() => setUse(use === u ? null : u)}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm font-bold">{shown.length} chairs</p>
      <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <ChairCard key={c.slug} chair={c} />
        ))}
      </div>
      {shown.length === 0 && (
        <p className="mt-10 text-center text-muted">nothing matches both filters (yet). try clearing one.</p>
      )}
    </div>
  );
}
