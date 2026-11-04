import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { ReadyPackages } from "@/components/ReadyPackages";
import { BudgetExample } from "@/components/rentals/BudgetExample";
import { RentalIcon } from "@/components/rentals/RentalIcon";
import { Faqs, JsonLd, faqJsonLd } from "@/components/rentals/parts";
import { catalogItems, categories, customerPrice, formatPrice } from "@/data/catalog";
import { sampleBudgets } from "@/data/sample-budgets";
import { Icon, PriceDisclaimer } from "@/components/ui";
import { categoryTile, scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: `Event Rentals in ${site.market}: Chairs, Tables, Linens, Tents & Tableware Prices`,
  description: `Rent everything for your event in ${site.market} and the suburbs: chairs, tables, linens, dishes, glassware, tents, dance floors, lighting and more. See prices upfront, build a list and get one quote.`,
  alternates: { canonical: "/rentals" },
});

const faqs = [
  {
    q: `How does renting through ${site.name} work?`,
    a: `Pick the items you need and send one enquiry. We confirm availability for your date and venue and send you a single itemized quote. You deal with one team instead of calling around.`,
  },
  {
    q: "Are the prices on this page final?",
    a: "They are current per-item rental rates for one event day. A delivered event adds delivery and pickup (usually $150-$400 per order), setup and teardown, a damage waiver of about 10% and sales tax, so plan on 35-60% more than the rental total. The quote builder shows that all-in estimate as you go. Items marked \"Est.\" use Chicago-area market rates. There's no separate booking fee, and your written quote confirms the final price for your date.",
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
    a: "Lost or broken items are charged at replacement cost. The damage waiver on your quote (10% of the rentals) covers everyday accidental damage. It doesn't cover loss, theft or negligence.",
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
                Get a free quote
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
                {categoryTile(c.id) ? (
                  <div className="media aspect-[4/3]">
                    <Image
                      src={categoryTile(c.id)!.src}
                      alt={categoryTile(c.id)!.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                ) : (
                  <div className="grid aspect-[4/3] place-items-center rounded-xl bg-gold-soft"><RentalIcon category={c.id} className="h-14 w-14 text-gold" /></div>
                )}
                <h3 className="display-3 mt-3 sm:mt-4">
                  <Link href={`/rentals/${c.id}`} className="after:absolute after:inset-0">
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted max-sm:hidden">{c.blurb}</p>
                <p className="mt-2 text-sm font-medium text-gold sm:mt-3">
                  {items.length} items · from {formatPrice(from)}
                </p>
              </li>
            ))}
            <li className="col-span-2 flex flex-col justify-between gap-6 bg-surface p-6">
              <div>
                <h3 className="display-3">Need something not listed?</h3>
                <p className="mt-2 max-w-md text-sm text-muted">
                  Generators, restrooms, staging, specialty linens, AV and more. Add it to your enquiry notes and we
                  find it for you.
                </p>
              </div>
              <Link href="/quote?from=rentals-other" className="link-line self-start">
                Add it to your list
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-28" aria-labelledby="packages">
          <p className="eyebrow">Skip the browsing</p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="packages" className="headline text-4xl sm:text-5xl">
              Start from a ready-made package
            </h2>
            <Link href="/packages" className="link-line">
              All packages
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-muted">
            Each one is a full list for a typical party, priced with delivery, setup, waiver and tax. Tap one, then change the guest count or swap any item.
          </p>
          <ReadyPackages className="mt-8" compact />
        </section>

        <section className="mt-28" aria-labelledby="budgets">
          <details className="group/b rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="eyebrow">Real numbers</span>
                <span id="budgets" className="display-2 mt-3 block">What three {site.market} events cost</span>
              </span>
              <Icon name="plus" size={22} className="shrink-0 text-accent transition-transform group-open/b:rotate-45" />
            </summary>
            <p className="mt-6 max-w-2xl text-muted">
              Priced line by line with today&apos;s rates. Start from one and change anything.
            </p>
            <PriceDisclaimer className="mt-3 max-w-2xl" vendorLink />
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {sampleBudgets.map((b) => (
                <BudgetExample key={b.id} budget={b} />
              ))}
            </div>
          </details>
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
