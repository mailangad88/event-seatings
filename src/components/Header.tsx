import Image from "next/image";
import Link from "@/components/Link";
import { menus, primaryNav, toneTile, type Menu } from "@/lib/nav";
import { site } from "@/lib/site";
import { contact } from "@/lib/contact";
import { render } from "@/lib/scenes";
import { MobileNav } from "./MobileNav";
import { QuoteListLink } from "./QuoteListLink";
import { MyEventsNavLink } from "./myevents/MyEventsNavLink";
import { Icon } from "./ui/Icon";
import { BrandMark, BrandName } from "./brand/BrandLogo";

// Kept for older imports (MobileNav, Footer): the flat list of primary links.
export const nav = primaryNav;

export function Logo({ center = false }: { light?: boolean; center?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={`flex shrink-0 items-center gap-2 sm:gap-3 ${center ? "justify-center" : ""}`}
    >
      <BrandMark className="h-9 w-9 shrink-0 sm:h-12 sm:w-12" />
      <span className="flex flex-col items-start leading-none">
        <BrandName className="h-3 w-auto max-[374px]:h-2.5 sm:h-4" />
        <span className="mt-1.5 text-xs font-medium tracking-[0.06em] whitespace-nowrap text-gold max-[374px]:hidden sm:mt-2 uppercase sm:tracking-[0.2em]">
          Event Rentals
        </span>
      </span>
    </Link>
  );
}

const linkClass =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-surface-2 hover:text-ink xl:px-3";

const cols: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

// One dropdown: grouped links with icons and a one-line note, plus a small panel with the next step.
// Opens on hover and keyboard focus, no JS needed.
function MegaMenu({ menu }: { menu: Menu }) {
    const promoScene = render(menu.promo.scene);
    return (
    <div className="group/menu">
      <Link href={menu.href} className={`${linkClass} whitespace-nowrap`} aria-haspopup="true">
        {menu.label}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="transition-transform group-hover/menu:rotate-180 group-focus-within/menu:rotate-180">
          <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Link>
      <div className="invisible absolute inset-x-4 top-full pt-2 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within/menu:visible group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:opacity-100 sm:inset-x-6 lg:inset-x-8">
        <div className={`card mx-auto grid grid-cols-[1fr_240px] overflow-hidden shadow-lift ${menu.groups.length > 2 ? "" : "max-w-4xl"}`}>
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
          <div className="relative flex flex-col justify-end gap-3 overflow-hidden p-6">
            <Image
              src={promoScene.src}
              alt={promoScene.alt}
              fill
              sizes="240px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden />
            <p className="display-3 relative text-surface">{menu.promo.title}</p>
            <Link href={menu.promo.href} className="btn-primary btn-sm relative self-start">
              {menu.promo.cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
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
            <a href={`tel:${contact.phone}`} className={`${linkClass} whitespace-nowrap max-xl:hidden`}>
              <Icon name="phone" size={16} /> {site.phone}
            </a>
          )}
          <Link href="/account" className={`${linkClass} whitespace-nowrap`} aria-label="Your account">
            <Icon name="users" size={16} /> <span className="max-2xl:hidden">Account</span>
          </Link>
          <QuoteListLink className="btn-primary btn-sm whitespace-nowrap" label="Get a quote" />
        </div>

        <MobileNav menus={menus.map(({ id, label, href, all, tone, groups }) => ({ id, label, href, all, tone, groups }))} />
      </div>
    </header>
  );
}
