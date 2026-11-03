import type { Metadata } from "next";
import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { BudgetExample } from "@/components/rentals/BudgetExample";
import { RentalIcon } from "@/components/rentals/RentalIcon";
import { Faqs, JsonLd, Steps, faqJsonLd } from "@/components/rentals/parts";
import { catalogItems, categories, customerPrice, formatPrice } from "@/data/catalog";
import { sampleBudgets } from "@/data/sample-budgets";
import { PriceDisclaimer } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Event Rentals in ${site.market}: Chairs, Tables, Linens, Tents & Tableware Prices`,
  description: `Rent everything for your event in ${site.market} and the suburbs: chairs, tables, linens, dishes, glassware, tents, dance floors, lighting and more. See prices upfront, build a list and get one quote.`,
  alternates: { canonical: "/rentals" },
};

const faqs = [
  {
    q: `How does renting through ${site.name} work?`,
    a: `Pick the items you need and send one enquiry. We match each item with a vetted local rental partner, confirm availability for your date and venue, and send you a single itemized proposal. You deal with one team instead of calling five rental companies.`,
  },
  {
    q: "Are the prices on this page final?",
    a: "They are current per-item rental rates for one event day. A delivered event adds delivery and pickup (usually $150-$400 per order), setup and teardown, a damage waiver of about 10% and sales tax, so plan on 35-60% more than the rental total. The quote builder shows that all-in estimate as you go. Items marked \"Est.\" use Chicago-area market rates. Prices are based on local rental companies' published rates plus our booking fee, and your final quote is confirmed by the rental company.",
  },
  {
    q: "Do you deliver to the suburbs?",
    a: `Yes. We cover ${site.serviceArea.slice(0, -1).join(", ")} and ${site.serviceArea.at(-1)}, plus most of Cook, DuPage, Kane, Lake and Will counties.`,
  },
  {
    q: "How far ahead should I book event rentals in Chicago?",
    a: "For May to October weekends, book tents, specialty chairs and dance floors 3-6 months ahead. Tables, linens and tableware usually need 4-8 weeks. Holiday weekends book up first.",
  },
  {
    q: "Is there a minimum order?",
    a: "Many Chicago rental companies set a delivery minimum, often a few hundred dollars. If your order is small, we will tell you the cheapest way to get it, including customer pickup where a partner allows it.",
  },
  {
    q: "What if I damage or lose something?",
    a: "Rental partners charge replacement cost for lost or broken items. Most offer an optional damage waiver (often 8-12% of the rental) that covers accidental damage; we list it on your proposal so you can choose.",
  },
];

export default function RentalsPage() {
  const byCategory = categories.map((c) => {
    const items = catalogItems.filter((i) => i.categoryId === c.id);
    const from = Math.min(...items.map(customerPrice));
    return { c, items, from };
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Event rentals in ${site.market}`,
      url: `${site.url}/rentals`,
      about: "Event rental equipment: chairs, tables, linens, tableware, tents and decor",
      provider: { "@id": `${site.url}/#business` },
      hasPart: categories.map((c) => ({ "@type": "WebPage", name: `${c.name} rental`, url: `${site.url}/rentals/${c.id}` })),
    },
    faqJsonLd(faqs),
  ];

  return (
    <>
      <div className="container-x py-20">
        <JsonLd data={jsonLd} />
        <p className="eyebrow">Event rentals · {site.marketLong}</p>
        <h1 className="headline mt-6 max-w-5xl text-5xl leading-[0.98] sm:text-7xl">
          Everything for your event, <em className="text-gold">priced upfront</em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          {catalogItems.length} rental items across {categories.length} categories, from chairs and tables to dishes,
          glassware, tents and dance floors. See the price, build your list, and get one itemized quote delivered
          anywhere in {site.marketLong}.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/quote" className="btn-primary">
            Build your rental list
          </Link>
          <Link href="/book?from=rentals" className="btn-ghost">
            Book a free planning call
          </Link>
        </div>

        <section className="mt-20" aria-labelledby="cats">
          <h2 id="cats" className="sr-only">
            Rental categories
          </h2>
          <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {byCategory.map(({ c, items, from }) => (
              <li key={c.id} className="group relative bg-bg p-6 transition-colors hover:bg-surface">
                <RentalIcon category={c.id} className="h-14 w-14 text-gold" />
                <h3 className="mt-5 font-serif text-2xl font-light">
                  <Link href={`/rentals/${c.id}`} className="after:absolute after:inset-0">
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted">{c.blurb}</p>
                <p className="mt-4 text-[11px] tracking-[0.18em] text-muted uppercase">
                  {items.length} items · from {formatPrice(from)}
                </p>
              </li>
            ))}
            <li className="flex flex-col justify-between gap-6 bg-surface p-6 sm:col-span-2">
              <div>
                <h3 className="font-serif text-2xl font-light">Need something not listed?</h3>
                <p className="mt-2 max-w-md text-sm text-muted">
                  Generators, restrooms, staging, specialty linens, AV and more. Add it to your enquiry notes and we
                  source it from our partner network.
                </p>
              </div>
              <Link href="/quote?from=rentals-other" className="link-line self-start">
                Add it to your list
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-28" aria-labelledby="how">
          <p className="eyebrow">How it works</p>
          <h2 id="how" className="headline mt-6 text-4xl sm:text-5xl">
            One list, one quote, one <em className="text-gold">team</em>
          </h2>
          <div className="mt-10">
            <Steps
              steps={[
                { title: "Pick items", body: "Browse by category and add what you need. Prices are shown per item." },
                { title: "Send one enquiry", body: "Tell us your date, venue and guest count. It takes two minutes." },
                { title: "Get a proposal", body: "We confirm availability with local partners and send one itemized quote." },
                { title: "Delivered & set", body: "Your rentals arrive, get set up, and are picked up after the event." },
              ]}
            />
          </div>
        </section>

        <section className="mt-28" aria-labelledby="budgets">
          <p className="eyebrow">Real numbers</p>
          <h2 id="budgets" className="headline mt-6 text-4xl sm:text-5xl">
            What a rental list <em className="text-gold">actually</em> costs
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Three common {site.market} events, priced line by line with today&apos;s rates. Start from one and change
            anything.
          </p>
          <PriceDisclaimer className="mt-3 max-w-2xl" vendorLink />
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {sampleBudgets.map((b) => (
              <BudgetExample key={b.id} budget={b} />
            ))}
          </div>
        </section>

        <section className="mt-28 max-w-4xl" aria-labelledby="faq">
          <p className="eyebrow">Questions</p>
          <h2 id="faq" className="headline mt-6 mb-8 text-4xl sm:text-5xl">
            Event rental FAQs
          </h2>
          <Faqs faqs={faqs} />
        </section>
      </div>
      <div className="mt-16 -mb-32">
        <CallCta title={<>Not sure what you <em className="text-gold">need</em>?</>} source="rentals" />
      </div>
    </>
  );
}
