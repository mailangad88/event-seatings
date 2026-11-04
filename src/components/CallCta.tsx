import Image from "next/image";
import Link from "@/components/Link";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";
import { Icon } from "./ui/Icon";

// Sitewide "talk to a planner" band: full-bleed dark, designed to sit flush on the footer
// (pages wrap it in `-mb-32`). For an inset card version use <QuoteCta /> from ui.
export function CallCta({ title, source }: { title?: React.ReactNode; source?: string }) {
  const q = source ? `?from=${encodeURIComponent(source)}` : "";
  const scene = sceneFor(`call-${source ?? "site"}`);
  return (
    <section className="tone-dark relative overflow-hidden bg-espresso">
      <div className="container-x grid items-center gap-12 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
        <div>
          <p className="eyebrow">Free {site.callLength} planning call</p>
          <h2 className="display-2 mt-4 max-w-xl">
            {title ?? (
              <>
                Not sure what you need, or how <em className="text-gold">much</em>?
              </>
            )}
          </h2>
          <ul className="mt-7 space-y-3 text-ink/85">
            {[
              "Quantities for your guest count and floor plan",
              "Which chairs, tables and linens suit your venue",
              "An honest estimate with delivery and setup itemized",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <Icon name="check" size={18} className="mt-1 shrink-0 text-gold" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`/book${q}`} className="btn-accent btn-lg">Book a free call</Link>
            <Link href={`/quote${q}`} className="btn btn-lg border border-ink/25 text-ink hover:border-accent hover:bg-accent-soft hover:text-accent">
              Build a quote instead
            </Link>
          </div>
        </div>
        <div className="relative hidden aspect-[4/5] max-h-[460px] overflow-hidden rounded-2xl md:block">
          <Image src={scene.src} alt={scene.alt} fill sizes="40vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
