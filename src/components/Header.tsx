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

export function Logo({ light = false, center = false }: { light?: boolean; center?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex flex-col leading-none ${center ? "items-center" : "items-start"} text-ink`}
    >
      <span className="font-serif text-[1.75rem] font-light tracking-[0.06em] uppercase">{site.name}</span>
      <span className={`mt-1.5 text-[8.5px] tracking-[0.5em] uppercase ${light ? "text-ink/55" : "text-gold"}`}>
        Fine Event Seating
      </span>
    </Link>
  );
}

const linkClass =
  "relative text-[11px] tracking-[0.24em] text-ink/75 uppercase transition-colors hover:text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 hover:after:scale-x-100";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/88 backdrop-blur-md">
      <div className="bg-espresso text-center text-[10px] tracking-[0.3em] text-ink/75 uppercase">
        <div className="container-x py-2.5">
          Now reserving the {site.launch.seasonLabel}
          <span className="mx-3 text-gold" aria-hidden>·</span>
          <Link href="/quote" className="text-ink underline decoration-gold underline-offset-4">
            Enquire
          </Link>
        </div>
      </div>
      <div className="container-x relative flex h-20 items-center justify-between md:grid md:h-24 md:grid-cols-[1fr_auto_1fr]">
        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {nav.slice(0, 3).map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Logo center />
        <nav className="hidden items-center justify-end gap-9 md:flex" aria-label="Secondary">
          {nav.slice(3).map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
          <Link href="/quote" className="btn-primary px-7 py-3">
            Enquire
          </Link>
        </nav>
        <MobileNav items={nav} />
      </div>
    </header>
  );
}
