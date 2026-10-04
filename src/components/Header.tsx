import Link from "next/link";
import { site } from "@/lib/site";
import { MobileNav } from "./MobileNav";

export const nav = [
  { href: "/chairs", label: "chairs" },
  { href: "/quiz", label: "style quiz" },
  { href: "/blog", label: "journal" },
  { href: "/about", label: "about" },
  { href: "/faq", label: "faq" },
];

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2" aria-label={`${site.name} home`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-accent shadow-[2px_2px_0_0_var(--ink)] transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M7 3v18M17 3v18M7 4h10M8 6l8 6M16 6l-8 6M5 13h14" />
        </svg>
      </span>
      <span className="font-serif text-xl font-extrabold tracking-tight lowercase">
        {site.name.toLowerCase()}
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg/90 backdrop-blur">
      <div className="container-x relative flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-butter"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary ml-3 py-2">
            get a quote →
          </Link>
        </nav>
        <MobileNav items={nav} />
      </div>
    </header>
  );
}
