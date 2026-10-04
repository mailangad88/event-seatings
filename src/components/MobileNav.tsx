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
        className="p-2"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 8h18M3 16h18" />}
        </svg>
      </button>
      {open && (
        <nav aria-label="Mobile" className="absolute inset-x-0 top-full border-b border-line bg-bg px-4 pt-2 pb-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-line py-4 font-serif text-3xl font-light"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary mt-6 w-full" onClick={() => setOpen(false)}>
            Request a quote
          </Link>
        </nav>
      )}
    </div>
  );
}
