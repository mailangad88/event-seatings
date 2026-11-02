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

  const option = (active: boolean) => (active ? "chip-active" : "chip transition-colors hover:border-ink hover:text-ink");

  return (
    <div>
      <div className="well space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-sm font-semibold">Style</span>
          <button className={option(!style)} onClick={() => setStyle(null)}>All</button>
          {allStyles.map((s) => (
            <button key={s} className={option(style === s)} onClick={() => setStyle(style === s ? null : s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-sm font-semibold">Occasion</span>
          <button className={option(!use)} onClick={() => setUse(null)}>All</button>
          {allUses.map((u) => (
            <button key={u} className={option(use === u)} onClick={() => setUse(use === u ? null : u)}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted">
        {shown.length} {shown.length === 1 ? "chair" : "chairs"}
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
