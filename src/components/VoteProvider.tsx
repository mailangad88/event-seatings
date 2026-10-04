"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Anonymous "I want this chair" votes. Each browser gets a random visitor id
// so one person counts once per chair, without asking them to sign up.

type VoteState = {
  counts: Record<string, number>;
  mine: Set<string>;
  toggle: (slug: string) => void;
};

const VoteContext = createContext<VoteState | null>(null);

function visitorId() {
  try {
    let id = localStorage.getItem("es_visitor");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("es_visitor", id);
    }
    return id;
  } catch {
    return null;
  }
}

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = visitorId();
    fetch(`/api/votes${id ? `?visitor=${id}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        setCounts(d.counts ?? {});
        setMine(new Set(d.mine ?? []));
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const id = visitorId();
      if (!id) return;
      const on = !mine.has(slug);
      setMine((prev) => {
        const next = new Set(prev);
        if (on) next.add(slug);
        else next.delete(slug);
        return next;
      });
      setCounts((prev) => ({ ...prev, [slug]: Math.max(0, (prev[slug] ?? 0) + (on ? 1 : -1)) }));
      fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chair: slug, visitor: id, on }),
      }).catch(() => {});
    },
    [mine],
  );

  return <VoteContext.Provider value={{ counts, mine, toggle }}>{children}</VoteContext.Provider>;
}

export function useVotes() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error("useVotes must be used inside VoteProvider");
  return ctx;
}

export function VoteButton({ slug, size = "sm" }: { slug: string; size?: "sm" | "lg" }) {
  const { counts, mine, toggle } = useVotes();
  const on = mine.has(slug);
  const count = counts[slug] ?? 0;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={on}
      className={`inline-flex items-center gap-2 transition-colors duration-300 ${
        size === "lg"
          ? `border px-6 py-4 text-[11px] font-medium tracking-[0.22em] uppercase ${
              on ? "border-gold bg-gold text-[#0a0806]" : "border-gold/70 text-ink hover:bg-gold hover:text-[#0a0806]"
            }`
          : `rounded-full bg-espresso/70 px-3 py-2 text-[10px] tracking-[0.18em] uppercase backdrop-blur ${
              on ? "text-gold" : "text-ink hover:text-gold"
            }`
      }`}
    >
      <svg width={size === "lg" ? 15 : 13} height={size === "lg" ? 15 : 13} viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 21s-7.5-4.6-9.5-9.1C1.1 8.6 3.3 5 6.9 5c2 0 3.6 1.1 5.1 2.9C13.5 6.1 15.1 5 17.1 5c3.6 0 5.8 3.6 4.4 6.9C19.5 16.4 12 21 12 21z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      {size === "lg" ? (on ? "On your wishlist" : "Add to wishlist") : on ? "Saved" : "Save"}
      {count > 0 && <span className="tabular-nums opacity-60">{count}</span>}
    </button>
  );
}
