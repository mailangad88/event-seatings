import Link from "@/components/Link";
import { footerExtras, menus, rentalCategories } from "@/lib/nav";
import { site } from "@/lib/site";
import { Logo } from "./Header";
import { Icon } from "./ui/Icon";
import { WaitlistForm } from "./WaitlistForm";

type FooterSection = { title: string; links: { href: string; label: string }[]; more?: { href: string; label: string } };

const sections: FooterSection[] = [
  {
    title: "Rentals",
    links: rentalCategories.slice(0, 8).map((c) => ({ href: `/rentals/${c.id}`, label: c.name })),
    more: { href: "/rentals", label: "All rentals" },
  },
  ...menus.filter((m) => m.id !== "rentals").flatMap((m) => m.groups),
  footerExtras,
];

export function Footer() {
  return (
    <footer className="tone-dark mt-32 bg-espresso">
      <div className="container-x grid gap-x-10 gap-y-12 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
            One place to price and book everything for your event: chairs, tables, linens, dinnerware, tents and more
            from trusted rental houses across {site.marketLong}.
          </p>
          <div className="mt-8 max-w-sm">
            <p className="mb-2 text-sm font-medium">Planning tips and seasonal offers</p>
            <WaitlistForm source="footer" dark />
          </div>
          <ul className="mt-8 space-y-1 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 py-1.5 break-all hover:text-gold">
                <Icon name="chat" size={16} className="text-gold" /> {site.email}
              </a>
            </li>
            {site.phone && (
              <li>
                <a href={`tel:${site.phone}`} className="inline-flex items-center gap-2 py-1.5 break-all hover:text-gold">
                  <Icon name="phone" size={16} className="text-gold" /> {site.phone}
                </a>
              </li>
            )}
          </ul>
          <p className="mt-2 flex gap-5 text-sm text-muted">
            <a href={site.instagram} className="inline-block py-1.5 hover:text-ink">Instagram</a>
            <a href={site.pinterest} className="inline-block py-1.5 hover:text-ink">Pinterest</a>
          </p>
        </div>

        {/* Same sections as the header menus, so a page lives in one place everywhere. */}
        <nav aria-label="Footer" className="columns-2 gap-x-8 sm:columns-3 xl:columns-4">
          {sections.map((sec) => (
            <div key={sec.title} className="mb-9 break-inside-avoid">
              <p className="eyebrow">{sec.title}</p>
              <ul className="mt-3 space-y-0.5 text-sm text-muted">
                {sec.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="inline-block py-1 leading-snug transition-colors hover:text-ink">{l.label}</Link>
                  </li>
                ))}
                {sec.more && (
                  <li>
                    <Link href={sec.more.href} className="inline-block py-1 font-medium text-ink hover:text-gold">{sec.more.label} →</Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-wrap items-baseline gap-x-2 gap-y-1 py-5 text-xs leading-6 text-muted">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink"><Icon name="pin" size={14} className="text-gold" /> Service area:</span>
          <span>{site.serviceArea.join(" · ")} and surrounding suburbs.</span>
          <Link href="/chair-rentals" className="font-medium text-ink underline decoration-gold underline-offset-4 hover:text-gold">See all areas</Link>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} {site.name}. Prices shown are estimates until confirmed in your quote.</span>
          <span className="flex gap-6">
            <Link href="/privacy" className="inline-block py-1.5 hover:text-ink">Privacy</Link>
            <Link href="/terms" className="inline-block py-1.5 hover:text-ink">Terms</Link>
            <Link href="/photo-credits" className="inline-block py-1.5 hover:text-ink">Photo credits</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
