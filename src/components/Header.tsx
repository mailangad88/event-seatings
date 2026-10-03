import Link from "next/link";
import { site } from "@/lib/site";
import { MobileNav } from "./MobileNav";

export const nav = [
  { href: "/chairs", label: "Chairs" },
  { href: "/quiz", label: "Style Quiz" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="bg-ink text-center text-xs text-white/90">
        <div className="container-x py-2">
          Now taking quote requests for our {site.launch.seasonLabel} ·{" "}
          <Link href="/quote" className="underline underline-offset-2">
            Reserve your spot
          </Link>
        </div>
      </div>
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
          Event Seatings
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted hover:text-ink">
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary">
            Get a Quote
          </Link>
        </nav>
        <MobileNav items={nav} />
      </div>
    </header>
  );
}
