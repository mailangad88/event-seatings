import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandLogo";
import { Icon } from "@/components/ui/Icon";
import { OfficeMobileNav, OfficeSidebarNav, type NavCounts, type OfficeNavGroup } from "./OfficeNav";

// The frame around every back-office page: a dark sidebar with the menu, a slim top bar with search and
// the bell, and a calm light canvas. Built for the admin first; a vendor portal can reuse it with its
// own menu, title and search target (pass `portal`, `nav`, `root`).
export function OfficeShell({
  portal,
  root,
  nav,
  counts = {},
  person,
  search,
  bell,
  children,
}: {
  portal: string; // shown under the logo, e.g. "Staff" or "Rental partner"
  root: string; // home of this portal, e.g. "/admin"
  nav: OfficeNavGroup[];
  counts?: NavCounts;
  person?: { name: string; role: string };
  search?: { action: string; placeholder: string };
  bell?: { href: string; count: number; urgent?: boolean };
  children: React.ReactNode;
}) {
  const initials = person?.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div data-office className="tone-office min-h-dvh lg:flex">
      <aside className="bg-espresso hidden w-64 shrink-0 lg:block" data-admin-chrome>
        <div className="sticky top-0 flex h-dvh flex-col px-3 py-5">
          <Link href={root} className="flex items-center gap-3 px-3 pb-6">
            <BrandMark className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-ink">Beyond Chiavari</span>
              <span className="block text-xs text-muted">{portal}</span>
            </span>
          </Link>
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <OfficeSidebarNav nav={nav} counts={counts} root={root} />
          </div>
          <div className="space-y-2 border-t border-line pt-4">
            <Link href="/" className="office-nav-link">
              <Icon name="arrow" size={18} />
              View website
            </Link>
            {person && (
              <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-xs font-semibold text-accent-ink">{initials}</span>
                <span className="leading-tight">
                  <span className="block text-sm text-ink">{person.name}</span>
                  <span className="block text-xs text-muted">{person.role}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md" data-admin-chrome>
          <div className="relative flex min-h-14 items-center gap-3 px-4 sm:px-6">
            <div className="bg-espresso -ml-2 rounded-lg lg:hidden">
              <OfficeMobileNav nav={nav} counts={counts} root={root} />
            </div>
            {search && (
              <form action={search.action} role="search" className="ml-auto flex w-full max-w-sm items-center gap-2 rounded-full border border-line bg-surface px-4 lg:ml-0">
                <Icon name="search" size={16} className="shrink-0 text-muted" />
                <label htmlFor="office-search" className="sr-only">{search.placeholder}</label>
                <input id="office-search" name="q" type="search" placeholder={search.placeholder} className="min-h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted" />
              </form>
            )}
            {bell && (
              <Link href={bell.href} className="relative ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface hover:bg-surface-2" aria-label={`Notifications: ${bell.count} need you`}>
                <Icon name="bell" size={18} />
                {bell.count > 0 && (
                  <span className={`absolute -top-1 -right-1 min-w-5 rounded-full px-1 text-center text-xs font-semibold text-surface tabular-nums ${bell.urgent ? "bg-rose" : "bg-amber"}`}>{bell.count}</span>
                )}
              </Link>
            )}
          </div>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
