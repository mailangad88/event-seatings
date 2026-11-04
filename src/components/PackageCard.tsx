"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "@/components/Link";
import type { ReadyPackage } from "@/lib/packages";
import { packageHref, quotePackage } from "@/lib/package-price";
import { GuestCount } from "./guests/GuestCount";
// Direct imports, not the "./ui" barrel: the barrel also holds server cards.
import { Icon } from "./ui/Icon";
import { formatPrice } from "./ui/PriceTag";

// One ready-made package. The guest count is editable right on the card: the price, the item list
// and the planner link all follow it.
export function PackageCard({ p, compact = false }: { p: ReadyPackage; compact?: boolean }) {
  const [guests, setGuests] = useState(p.guests);
  const q = useMemo(() => (guests === p.guests ? p : quotePackage(p, guests, p.items)), [guests, p]);
  const href = guests === p.guests ? p.href : packageHref(p, guests);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition hover:border-gold/60">
      <div className="relative aspect-[16/10] bg-surface-2">
        <Image src={p.image} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 80vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <span className="absolute top-3 left-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-medium tabular-nums">{guests} guests</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="display-3">{p.name}</h3>
        <p className="mt-1 text-xs text-muted">
          {p.settingName} · {p.styleName} package · {q.itemCount} items
        </p>
        {/* Sits above the card-wide link so taps on it don't open the planner. */}
        <div className="relative z-10 mt-3">
          <GuestCount value={guests} onChange={setGuests} size="sm" label="Guests" />
        </div>
        <p className="mt-3">
          <span className="font-heading font-semibold text-3xl tabular-nums">{formatPrice(q.allIn)}</span>
          <span className="text-sm text-muted"> all-in est.</span>
        </p>
        <p className="text-xs text-muted tabular-nums" aria-live="polite">
          About {formatPrice(q.perGuest)} a guest · {formatPrice(q.rentals)} in rentals plus delivery, setup, waiver and tax
        </p>
        {!compact && <p className="mt-3 text-sm leading-6 text-muted">{p.blurb}</p>}
        <ul className="mt-3 space-y-1 text-sm">
          {q.highlights.slice(0, compact ? 3 : 4).map((h) => (
            <li key={h} className="flex gap-2">
              <Icon name="check" size={14} className="mt-1 shrink-0 text-gold" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        {/* mt-auto pins the button to the card bottom so buttons line up across a row. */}
        <div className="mt-auto pt-5">
          <Link
            href={href}
            className="btn-primary btn-sm after:absolute after:inset-0 after:content-['']"
            aria-label={`Start with the ${p.name.toLowerCase()} package for ${guests} guests`}
          >
            Start with this <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
