import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallCta } from "@/components/CallCta";
import { PlanningLoop } from "@/components/myevents/PlanningLoop";
import { BudgetExample } from "@/components/rentals/BudgetExample";
import { RentalIcon } from "@/components/rentals/RentalIcon";
import { RentalVisual, rentalAlt, rentalImagePath } from "@/components/rentals/RentalVisual";
import { Breadcrumb, Faqs, JsonLd, PriceBars, RentalCard, Steps, faqJsonLd, itemHref } from "@/components/rentals/parts";
import { catalogItems, categories, customerPrice, formatPrice } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { categoryPhotos, photosForItem, stockAlt, stockImageJsonLd, stockSrc } from "@/data/stock-photos";
import { ExampleChip, PhotoCredit, StockImg } from "@/components/rentals/StockPhoto";
import { sampleBudgets } from "@/data/sample-budgets";
import { categoryScene } from "@/lib/scenes";
import { Icon, PriceDisclaimer } from "@/components/ui";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

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
  const photo = categoryPhotos(c.id)[0];
  const og = first
    ? { url: first, alt: `${c.name} for rent in ${site.market}` }
    : { url: stockSrc(photo, 1200, 630), width: 1200, height: 630, alt: `${photo.alt}: ${c.name} for rent in ${site.market}` };
  return seo({
    title: `${c.name} Rental ${site.market}: Prices from ${formatPrice(from)}`,
    description: `${c.name} for rent in ${site.market} and the suburbs: ${c.blurb.toLowerCase()}. ${items.length} options from ${formatPrice(from)}, with sizing guides and FAQs. Get one quote.`,
    alternates: { canonical: `/rentals/${c.id}` },
    openGraph: { images: [og] },
  });
}

