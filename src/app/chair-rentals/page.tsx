import type { Metadata } from "next";
import Link from "next/link";
import { DecoFrame } from "@/components/DecoFrame";
import { AreaMap } from "@/components/geo/AreaMap";
import { Breadcrumbs } from "@/components/geo/Breadcrumbs";
import { CallButton, CallCta } from "@/components/geo/CallCta";
import { JsonLd } from "@/components/geo/JsonLd";
import {
  countyOf,
  homeBase,
  locationPath,
  locations,
  milesFrom,
  type Location,
} from "@/data/geo";
import { HubFaqs } from "@/components/ui";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Event Rentals Across Chicago, Every Suburb & County",
  description:
    "Event chair, table and party rentals for every Chicago neighborhood and suburb in Cook, DuPage, Lake, Kane, McHenry, Will and Kendall counties. Find your town.",
  alternates: { canonical: "/chair-rentals" },
});

const byName = (a: Location, b: Location) => a.name.localeCompare(b.name);
const suburbsIn =
  (...names: string[]) =>
  (l: Location) =>
    l.kind === "suburb" && names.includes(countyOf(l) ?? "");

const groups: {
  id: string;
  title: string;
  filter: (l: Location) => boolean;
}[] = [
  {
    id: "counties",
    title: "County guides",
    filter: (l) => l.kind === "county",
  },
  {
    id: "chicago",
    title: "Chicago neighborhoods",
    filter: (l) => l.kind === "city" || l.kind === "neighborhood",
  },
  {
    id: "cook",
    title: "Cook County suburbs",
    filter: suburbsIn("Cook County"),
  },
  { id: "dupage", title: "DuPage County", filter: suburbsIn("DuPage County") },
  { id: "lake", title: "Lake County", filter: suburbsIn("Lake County") },
  { id: "kane", title: "Kane County", filter: suburbsIn("Kane County") },
  {
    id: "mchenry",
    title: "McHenry County",
    filter: suburbsIn("McHenry County"),
  },
  { id: "will", title: "Will County", filter: suburbsIn("Will County") },
  {
    id: "kendall",
    title: "Kendall County",
    filter: suburbsIn("Kendall County"),
  },
  {
    id: "outer",
    title: "DeKalb, Grundy & Kankakee",
    filter: (l) =>
      l.kind === "suburb" &&
      ![
        "Cook County",
        "DuPage County",
        "Lake County",
        "Kane County",
        "McHenry County",
        "Will County",
        "Kendall County",
      ].includes(countyOf(l) ?? ""),
  },
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
            name: `Event rentals in ${l.name}`,
            url: `${site.url}${locationPath(l)}`,
          })),
        }}
      />
      <div className="container-x pt-14">
        <Breadcrumbs
          items={[{ href: "/chair-rentals", label: "Areas we serve" }]}
        />
        <section className="mt-10 grid items-start gap-14 md:grid-cols-[1fr_1fr] md:gap-16">
          <div className="animate-rise md:sticky md:top-32">
            <p className="eyebrow">
              Chicagoland · {locations.length} local guides
            </p>
            <h1 className="display-1 mt-6">
              Event chairs, delivered across{" "}
              <em className="text-gold">Chicagoland</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
              We help you book event chairs, tables, linens and more from established
              Chicago-area rental companies, with delivery and setup across
              Chicago, every collar county and the towns beyond. We&apos;re
              based in {homeBase.name}. Find your neighborhood or town for local
              venue tips, rental picks and FAQs.
            </p>
            <nav
              aria-label="Jump to a county"
              className="mt-8 flex flex-wrap gap-2"
            >
              {groups.map((g) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className="chip transition-colors hover:border-gold hover:text-ink"
                >
                  {g.title}
                </a>
              ))}
            </nav>
            <div className="mt-10">
              <Link href="/quote?from=local-page" className="btn-primary">
                Get a free quote
              </Link>
              <CallButton label="Or book a free call" className="link-line" />
            </div>
            <DecoFrame label="Areas we serve" className="mt-14">
              <AreaMap />
            </DecoFrame>
          </div>
          <div className="space-y-16">
            {groups.map((g) => {
              const items = locations.filter(g.filter).sort(byName);
              if (items.length === 0) return null;
              return (
                <section key={g.id} id={g.id} className="scroll-mt-32">
                  <h2 className="display-2 border-b border-gold/40 pb-4">
                    {g.title}{" "}
                    <span className="text-base text-muted">
                      ({items.length})
                    </span>
                  </h2>
                  <ul className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    {items.map((l) => (
                      <li key={l.slug} className="border-b border-line">
                        <Link
                          href={locationPath(l)}
                          className="group flex items-baseline justify-between gap-4 py-3"
                        >
                          <span className="font-heading font-semibold text-xl transition-colors group-hover:text-gold">
                            {l.name}
                          </span>
                          <span className="shrink-0 text-xs tracking-[0.2em] text-muted uppercase">
                            {l.slug === "st-charles"
                              ? "Home base"
                              : `~${milesFrom(homeBase, l)} mi`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
            <p className="text-sm leading-7 text-muted">
              Don&apos;t see your town? We likely still deliver. Ask on a
              planning call or in your quote request.
            </p>
          </div>
        </section>
      </div>
      <HubFaqs
        faqs={[
          { q: "Which Chicago areas do you deliver chairs to?", a: `We arrange delivery to Chicago and its neighborhoods plus ${locations.length - 1} suburbs listed on this page, from the North Shore to DuPage County and the Fox Valley. If your town is not listed, ask: most of the metro area is covered.` },
          { q: "Does delivery cost more in the suburbs?", a: "Delivery is priced per order by the rental partner and depends mostly on distance, stairs and timing. Expect roughly $150 to $400 per order; the exact amount appears on your itemized quote before you book." },
          { q: "How far ahead should I book chairs?", a: "For Saturdays from May to October, book 3 to 6 months ahead, especially for popular styles like Chiavari and cross-back. Weekday and winter events can often be booked 2 to 4 weeks out." },
          { q: "Can you deliver to downtown venues with loading docks or elevators?", a: "Yes. Tell us the load-in window, dock or elevator rules and any certificate requirements your venue has, and we plan delivery around them. We do not issue certificates of insurance ourselves." },
        ]}
        title="Chair delivery across Chicagoland: questions"
      />
      <CallCta heading={<>Tell us where the party is</>} />
    </>
  );
}
