import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Header";
import { WaitlistForm } from "./WaitlistForm";

export function Footer() {
  return (
    <footer className="mt-32 bg-espresso text-ink">
      <div className="container-x grid gap-14 py-20 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-6 max-w-sm text-sm leading-7 text-ink/65">
            A curated collection of distinctive chairs for weddings and celebrations. Based in {site.city}, serving
            the Fox Valley and Chicago&apos;s western suburbs.
          </p>
          <div className="mt-10 max-w-sm">
            <p className="mb-3 text-[11px] tracking-[0.25em] text-ink/80 uppercase">The private list</p>
            <WaitlistForm source="footer" dark />
          </div>
        </div>
        <div>
          <p className="mb-5 text-[11px] tracking-[0.25em] text-gold uppercase">Explore</p>
          <ul className="space-y-3 text-sm text-ink/75">
            {[
              ["/chairs", "The Collection"],
              ["/quiz", "Style Quiz"],
              ["/blog", "Journal"],
              ["/quote", "Request a Quote"],
              ["/faq", "FAQ"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-ink">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-5 text-[11px] tracking-[0.25em] text-gold uppercase">Service Area</p>
          <p className="text-sm leading-7 text-ink/75">{site.serviceArea.join(" · ")}</p>
          <p className="mt-6 text-sm">
            <a href={`mailto:${site.email}`} className="text-ink/90 underline decoration-gold underline-offset-4">
              {site.email}
            </a>
          </p>
          <p className="mt-4 flex gap-6 text-[11px] tracking-[0.22em] text-ink/75 uppercase">
            <a href={site.instagram} className="hover:text-ink">Instagram</a>
            <a href={site.pinterest} className="hover:text-ink">Pinterest</a>
          </p>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-[10px] tracking-[0.25em] text-ink/45 uppercase sm:flex-row">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
