import Link from "next/link";
import { site } from "@/lib/site";
import { MobileNav } from "./MobileNav";

export const nav = [
  { href: "/chairs", label: "Collection" },
  { href: "/quiz", label: "Style Quiz" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`flex flex-col items-start leading-none ${light ? "text-bg" : "text-ink"}`}>
      <span className="font-serif text-[1.65rem] font-normal tracking-[0.02em]">{site.name}</span>
      <span className={`mt-1 text-[9px] tracking-[0.42em] uppercase ${light ? "text-bg/60" : "text-muted"}`}>
        Fine Event Seating
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/92 backdrop-blur-md">
      <div className="bg-espresso text-center text-[10px] tracking-[0.28em] text-bg/80 uppercase">
        <div className="container-x py-2.5">
          Now reserving the {site.launch.seasonLabel} ·{" "}
          <Link href="/quote" className="text-bg underline decoration-gold underline-offset-4">
            Request a quote
          </Link>
        </div>
      </div>
      <div className="container-x relative flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] tracking-[0.22em] text-ink/80 uppercase transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary px-6 py-3">
            Enquire
          </Link>
        </nav>
        <MobileNav items={nav} />
      </div>
    </header>
  );
}
