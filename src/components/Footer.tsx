import Link from "next/link";
import { site } from "@/lib/site";
import { WaitlistForm } from "./WaitlistForm";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl font-semibold">Event Seatings</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Wedding and event chairs beyond Chiavari. Based in {site.city}, serving the Fox Valley
            and Chicago&apos;s western suburbs.
          </p>
          <div className="mt-6 max-w-sm">
            <p className="mb-2 text-sm font-medium">Get launch news and new chair drops</p>
            <WaitlistForm source="footer" compact />
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Explore</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/chairs" className="hover:text-ink">All chairs</Link></li>
            <li><Link href="/quiz" className="hover:text-ink">Style quiz</Link></li>
            <li><Link href="/blog" className="hover:text-ink">Journal</Link></li>
            <li><Link href="/quote" className="hover:text-ink">Request a quote</Link></li>
            <li><Link href="/faq" className="hover:text-ink">FAQ</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Service area</p>
          <p className="text-muted">{site.serviceArea.join(" · ")}</p>
          <p className="mt-4 text-muted">
            <a href={`mailto:${site.email}`} className="hover:text-ink">{site.email}</a>
          </p>
          <p className="mt-2 flex gap-4 text-muted">
            <a href={site.instagram} className="hover:text-ink">Instagram</a>
            <a href={site.pinterest} className="hover:text-ink">Pinterest</a>
          </p>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.name} · {site.city}
      </div>
    </footer>
  );
}
