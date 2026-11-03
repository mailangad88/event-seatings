import Link from "next/link";
import { rentalCategories } from "@/lib/nav";
import { site } from "@/lib/site";
import { Logo } from "./Header";
import { Icon } from "./ui/Icon";
import { WaitlistForm } from "./WaitlistForm";

export function Footer() {
  return (
    <footer className="tone-dark mt-32 bg-espresso">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
            One place to price and book everything for your event: chairs, tables, linens, dinnerware, tents and more
            from trusted rental houses across {site.marketLong}.
          </p>
          <div className="mt-8 max-w-sm">
            <p className="mb-2 text-sm font-medium">Planning tips and seasonal offers</p>
            <WaitlistForm source="footer" dark />
          </div>
        </div>
        <div>
          <p className="eyebrow">Rentals</p>
          <ul className="mt-3 space-y-0.5 text-sm text-muted">
            {rentalCategories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/rentals/${c.id}`} className="inline-block py-1.5 transition-colors hover:text-ink">{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/rentals" className="inline-block py-1.5 font-medium text-ink hover:text-gold">All rentals →</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Plan</p>
          <ul className="mt-3 space-y-0.5 text-sm text-muted">
            {[
              ["/quote", "Build a quote"],
              ["/book", "Book a free call"],
              ["/how-it-works", "How it works"],
              ["/booking-promise", "Payments & Booking Promise"],
              ["/events", "Events we plan"],
              ["/party-ideas", "Party ideas & themes"],
              ["/chair-rentals", "Areas we serve"],
              ["/ideas", "Event ideas by month"],
              ["/my-events", "My events: countdown & checklist"],
              ["/vendor-guide", "Vendor guide: who to hire"],
              ["/tools/event-weather", "Event weather & sunset"],
              ["/blog", "Planning guides"],
              ["/tools", "Free planning tools"],
              ["/countdown", "Event countdown"],
              ["/tools/rental-calculator", "Rental calculator"],
              ["/solutions", "Rental problems solved"],
              ["/compare", "Compare your options"],
              ["/glossary", "Rental glossary"],
              ["/downloads", "Free planning kits & spreadsheets"],
              ["/quiz", "Style quiz"],
              ["/seating-planner", "Seating planner"],
              ["/answers", "Quick answers"],
              ["/looks", "The Look Book"],
              ["/gallery", "3D gallery"],
              ["/faq", "FAQ"],
              ["/about", "About us"],
              ["/partners", "For rental companies"],
              ["/vendor-listings", "Vendor listings & opt-out"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-block py-1.5 transition-colors hover:text-ink">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <p className="eyebrow">Service area</p>
          <p className="mt-4 text-sm leading-7 text-muted">{site.serviceArea.join(" · ")} and surrounding suburbs</p>
          <ul className="mt-6 space-y-1 text-sm">
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
          <p className="mt-4 flex gap-5 text-sm text-muted">
            <a href={site.instagram} className="inline-block py-1.5 hover:text-ink">Instagram</a>
            <a href={site.pinterest} className="inline-block py-1.5 hover:text-ink">Pinterest</a>
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <nav aria-label="Planning guides" className="container-x flex flex-wrap gap-x-6 gap-y-1 py-5 text-xs text-muted">
          <span className="font-medium text-ink">Planning guides:</span>
          {[
            ["/seating-layouts", "Seating layouts"],
            ["/room-size-guides", "Room sizes"],
            ["/table-seating-guides", "Table seating"],
            ["/chair-comparisons", "Chair comparisons"],
            ["/rental-comparisons", "Rental comparisons"],
            ["/chair-rental-cost", "Chair rental cost"],
            ["/chair-fit", "Chair fit"],
            ["/chicago-event-seasons", "Chicago event seasons"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="inline-block py-1.5 hover:text-ink">{label}</Link>
          ))}
        </nav>
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
