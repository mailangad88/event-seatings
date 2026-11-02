"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "./ui/Icon";

export function MobileNav({
  items,
  categories = [],
}: {
  items: { href: string; label: string }[];
  categories?: { id: string; name: string; icon: IconName }[];
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Link href="/quote" className="btn-primary btn-sm">Quote</Link>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center rounded-full border border-line"
      >
        <Icon name={open ? "close" : "menu"} size={20} />
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
          className="absolute inset-x-0 top-full h-[calc(100dvh-72px-36px)] overflow-y-auto border-t border-line bg-bg px-4 pt-4 pb-10"
        >
          {categories.length > 0 && (
            <>
              <p className="eyebrow">Rentals</p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/rentals/${c.id}`} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-3 text-sm font-medium">
                      <Icon name={c.icon} size={18} className="text-gold" />
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <ul className="mt-6 border-t border-line">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex items-center justify-between border-b border-line py-4 font-serif text-2xl">
                  {item.label}
                  <Icon name="arrow" size={18} className="text-gold" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/quote" className="btn-primary btn-lg mt-6 w-full">Build your quote</Link>
          <Link href="/book" className="btn-ghost btn-lg mt-3 w-full">Book a free call</Link>
        </nav>
      )}
    </div>
  );
}