export default async function CategoryPage(props: PageProps<"/rentals/[category]">) {
  const c = getCategory((await props.params).category);
  if (!c) notFound();
  const items = itemsIn(c.id);
  const prices = items.map(customerPrice);
  const featured = items.filter((i) => i.featured);
  const inventory = items.filter((i) => !i.featured);
  const inventoryCount = inventory.length;
  const sections = [...Map.groupBy(inventory, (i) => i.section ?? c.name)].sort((a, b) => a[0].localeCompare(b[0]));
  const hero = items.find((i) => rentalImagePath(i.id, i.categoryId));
  const budget = sampleBudgets.find((b) => b.lines.some(([id]) => items.some((i) => i.id === id)));
  const url = `${site.url}/rentals/${c.id}`;
  const photos = categoryPhotos(c.id);
  // Category FAQs from the data, plus two pricing/booking questions every category gets.
  const name = c.name.toLowerCase();
  const faqs = [
    ...c.faqs,
    {
      q: `Do ${name} rental prices include delivery?`,
      a: `No. The prices shown are per item for one event day: the partner rate plus our 10% fee. Delivery and pickup, setup, a damage waiver and sales tax are added for your venue on the same itemized quote, so you see the all-in total before you book.`,
    },
    {
      q: `How far ahead should I book ${name} in ${site.market}?`,
      a: `For Saturdays from May to October, book 3 to 6 months ahead, because the most popular items sell out first. Weekday and winter events can often be booked 2 to 4 weeks out. Send a quote and we confirm availability with partner rental companies before you pay anything.`,
    },
  ].slice(0, Math.max(c.faqs.length, 5));
  const photoAlt = (p: (typeof photos)[number]) => `${p.alt}: example of ${c.name.toLowerCase()} rentals at a real event (photo by ${p.by} on Unsplash)`;

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
    faqJsonLd(faqs),
    ...(categoryScene(c.id) || hero ? [] : photos.slice(0, 1)).map((p) => ({ "@context": "https://schema.org", ...stockImageJsonLd(p, photoAlt(p)) })),
  ];

  return (
    <>
      <div className="container-x py-14">
        <JsonLd data={jsonLd} />
        <Breadcrumb trail={[{ name: "Rentals", href: "/rentals" }, { name: c.name }]} />

        <header className="mt-10 grid items-center gap-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="eyebrow">{c.name} rental · {site.marketLong}</p>
            <h1 className="display-1 mt-6">
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
            </div>
          </div>
          {categoryScene(c.id) ? (
            <figure>
              <div className="media relative aspect-[4/3] shadow-lift">
                <Image
                  src={categoryScene(c.id)!.src}
                  alt={categoryScene(c.id)!.alt}
                  fill
                  priority
                  sizes="40vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-sm text-muted">{categoryScene(c.id)!.caption}</figcaption>
            </figure>
          ) : hero ? (
            <RentalVisual item={hero} priority className="hidden aspect-square md:block" sizes="40vw" />
          ) : (
            <figure>
              <div className="media relative aspect-[4/3] overflow-hidden shadow-lift">
                <StockImg photo={photos[0]} alt={photoAlt(photos[0])} width={720} height={540} priority />
                <ExampleChip />
              </div>
              <figcaption className="mt-3 text-sm text-muted">
                {photos[0].alt}. <PhotoCredit photo={photos[0]} />
              </figcaption>
            </figure>
          )}
        </header>

        <section className="mt-20" aria-labelledby="items">
          <h2 id="items" className="headline text-4xl">
            {c.name} we rent
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:mt-10 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-4">
            {featured.map((i) => (
              <RentalCard key={i.id} item={i} />
            ))}
          </div>
        </section>

        {sections.length > 0 && (
          <section className="mt-20" aria-labelledby="full-list">
            <details className="group/fl rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="eyebrow">Full price list</span>
                <span id="full-list" className="display-2 mt-3 block">
                  See all {inventoryCount} more {c.name.toLowerCase()} options
                </span>
              </span>
              <Icon name="plus" size={22} className="shrink-0 text-accent transition-transform group-open/fl:rotate-45" />
            </summary>
            <p className="mt-3 max-w-2xl text-muted">
              {inventoryCount} more styles, sizes and finishes from {site.market}-area rental companies. Prices are per
              unit for one event day, before delivery, setup, damage waiver and tax (typically 35-60% more all-in).
            </p>
            <PriceDisclaimer className="mt-2 max-w-2xl" vendorLink />
            <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-2">
              {sections.map(([section, rows]) => (
                <table key={section} className="w-full self-start text-sm">
                  <caption className="pb-3 text-left text-xs font-medium tracking-[0.18em] text-muted uppercase">{section}</caption>
                  <tbody>
                    {rows.map((i) => {
                      const thumb = photosForItem(i);
                      const own = rentalImagePath(i.id, i.categoryId);
                      return (
                      <tr key={i.id} className="border-t border-line">
                        <td className="w-14 py-2.5 pr-3 align-top">
                          {own ? (
                            <span className="relative block h-11 w-11 overflow-hidden rounded-sm bg-surface-2">
                              <Image src={own} alt={rentalAlt(i.name, i.specs, i.id)} fill sizes="44px" loading="lazy" className="object-cover" />
                            </span>
                          ) : thumb.matched ? (
                            <span className="relative block h-11 w-11 overflow-hidden rounded-sm bg-surface-2">
                              <StockImg photo={thumb.photos[0]} alt={stockAlt(thumb.photos[0], i.name, true, site.market)} width={44} />
                            </span>
                          ) : (
                            <span className="grid h-11 w-11 place-items-center rounded-sm bg-surface-2 text-gold/80">
                              <RentalIcon category={c.id} className="h-6 w-6" title={`${i.name} illustration`} />
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          <Link href={itemHref(i)} className="hover:text-gold">
                            {i.name}
                          </Link>
                          {i.specs && <span className="block text-xs text-muted">{i.specs}</span>}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap tabular-nums">
                          {formatPrice(customerPrice(i))}
                          <span className="block text-xs text-muted">{i.unit}</span>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            </div>
            </details>
          </section>
        )}

        <section className="mt-6" aria-labelledby="plan">
          <details className="group/pl rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="eyebrow">Plan it</span>
                <span id="plan" className="display-2 mt-3 block">How many you need and what it costs</span>
              </span>
              <Icon name="plus" size={22} className="shrink-0 text-accent transition-transform group-open/pl:rotate-45" />
            </summary>
            <div className="mt-8">
              <Steps steps={c.planning} />
            </div>
            <div className="mt-12 grid gap-16 lg:grid-cols-2">
              <div>
                <h3 id="prices" className="display-3 mb-6">
                  {c.name} rental prices in {site.market}
                </h3>
                <PriceBars items={featured} caption={`Per-unit rental price for one event day, ${site.marketLong}.`} />
              </div>
              {budget && (
                <div>
                  <h3 className="display-3 mb-6">Worked example</h3>
                  <BudgetExample budget={budget} />
                </div>
              )}
            </div>
          </details>
        </section>

        <section className="mt-28 max-w-4xl" aria-labelledby="faq">
          <p className="eyebrow">Questions</p>
          <h2 id="faq" className="headline mt-6 mb-8 text-4xl sm:text-5xl">
            {c.name} rental FAQs
          </h2>
          <Faqs faqs={faqs} />
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
      <div className="container-x mt-16">
        <PlanningLoop text={c.name} />
      </div>
      <div className="mt-24 -mb-32">
        <CallCta title={<>Planning {c.name.toLowerCase()} for your <em className="text-gold">event</em>?</>} source={`rentals-${c.id}`} />
      </div>
    </>
  );
}
