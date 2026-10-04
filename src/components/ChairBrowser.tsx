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

  const option = (active: boolean) =>
    `border-b pb-1 text-[11px] tracking-[0.2em] uppercase transition-colors ${
      active ? "border-gold text-ink" : "border-transparent text-muted hover:text-ink"
    }`;

  return (
    <div>
      <div className="space-y-5 border-y border-line py-6">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <span className="w-24 font-serif text-lg text-gold italic">Aesthetic</span>
          <button className={option(!style)} onClick={() => setStyle(null)}>All</button>
          {allStyles.map((s) => (
            <button key={s} className={option(style === s)} onClick={() => setStyle(style === s ? null : s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <span className="w-24 font-serif text-lg text-gold italic">Occasion</span>
          <button className={option(!use)} onClick={() => setUse(null)}>All</button>
          {allUses.map((u) => (
            <button key={u} className={option(use === u)} onClick={() => setUse(use === u ? null : u)}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-[11px] tracking-[0.2em] text-muted uppercase">
        {shown.length} {shown.length === 1 ? "piece" : "pieces"}
      </p>
      <div className="mt-8 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <ChairCard key={c.slug} chair={c} index={chairs.indexOf(c)} />
        ))}
      </div>
      {shown.length === 0 && (
        <p className="mt-10 text-center font-serif text-2xl text-muted italic">
          No pieces match both selections. Try clearing one.
        </p>
      )}
    </div>
  );
}
