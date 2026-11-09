"use client";

import { useState } from "react";
import Link from "@/components/Link";
import type { ReadyPackage } from "@/lib/packages";
import { packageHref, quotePackage } from "@/lib/package-price";
import { GuestCount } from "./guests/GuestCount";
import { Icon } from "./ui/Icon";

// Every package side by side. Set your own guest count and every row is repriced for it,
// so you compare packages for your party, not for our example sizes.
export function PackageTable({ packages }: { packages: ReadyPackage[] }) {
  const [guests, setGuests] = useState<number | null>(null);
  const rows = packages.map((p) => ({ p, q: guests ? quotePackage(p, guests, p.items) : p, href: guests ? packageHref(p, guests) : p.href }));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <GuestCount value={guests ?? 100} onChange={setGuests} label="Your guest count" />
        {guests ? (
          <button type="button" className="text-sm text-accent underline underline-offset-4" onClick={() => setGuests(null)}>
            Show each package&apos;s usual size
          </button>
        ) : (
          <span className="text-sm text-muted">Showing each package at its usual size. Change the number to size them all for your party.</span>
        )}
      </div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Every package with its guest count, setting, style and item count</caption>
          <thead>
            <tr className="border-b border-line text-muted">
              <th scope="col" className="py-3 pr-4 font-medium">Package</th>
              <th scope="col" className="px-4 py-3 font-medium">Guests</th>
              <th scope="col" className="px-4 py-3 font-medium">Items</th>
              <th scope="col" className="px-4 py-3 font-medium">Where</th>
              <th scope="col" className="px-4 py-3 font-medium">Style</th>
              <th scope="col" className="py-3 pl-4"><span className="sr-only">Start</span></th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            {rows.map(({ p, q, href }) => (
              <tr key={p.id} className="border-b border-line">
                <th scope="row" className="py-3 pr-4 font-medium">{p.name}</th>
                <td className="px-4 py-3 tabular-nums">{q.guests}</td>
                <td className="px-4 py-3 tabular-nums">{q.itemCount}</td>
                <td className="px-4 py-3">{p.settingName}</td>
                <td className="px-4 py-3">{p.styleName}</td>
                <td className="py-3 pl-4 text-right">
                  <Link href={href} className="inline-flex items-center gap-1 text-accent underline underline-offset-4">
                    Get a quote <Icon name="arrow" size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
