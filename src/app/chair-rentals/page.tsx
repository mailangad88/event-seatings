import type { Metadata } from "next";
import Link from "next/link";
import { DecoFrame } from "@/components/DecoFrame";
import { AreaMap } from "@/components/geo/AreaMap";
import { Breadcrumbs } from "@/components/geo/Breadcrumbs";
import { CallButton, CallCta } from "@/components/geo/CallCta";
import { JsonLd } from "@/components/geo/JsonLd";
import { homeBase, locationPath, locations, milesFrom, type Location } from "@/data/geo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chair Rentals Across Chicago & the Suburbs",
  description:
    "Event chair rentals with delivery, setup and pickup in Chicago neighborhoods and suburbs from Naperville and St. Charles to Evanston, Schaumburg and Lake Forest.",
  alternates: { canonical: "/chair-rentals" },
};

const groups: { title: string; filter: (l: Location) => boolean }[] = [
  { title: "Chicago neighborhoods", filter: (l) => l.kind === "city" || l.kind === "neighborhood" },
  { title: "Western & southern suburbs", filter: (l) => l.kind === "suburb" && l.lat < 42.0 },
  { title: "North & northwest suburbs", filter: (l) => l.kind === "suburb" && l.lat >= 42.0 },
];

export default function AreasPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Areas we serve",
          itemListElement: locations.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `Chair rentals in ${l.name}`,
            url: `${site.url}${locationPath(l)}`,
          })),
        }}
      />
      <div className="container-x pt-14">
        <Breadcrumbs items={[{ href: "/chair-rentals", label: "Areas we serve" }]} />
        <section className="mt-10 grid items-start gap-14 md:grid-cols-[1fr_1fr] md:gap-16">
          <div className="animate-rise md:sticky md:top-32">
            <p className="eyebrow">Chicagoland · {locations.length} areas</p>
            <h1 className="headline mt-6 text-5xl leading-[0.98] sm:text-7xl">
              Event chairs, delivered across <em className="text-gold">Chicagoland</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
              We rent distinctive event chairs, from cross-back and ghost to velvet and rattan, with delivery, setup and
              pickup throughout Chicago and its suburbs. We&apos;re based in {homeBase.name}, so the Fox Valley is
              home turf, and we deliver to the city and the North Shore too. Find your area for local
              venue tips, chair picks and FAQs.
            </p>
            <div className="mt-10">
              <CallButton />
            </div>
            <DecoFrame label="Areas we serve" className="mt-14">
              <AreaMap />
            </DecoFrame>
          </div>
          <div className="space-y-16">
            {groups.map((g) => (
              <section key={g.title}>
                <h2 className="headline border-b border-gold/40 pb-4 text-3xl">{g.title}</h2>
                <ul className="divide-y divide-line">
                  {locations.filter(g.filter).map((l) => (
                    <li key={l.slug}>
                      <Link href={locationPath(l)} className="group flex items-baseline justify-between gap-6 py-4">
                        <span>
                          <span className="font-serif text-2xl transition-colors group-hover:text-gold">{l.name}</span>
                          <span className="ml-3 text-[11px] tracking-[0.2em] text-muted uppercase">{l.region}</span>
                        </span>
                        <span className="shrink-0 text-[11px] tracking-[0.2em] text-muted uppercase">
                          {l.slug === "st-charles" ? "Home base" : `~${milesFrom(homeBase, l)} mi`} →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="text-sm leading-7 text-muted">
              Don&apos;t see your town? We likely still deliver. Ask on a planning call or in your quote request.
            </p>
          </div>
        </section>
      </div>
      <CallCta heading={<>Tell us where the party is</>} />
    </>
  );
}
