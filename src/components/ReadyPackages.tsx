import Image from "next/image";
import Link from "next/link";
import { readyPackages, type ReadyPackage } from "@/lib/packages";
import { Icon, formatPrice } from "./ui";

// Ready-made packages: a sized, priced list for a typical party that opens in the planner with one tap.
// On phones the cards scroll sideways so the section stays short; on wider screens they sit in a grid.
export function PackageCard({ p, compact = false }: { p: ReadyPackage; compact?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition hover:border-gold/60">
      <div className="relative aspect-[16/10] bg-surface-2">
        <Image src={p.image} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 80vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <span className="absolute top-3 left-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-medium">{p.guests} guests</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-2xl leading-tight">{p.name}</h3>
        <p className="mt-1 text-xs text-muted">
          {p.settingName} · {p.styleName} package · {p.itemCount} items
        </p>
        <p className="mt-3">
          <span className="font-serif text-3xl tabular-nums">{formatPrice(p.allIn)}</span>
          <span className="text-sm text-muted"> all-in est.</span>
        </p>
        <p className="text-xs text-muted tabular-nums">
          About {formatPrice(p.perGuest)} a guest · {formatPrice(p.rentals)} in rentals plus delivery, setup, waiver and tax
        </p>
        {!compact && <p className="mt-3 text-sm leading-6 text-muted">{p.blurb}</p>}
        <ul className="mt-3 space-y-1 text-sm">
          {p.highlights.slice(0, compact ? 3 : 4).map((h) => (
            <li key={h} className="flex gap-2">
              <Icon name="check" size={14} className="mt-1 shrink-0 text-gold" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <Link
          href={p.href}
          className="btn-primary btn-sm mt-5 self-start after:absolute after:inset-0 after:content-['']"
          aria-label={`Start with the ${p.name.toLowerCase()} package for ${p.guests} guests`}
        >
          Start with this <Icon name="arrow" size={14} />
        </Link>
      </div>
    </article>
  );
}

export function ReadyPackages({ ids, compact = false, className = "" }: { ids?: string[]; compact?: boolean; className?: string }) {
  const list = ids ? readyPackages.filter((p) => ids.includes(p.id)) : readyPackages;
  return (
    <ul className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 ${className}`}>
      {list.map((p) => (
        <li key={p.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
          <PackageCard p={p} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
