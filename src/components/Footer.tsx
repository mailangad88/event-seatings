import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Header";
import { WaitlistForm } from "./WaitlistForm";

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-accent">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm font-medium">
            Wedding &amp; event chairs beyond Chiavari. Based in {site.city}, serving the Fox Valley and
            Chicago&apos;s western burbs.
          </p>
          <div className="mt-6 max-w-sm">
            <p className="mb-2 text-sm font-bold">launch news + new chair drops 💌</p>
            <WaitlistForm source="footer" compact />
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-bold">explore</p>
          <ul className="space-y-2 font-medium">
            {[
              ["/chairs", "all chairs"],
              ["/quiz", "style quiz"],
              ["/blog", "journal"],
              ["/quote", "request a quote"],
              ["/faq", "faq"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:underline hover:decoration-2 hover:underline-offset-4">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-bold">we deliver to</p>
          <p className="font-medium">{site.serviceArea.join(" · ")}</p>
          <p className="mt-4 font-medium">
            <a href={`mailto:${site.email}`} className="underline decoration-2 underline-offset-4">{site.email}</a>
          </p>
          <div className="mt-4 flex gap-2">
            <a href={site.instagram} className="chip px-3 py-1 text-sm hover:bg-butter">instagram</a>
            <a href={site.pinterest} className="chip px-3 py-1 text-sm hover:bg-butter">pinterest</a>
          </div>
        </div>
      </div>
      <div className="overflow-hidden border-t-2 border-ink bg-ink">
        <p
          className="container-x -mb-[0.18em] pt-4 font-serif text-[15vw] leading-none font-extrabold tracking-[-0.05em] text-bg lowercase select-none md:text-[9.5rem]"
          aria-hidden
        >
          sit different.
        </p>
      </div>
      <div className="bg-ink py-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} {site.name} · {site.city}
      </div>
    </footer>
  );
}
