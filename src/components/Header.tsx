import Link from "next/link";
import { menus, primaryNav, toneTile, type Menu } from "@/lib/nav";
import { render } from "@/lib/scenes";
import { site } from "@/lib/site";
import Image from "next/image";
import { MobileNav } from "./MobileNav";
import { MyEventsNavLink } from "./myevents/MyEventsNavLink";
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
      <span className="font-brand text-xl font-medium tracking-[0.04em] whitespace-nowrap uppercase sm:text-2xl">{site.name}</span>
      <span className={`mt-1.5 text-xs font-medium tracking-[0.12em] uppercase sm:tracking-[0.2em] ${light ? "text-ink/60" : "text-gold"}`}>
        Event Rentals · Chicago
      </span>
    </Link>
  );
}

const linkClass =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-surface-2 hover:text-ink xl:px-3";

const cols: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

// One dropdown: grouped links with icons and a one-line note, plus a picture panel with the next step.
// Opens on hover and keyboard focus, no JS needed.
function MegaMenu({ menu }: { menu: Menu }) {
  const promo = render(menu.promo.scene);
  return (
    <div className={`group/menu ${menu.wideOnly ? "max-xl:hidden" : ""}`}>
      <Link href={menu.href} className={`${linkClass} whitespace-nowrap`} aria-haspopup="true">
        {menu.label}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="transition-transform group-hover/menu:rotate-180 group-focus-within/menu:rotate-180">
          <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Link>
      <div className="invisible absolute inset-x-4 top-full pt-2 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within/menu:visible group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:opacity-100 sm:inset-x-6 lg:inset-x-8">
        <div className="card grid grid-cols-[1fr_240px] overflow-hidden shadow-lift xl:grid-cols-[1fr_280px]">
          <div className="p-6">
            <div className={`grid gap-x-4 gap-y-6 ${cols[menu.groups.length] ?? "grid-cols-4"}`}>
              {menu.groups.map((g) => (
                <div key={g.title}>
                  <p className="eyebrow border-b border-line pb-2">{g.title}</p>
                  <ul className="mt-2 space-y-0.5">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-2">
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneTile[menu.tone]}`}>
                            <Icon name={l.icon} size={18} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">{l.label}</span>
                            {l.blurb && <span className="block text-xs leading-5 text-muted">{l.blurb}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link href={menu.href} className="link-line mt-5 ml-2.5">
              {menu.all} <Icon name="arrow" size={16} />
            </Link>
          </div>
          <Link href={menu.promo.href} className="tone-dark group/promo relative block min-h-[320px] bg-espresso">
            <Image src={promo.src} alt={promo.alt} fill sizes="280px" className="object-cover opacity-70 transition-opacity group-hover/promo:opacity-90" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" aria-hidden />
            <span className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="block font-heading font-semibold text-2xl leading-tight">{menu.promo.title}</span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium">
                {menu.promo.cta} <Icon name="arrow" size={16} />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="bg-espresso text-sm">
        <div className="container-x flex items-center justify-center gap-2 py-1 text-ink/85 sm:justify-between">
          <span className="hidden items-center gap-2 sm:flex">
            <Icon name="pin" size={14} className="text-gold" /> Delivering across {site.marketLong}
          </span>
          <span className="flex items-center gap-4">
            <span>Free quotes in one business day</span>
            <span aria-hidden className="text-gold">·</span>
            <Link href="/book" className="inline-block py-1 font-medium text-ink underline decoration-gold underline-offset-4">
              Book a free call
            </Link>
          </span>
        </div>
      </div>

      <div className="container-x relative flex h-[72px] items-center justify-between gap-3 lg:gap-4">
        <Logo />

        <nav className="hidden items-center lg:flex xl:gap-0.5" aria-label="Primary">
          {menus.map((m) => (
            <MegaMenu key={m.id} menu={m} />
          ))}
          <MyEventsNavLink className={`${linkClass} whitespace-nowrap max-2xl:hidden`} label="My events" />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {site.phone && (
            <a href={`tel:${site.phone}`} className={`${linkClass} max-xl:hidden`}>
              <Icon name="phone" size={16} /> {site.phone}
            </a>
          )}
          <Link href="/book" className="btn-ghost btn-sm max-xl:hidden">Book a call</Link>
          <Link href="/quote" className="btn-primary btn-sm whitespace-nowrap">Get a quote</Link>
        </div>

        <MobileNav menus={menus.map(({ id, label, href, all, tone, groups }) => ({ id, label, href, all, tone, groups }))} />
      </div>
    </header>
  );
}
