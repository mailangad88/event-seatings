import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { BudgetExample } from "@/components/rentals/BudgetExample";
import { RentalIcon } from "@/components/rentals/RentalIcon";
import { Faqs, JsonLd, Steps, faqJsonLd } from "@/components/rentals/parts";
import { catalogItems, categories, customerPrice, formatPrice } from "@/data/catalog";
import { sampleBudgets } from "@/data/sample-budgets";
import { PriceDisclaimer } from "@/components/ui";
import { categoryScene, scenes } from "@/lib/scenes";
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
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Event rentals · {site.marketLong}</p>
            <h1 className="display-1 mt-5 max-w-3xl">
              Everything for your event, <em className="text-gold">priced upfront</em>
            </h1>
            <p className="lede mt-6 max-w-2xl">
              {catalogItems.length.toLocaleString("en-US")} rental items across {categories.length} categories, from
              chairs and tables to dishes, glassware, tents and dance floors. See the price, build your list, and get one
              itemized quote delivered anywhere in {site.marketLong}.
            </p>
            <div className="cta-row mt-8">
              <Link href="/quote?from=rentals-hero" className="btn-primary btn-lg">
                Build your rental list
              </Link>
              <Link href="/book?from=rentals" className="btn-ghost btn-lg">
                Book a free planning call
              </Link>
            </div>
          </div>
          <figure className="media aspect-[4/3] shadow-lift lg:aspect-[5/6]">
            <Image
              src={scenes.gildedIvory.src}
              alt={scenes.gildedIvory.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </figure>
        </div>

        <section className="mt-20" aria-labelledby="cats">
          <h2 id="cats" className="sr-only">
            Rental categories
          </h2>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
            {byCategory.map(({ c, items, from }) => (
              <li key={c.id} className="group relative bg-bg p-4 transition-colors hover:bg-surface sm:p-6">
                {categoryScene(c.id) ? (
                  <div className="media aspect-[4/3]">
                    <Image
                      src={categoryScene(c.id)!.src}
                      alt={categoryScene(c.id)!.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                ) : (
                  <div className="grid aspect-[4/3] place-items-center rounded-xl bg-gold-soft"><RentalIcon category={c.id} className="h-14 w-14 text-gold" /></div>
                )}
                <h3 className="mt-3 font-serif text-xl leading-tight font-medium sm:mt-4 sm:text-2xl">
                  <Link href={`/rentals/${c.id}`} className="after:absolute after:inset-0">
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted max-sm:hidden">{c.blurb}</p>
                <p className="mt-2 text-[13px] font-medium text-gold sm:mt-3">
                  {items.length} items · from {formatPrice(from)}
                </p>
              </li>
            ))}
            <li className="col-span-2 flex flex-col justify-between gap-6 bg-surface p-6">
              <div>
                <h3 className="font-serif text-2xl font-medium">Need something not listed?</h3>
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
