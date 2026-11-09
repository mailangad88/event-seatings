import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallCta } from "@/components/CallCta";
import { BudgetExample } from "@/components/rentals/BudgetExample";
import { RentalIcon } from "@/components/rentals/RentalIcon";
import { RentalVisual, rentalImagePath } from "@/components/rentals/RentalVisual";
import { Breadcrumb, Faqs, JsonLd, RentalCard, Steps, faqJsonLd, itemHref } from "@/components/rentals/parts";
import { catalogItems, categories } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { categoryPhotos, photosForItem, stockAlt, stockImageJsonLd, stockSrc } from "@/data/stock-photos";
import { ExampleChip, PhotoCredit, StockImg } from "@/components/rentals/StockPhoto";
import { sampleBudgets } from "@/data/sample-budgets";
import { categoryScene } from "@/lib/scenes";
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
  const first = items.map((i) => rentalImagePath(i.id, i.categoryId)).find(Boolean);
  const photo = categoryPhotos(c.id)[0];
  const og = first
    ? { url: first, alt: `${c.name} for rent in ${site.market}` }
    : { url: stockSrc(photo, 1200, 630), width: 1200, height: 630, alt: `${photo.alt}: ${c.name} for rent in ${site.market}` };
  return {
    title: `${c.name} Rental ${site.market}: Get a Free Quote`,
    description: `${c.name} for rent in ${site.market} and the suburbs: ${c.blurb.toLowerCase()}. ${items.length} options, with sizing guides and FAQs. Build a list and get one itemized quote.`,
    alternates: { canonical: `/rentals/${c.id}` },
    openGraph: { images: [og] },
  };
}

export default async function CategoryPage(props: PageProps<"/rentals/[category]">) {
  const c = getCategory((await props.params).category);
  if (!c) notFound();
  const items = itemsIn(c.id);
  const featured = items.filter((i) => i.featured);
  const inventory = items.filter((i) => !i.featured);
  const inventoryCount = inventory.length;
  const sections = [...Map.groupBy(inventory, (i) => i.section ?? c.name)].sort((a, b) => a[0].localeCompare(b[0]));
  const hero = items.find((i) => rentalImagePath(i.id, i.categoryId));
  const budget = sampleBudgets.find((b) => b.lines.some(([id]) => items.some((i) => i.id === id)));
  const url = `${site.url}/rentals/${c.id}`;
  const photos = categoryPhotos(c.id);
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
    faqJsonLd(c.faqs),
    ...photos.slice(0, 4).map((p) => ({ "@context": "https://schema.org", ...stockImageJsonLd(p, photoAlt(p)) })),
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
              <span className="chip">Get your price in a free quote</span>
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
          {categoryScene(c.id) ? (
            <figure>
              <div className="media relative aspect-video shadow-lift">
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
              <div className="media relative aspect-video overflow-hidden shadow-lift">
                <StockImg photo={photos[0]} alt={photoAlt(photos[0])} width={720} height={405} priority />
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
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((i) => (
              <RentalCard key={i.id} item={i} />
            ))}
          </div>
        </section>

        <section className="mt-24" aria-labelledby="real-photos">
          <p className="eyebrow">Real event photos</p>
          <h2 id="real-photos" className="headline mt-6 text-4xl">
            {c.name} at real events
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Example photos of {c.name.toLowerCase()} in use, to help you picture your event. Exact items and finishes vary by
            rental partner; ask for photos of the actual pieces with your quote.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {photos.slice(0, 4).map((p) => (
              <figure key={p.key}>
                <div className="media relative aspect-[4/3] overflow-hidden">
                  <StockImg photo={p} alt={photoAlt(p)} width={400} height={300} />
                </div>
                <figcaption className="mt-2 text-xs text-muted">
                  {p.alt}. <PhotoCredit photo={p} />
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {sections.length > 0 && (
          <section className="mt-28" aria-labelledby="full-list">
            <p className="eyebrow">Full options list</p>
            <h2 id="full-list" className="headline mt-6 text-4xl">
              Every {c.name.toLowerCase()} option
            </h2>
            <p className="mt-3 max-w-2xl text-muted">
              {inventoryCount} more styles, sizes and finishes. Add any of these to your quote to see the price, with
              delivery, setup, teardown, a damage waiver and tax itemized.
            </p>
            <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-2">
              {sections.map(([section, rows]) => (
                <table key={section} className="w-full self-start text-sm">
                  <caption className="pb-3 text-left text-[11px] font-medium tracking-[0.18em] text-muted uppercase">{section}</caption>
                  <tbody>
                    {rows.map((i) => {
                      const thumb = photosForItem(i);
                      return (
                      <tr key={i.id} className="border-t border-line">
                        <td className="w-14 py-2.5 pr-3 align-top">
                          {thumb.matched ? (
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
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <Link href={itemHref(i)} className="link-line text-xs">
                            Get price
                          </Link>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            </div>
          </section>
        )}

        <section className="mt-28" aria-labelledby="plan">
          <p className="eyebrow">Plan it</p>
          <h2 id="plan" className="headline mt-6 text-4xl sm:text-5xl">
            How to work out what you <em className="text-gold">need</em>
          </h2>
          <div className="mt-10">
            <Steps steps={c.planning} />
          </div>
        </section>

        {budget && (
          <section className="mt-28 max-w-xl" aria-labelledby="worked-example">
            <p className="eyebrow">Worked example</p>
            <h2 id="worked-example" className="headline mt-6 mb-8 text-4xl">
              A sample {c.name.toLowerCase()} list
            </h2>
            <BudgetExample budget={budget} />
          </section>
        )}

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
