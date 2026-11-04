import type { Metadata } from "next";
import Link from "@/components/Link";
import { AreaMap } from "@/components/geo/AreaMap";
import { Breadcrumbs, FaqList, Figure, JsonLd, QuoteCta, Section } from "@/components/ui";
import { catalogItems } from "@/data/catalog";
import { type Location } from "@/data/geo";
import { areaRentalsPath, localAreas as locations, localCategories, localCategoryPath } from "@/data/local-rentals";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = seo({
  title: "Party Rentals Near You: Chicago and Suburbs by Town",
  description: `Party and event rentals in ${locations.length} Chicago neighborhoods and suburbs: tents, tables, linens, dance floors, bounce houses and more, with local prices and one free quote.`,
  alternates: { canonical: "/party-rentals" },
});

const groups: { title: string; filter: (l: Location) => boolean }[] = [
  { title: "Chicago and neighborhoods", filter: (l) => l.kind === "city" || l.kind === "neighborhood" },
  { title: "Western and southern suburbs", filter: (l) => l.kind === "suburb" && l.lat < 42.0 },
  { title: "North and northwest suburbs", filter: (l) => l.kind === "suburb" && l.lat >= 42.0 },
];

const faqs = [
  {
    q: "Which areas do you deliver party rentals to?",
    a: `Chicago and its neighborhoods plus ${locations.filter((l) => l.kind === "suburb").length} suburbs listed on this page, from the North Shore to DuPage County and the Fox Valley. If your town is not listed, ask in your quote: most of the metro area is covered by our rental partners.`,
  },
  {
    q: "Is there a party rental company near me?",
    a: `${site.name} works with established rental companies across the Chicago area, so the closest partner that carries your items handles delivery. Pick your town for local prices and notes, then send one quote for everything.`,
  },
  {
    q: "What do party rentals usually include?",
    a: "The rental price covers the item for one event day. Delivery and pickup, setup, a damage waiver and sales tax are added per order, and every quote lists them line by line before you book.",
  },
];

export default function PartyRentalsHub() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Party rentals by area",
          itemListElement: locations.map((l, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}${areaRentalsPath(l.slug)}`, name: `Party rentals in ${l.name}` })),
        }}
      />
      <header className="tone-sand border-b border-line">
        <div className="container-x pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs className="mb-8 md:mb-12" items={[{ name: "Party rentals by area", href: "/party-rentals" }]} />
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">Chicagoland · {locations.length} areas</p>
              <h1 className="display-1 mt-4">
                Party rentals <em className="text-gold">near you</em>
              </h1>
              <p className="lede mt-6 max-w-2xl" data-answer>
                {site.name} arranges party and event rentals across {locations.length} Chicago neighborhoods and suburbs:
                tents, tables, chairs, linens, dance floors, bounce houses, lighting and more, {catalogItems.length.toLocaleString()} items
                from local rental partners. Pick your town to see local prices, venue notes and delivery tips, then send one free quote.
              </p>
            </div>
            <Figure caption="The Chicago neighborhoods and suburbs we serve.">
              <AreaMap />
            </Figure>
          </div>
        </div>
      </header>

      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="display-3">{g.title}</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {locations.filter(g.filter).map((l) => (
                  <li key={l.slug} className="py-3">
                    <Link href={areaRentalsPath(l.slug)} className="font-medium hover:text-gold">Party rentals in {l.name}</Link>
                    <p className="mt-1 text-xs text-muted">
                      {localCategories.slice(0, 4).map((c, i) => (
                        <span key={c.slug}>
                          {i > 0 && " · "}
                          <Link href={localCategoryPath(l.slug, c)} className="hover:text-gold">{c.label.split(" ")[0]}</Link>
                        </span>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section tone="sand" eyebrow="FAQ" title="Party rentals across Chicagoland">
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
          <p className="mt-8 text-sm text-muted">
            Looking for costs? See the <Link href="/rental-cost" className="link-line">rental cost guides</Link>, or browse{" "}
            <Link href="/rentals" className="link-line">every rental with prices</Link>.
          </p>
        </div>
      </Section>

      <QuoteCta source="party-rentals-hub" />
    </>
  );
}
