import Link from "next/link";
import { ChairArt } from "./ChairArt";
import { getChair } from "@/data/chairs";
import { site } from "@/lib/site";

// Sitewide "book a call" band. The main lead magnet: a free seating consult.
export function CallCta({ title, source }: { title?: React.ReactNode; source?: string }) {
  const chair = getChair("velvet-dining") ?? getChair("cross-back");
  const href = source ? `/book?from=${encodeURIComponent(source)}` : "/book";
  return (
    <section className="bg-espresso text-ink">
      <div className="container-x grid items-center gap-12 py-20 md:grid-cols-[1.4fr_1fr] md:py-24">
        <div>
          <p className="eyebrow">Free {site.callLength} seating call</p>
          <h2 className="headline mt-6 text-5xl leading-[1.05] sm:text-6xl">
            {title ?? (
              <>
                Not sure which chairs, or how <em className="text-gold">many</em>?
              </>
            )}
          </h2>
          <ul className="mt-8 space-y-3 text-ink/75">
            <li>· The right chair for your venue, season and guest count</li>
            <li>· Ceremony-to-reception flips and head-table pairings</li>
            <li>· An honest estimate, with delivery and setup itemized</li>
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Link href={href} className="btn-primary">Book a free call</Link>
            <Link href="/quote" className="link-line">Or request a written quote</Link>
          </div>
        </div>
        {chair && (
          <div className="mx-auto hidden w-full max-w-sm md:block" aria-hidden>
            <ChairArt chair={chair} className="aspect-[4/5]" />
          </div>
        )}
      </div>
    </section>
  );
}
