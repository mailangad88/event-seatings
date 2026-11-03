import Link from "next/link";
import { primaryNav, rentalCategories } from "@/lib/nav";
import { render } from "@/lib/scenes";
import { site } from "@/lib/site";
import Image from "next/image";
import { MobileNav } from "./MobileNav";
import { Icon } from "./ui/Icon";

// Kept for older imports (MobileNav, Footer): the flat list of primary links.
export const nav = primaryNav;

export function Logo({ light = false, center = false }: { light?: boolean; center?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={`flex shrink-0 flex-col leading-none ${center ? "items-center" : "items-start"} text-ink`}
    >
      <span className="font-serif text-[1.3rem] tracking-[0.04em] whitespace-nowrap uppercase sm:text-[1.7rem]">{site.name}</span>
      <span className={`mt-1 text-[9px] font-medium tracking-[0.38em] uppercase ${light ? "text-ink/60" : "text-gold"}`}>
        Event Rentals · Chicago
      </span>
    </Link>
  );
}

const linkClass =
  "inline-flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:bg-surface-2 hover:text-ink";

export function Header() {
  const [rentals, ...rest] = primaryNav;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="bg-espresso text-[13px]">
        <div className="container-x flex items-center justify-center gap-2 py-2 text-ink/85 sm:justify-between">
          <span className="hidden items-center gap-2 sm:flex">
            <Icon name="pin" size={14} className="text-gold" /> Delivering across {site.marketLong}
          </span>
          <span className="flex items-center gap-4">
            <span>Free quotes in one business day</span>
            <span aria-hidden className="text-gold">·</span>
            <Link href="/book" className="font-medium text-ink underline decoration-gold underline-offset-4">
              Book a free call
            </Link>
          </span>
        </div>
      </div>

      <div className="container-x relative flex h-[72px] items-center justify-between gap-3 lg:gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {/* Rentals mega menu: opens on hover and keyboard focus, no JS needed. */}
          <div className="group/menu">
            <Link href={rentals.href} className={linkClass} aria-haspopup="true">
              {rentals.label}
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="transition-transform group-hover/menu:rotate-180 group-focus-within/menu:rotate-180">
                <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
            <div className="invisible absolute inset-x-4 top-full pt-2 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within/menu:visible group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:opacity-100 sm:inset-x-6 lg:inset-x-8">
              <div className="card grid grid-cols-[1fr_280px] overflow-hidden shadow-lift">
                <div className="p-6">
                  <p className="eyebrow">Shop by category</p>
                  <ul className="mt-4 grid grid-cols-3 gap-1">
                    {rentalCategories.map((c) => (
                      <li key={c.id}>
                        <Link href={`/rentals/${c.id}`} className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-soft text-gold">
                            <Icon name={c.icon} size={18} />
                          </span>
                          <span>
                            <span className="block text-sm font-medium">{c.name}</span>
                            <span className="block text-xs leading-5 text-muted">{c.blurb}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/rentals" className="link-line mt-4 ml-3">
                    Browse all rentals <Icon name="arrow" size={16} />
                  </Link>
                </div>
                <Link href="/quote" className="tone-dark group/promo relative block bg-espresso">
                  <Image src={render("wedding-reception").src} alt={render("wedding-reception").alt} fill sizes="280px" className="object-cover opacity-70 transition-opacity group-hover/promo:opacity-90" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" aria-hidden />
                  <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="block font-serif text-2xl leading-tight">Price your whole event</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium">
                      Build a quote <Icon name="arrow" size={16} />
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
          {rest.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {site.phone && (
            <a href={`tel:${site.phone}`} className={linkClass}>
              <Icon name="phone" size={16} /> {site.phone}
            </a>
          )}
          <Link href="/book" className="btn-ghost btn-sm">Book a call</Link>
          <Link href="/quote" className="btn-primary btn-sm">Get a quote</Link>
        </div>

        <MobileNav items={primaryNav} categories={rentalCategories.map(({ id, name, icon }) => ({ id, name, icon }))} />
      </div>
    </header>
  );
}
