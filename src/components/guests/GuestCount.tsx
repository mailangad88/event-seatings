"use client";

import { useId, useState } from "react";
import { Icon } from "../ui/Icon";

// A small, always-visible guest count: minus, a number you can type in, plus.
// Typing only takes effect when you leave the box or press Enter, so "120" doesn't pass through 1 and 12 on the way.
const stepFor = (n: number, dir: 1 | -1) => {
  if (n < 20 || (n === 20 && dir < 0)) return Math.max(1, n + dir);
  // Round to the next multiple of 5 in that direction.
  const next = dir > 0 ? Math.floor(n / 5) * 5 + 5 : Math.ceil(n / 5) * 5 - 5;
  return next;
};

export function GuestCount({
  value,
  onChange,
  max = 2000,
  label = "Guests",
  size = "md",
  className = "",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  // What's being typed, until it's committed; otherwise the box shows the current count.
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (n: number) => {
    if (!Number.isFinite(n) || n <= 0) return setDraft(null); // empty or nonsense: keep the current count
    const v = Math.max(1, Math.min(max, Math.round(n) || 1));
    setDraft(null);
    if (v !== value) onChange(v);
  };
  const btn = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className={`flex items-center gap-1 font-medium ${size === "sm" ? "text-xs" : "text-sm"}`}>
        <Icon name="users" size={size === "sm" ? 14 : 16} className="text-gold" />
        {label}
      </label>
      <div className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 shadow-soft">
        <button type="button" aria-label="Fewer guests" disabled={value <= 1} onClick={() => commit(stepFor(value, -1))} className={`grid ${btn} shrink-0 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-40`}>
          <Icon name="minus" size={14} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={draft ?? String(value)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft !== null && commit(Number(draft))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft !== null) commit(Number(draft));
            }
          }}
          onFocus={(e) => e.currentTarget.select()}
          className={`${size === "sm" ? "h-7 w-11 text-sm" : "h-9 w-14 text-base"} min-w-0 bg-transparent text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
        />
        <button type="button" aria-label="More guests" disabled={value >= max} onClick={() => commit(stepFor(value, 1))} className={`grid ${btn} shrink-0 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-40`}>
          <Icon name="plus" size={14} />
        </button>
      </div>
    </div>
  );
}
