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
        className="rounded-full border border-line p-2"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
        </svg>
      </button>
      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-line bg-bg px-4 pb-5 shadow-sm"
        >
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="block border-b border-line py-3 text-base" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary mt-4 w-full" onClick={() => setOpen(false)}>
            Get a Quote
          </Link>
        </nav>
      )}
    </div>
  );
}
