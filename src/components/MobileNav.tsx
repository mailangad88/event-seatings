"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl border-2 border-ink bg-surface p-2 shadow-[2px_2px_0_0_var(--ink)]"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h9" />}
        </svg>
      </button>
      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b-2 border-ink bg-bg px-4 pt-2 pb-6"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b-2 border-dashed border-ink/15 py-3.5 font-serif text-2xl font-extrabold lowercase"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary mt-5 w-full py-3 text-base" onClick={() => setOpen(false)}>
            get a quote →
          </Link>
        </nav>
      )}
    </div>
  );
}
