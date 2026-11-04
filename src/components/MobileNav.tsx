"use client";

import Link from "@/components/Link";
import { useEffect, useState } from "react";
import type { Menu } from "@/lib/nav";
import { toneTile } from "@/lib/menu-style";
import { Icon } from "./ui/Icon";

type MobileMenu = Pick<Menu, "id" | "label" | "href" | "all" | "tone" | "groups">;

// Phone menu: one folding section per header menu, each split into the same labelled groups as the
// desktop dropdowns, so people find things in the same place on every screen.
export function MobileNav({ menus }: { menus: MobileMenu[] }) {
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
          className="absolute inset-x-0 top-full h-[calc(100dvh-72px-36px)] overflow-y-auto border-t border-line bg-bg px-4 pt-2 pb-10"
        >
          {menus.map((m) => (
            <details key={m.id} className="group/sec border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-heading font-semibold text-2xl [&::-webkit-details-marker]:hidden">
                {m.label}
                <Icon name="plus" size={18} className="text-accent transition-transform group-open/sec:rotate-45" />
              </summary>
              <div className="space-y-5 pb-5">
                {m.groups.map((g) => (
                  <div key={g.title}>
                    <p className="eyebrow">{g.title}</p>
                    <ul className="mt-2 grid grid-cols-2 gap-2">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="flex h-full items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-sm leading-snug font-medium">
                            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${toneTile[m.tone]}`}>
                              <Icon name={l.icon} size={16} />
                            </span>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link href={m.href} className="link-line text-sm">
                  {m.all} <Icon name="arrow" size={16} />
                </Link>
              </div>
            </details>
          ))}
          <Link href="/quote" className="btn-primary btn-lg mt-6 w-full">Build your quote</Link>
          <Link href="/book" className="btn-ghost btn-lg mt-3 w-full">Book a free call</Link>
        </nav>
      )}
    </div>
  );
}
