import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallCta } from "@/components/CallCta";
import { BudgetExample } from "@/components/rentals/BudgetExample";
import { RentalIcon } from "@/components/rentals/RentalIcon";
import { rentalImagePath } from "@/components/rentals/RentalVisual";
import { Breadcrumb, Faqs, JsonLd, PriceBars, RentalCard, Steps, faqJsonLd, itemHref } from "@/components/rentals/parts";
import { catalogItems, categories, customerPrice, formatPrice } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { sampleBudgets } from "@/data/sample-budgets";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}
export const dynamicParams = false;

const itemsIn = (id: string) => catalogItems.filter((i) => i.categoryId === id);

export async function generateMetadata(props: PageProps<"/rentals/[category]">): Promise<Metadata> {
  const c = getCategory((await props.params).category);
  if (!c) return {};
  const items = itemsIn(c.id);
  const from = Math.min(...items.map(customerPrice));
  const first = items.map((i) => rentalImagePath(i.id, i.categoryId)).find(Boolean);
  return {
    title: `${c.name} Rental ${site.market}: Prices from ${formatPrice(from)}`,
    description: `${c.name} for rent in ${site.market} and the suburbs: ${c.blurb.toLowerCase()}. ${items.length} options from ${formatPrice(from)}, with sizing guides and FAQs. Get one quote.`,
    alternates: { canonical: `/rentals/${c.id}` },
    ...(first && { openGraph: { images: [{ url: first, alt: `${c.name} for rent in ${site.market}` }] } }),
  };
}

export default async function CategoryPage(props: PageProps<"/rentals/[category]">) {
  const c = getCategory((await props.params).category);
  if (!c) notFound();
  const items = itemsIn(c.id);
  const prices = items.map(customerPrice);
  const budget = sampleBudgets.find((b) => b.lines.some(([id]) => items.some((i) => i.id === id)));
  const url = `${site.url}/rentals/${c.id}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${c.name} for rent in ${site.market}`,
      url,
      numberOfItems: items.length,
      itemListElement: items.map((i, n) => ({
        "@type": "ListItem",
        position: n + 1,
        url: `${site.url}${itemHref(i)}`,
        name: i.name,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Rentals", item: `${site.url}/rentals` },
        { "@type": "ListItem", position: 3, name: c.name, item: url },
      ],
    },
    faqJsonLd(c.faqs),
  ];

  return (
    <>
      <div className="container-x py-14">
        <JsonLd data={jsonLd} />
        <Breadcrumb trail={[{ name: "Rentals", href: "/rentals" }, { name: c.name }]} />

        <header className="mt-10 grid items-center gap-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="eyebrow">{c.name} rental · {site.marketLong}</p>
            <h1 className="headline mt-6 text-5xl leading-[0.98] sm:text-7xl">
              {c.name} <em className="text-gold">rental</em> in {site.market}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{c.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="chip">{items.length} options</span>
              <span className="chip">
                {formatPrice(Math.min(...prices))} – {formatPrice(Math.max(...prices))}
              </span>
              <span className="chip">Delivery across {site.marketLong}</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/quote?from=rentals-${c.id}`} className="btn-primary">
                Get a {c.name.toLowerCase()} quote
              </Link>
              <Link href={`/book?from=rentals-${c.id}`} className="btn-ghost">
                Free planning call
              </Link>
            </div>
          </div>
          <div className="hidden aspect-square items-center justify-center border border-line bg-surface text-gold md:flex">
            <RentalIcon category={c.id} className="h-1/2 w-1/2" title={`${c.name} illustration`} />
          </div>
        </header>

        <section className="mt-20" aria-labelledby="items">
          <h2 id="items" className="headline text-4xl">
            {c.name} we rent
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((i) => (
              <RentalCard key={i.id} item={i} />
            ))}
          </div>
        </section>

        <section className="mt-28" aria-labelledby="plan">
          <p className="eyebrow">Plan it</p>
          <h2 id="plan" className="headline mt-6 text-4xl sm:text-5xl">
            How to work out what you <em className="text-gold">need</em>
          </h2>
          <div className="mt-10">
            <Steps steps={c.planning} />
          </div>
        </section>

        <section className="mt-28 grid gap-16 lg:grid-cols-2" aria-labelledby="prices">
          <div>
            <p className="eyebrow">Price guide</p>
            <h2 id="prices" className="headline mt-6 mb-8 text-4xl">
              {c.name} rental prices in {site.market}
            </h2>
            <PriceBars items={items} caption={`Per-unit rental price for one event day, ${site.marketLong}.`} />
          </div>
          {budget && (
            <div>
              <p className="eyebrow">Worked example</p>
              <div className="mt-6">
                <BudgetExample budget={budget} />
              </div>
            </div>
          )}
        </section>

        <section className="mt-28 max-w-4xl" aria-labelledby="faq">
          <p className="eyebrow">Questions</p>
          <h2 id="faq" className="headline mt-6 mb-8 text-4xl sm:text-5xl">
            {c.name} rental FAQs
          </h2>
          <Faqs faqs={c.faqs} />
        </section>

        <section className="mt-28" aria-labelledby="more">
          <h2 id="more" className="headline text-3xl">
            Complete your event
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {categories
              .filter((x) => x.id !== c.id)
              .map((x) => (
                <li key={x.id}>
                  <Link href={`/rentals/${x.id}`} className="inline-flex items-center gap-3 border border-line px-4 py-3 text-sm hover:border-gold">
                    <RentalIcon category={x.id} className="h-6 w-6 text-gold" />
                    {x.name}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
      <div className="mt-24 -mb-32">
        <CallCta title={<>Planning {c.name.toLowerCase()} for your <em className="text-gold">event</em>?</>} source={`rentals-${c.id}`} />
      </div>
    </>
  );
}
