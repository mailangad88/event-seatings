import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallCta } from "@/components/CallCta";
import { RentalVisual, rentalAlt, rentalImagePath } from "@/components/rentals/RentalVisual";
import { Breadcrumb, Faqs, JsonLd, RentalCard, Steps, faqJsonLd, itemHref } from "@/components/rentals/parts";
import { catalogItems, customerPrice, formatPrice, getCatalogItem, type CatalogItem } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { categoryPhotos, photosForItem, stockAlt, stockImageJsonLd, stockSrc } from "@/data/stock-photos";
import { ExampleChip, PhotoCredit, StockImg } from "@/components/rentals/StockPhoto";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return catalogItems.map((i) => ({ category: i.categoryId, item: i.id }));
}
export const dynamicParams = false;

async function load(props: PageProps<"/rentals/[category]/[item]">) {
  const { category, item } = await props.params;
  const i = getCatalogItem(item);
  return i && i.categoryId === category ? i : undefined;
}

const unitLabel = (i: CatalogItem) => (i.unit === "each" ? "each" : i.unit);
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const plural = (s: string) => (/(s|x|ch|sh)$/.test(s) ? `${s}es` : `${s}s`);

export async function generateMetadata(props: PageProps<"/rentals/[category]/[item]">): Promise<Metadata> {
  const i = await load(props);
  if (!i) return {};
  const img = rentalImagePath(i.id, i.categoryId);
  const real = photosForItem(i);
  const og = img
    ? { url: img, alt: rentalAlt(i.name, i.specs, i.id) }
    : real.matched
      ? { url: stockSrc(real.photos[0], 1200, 630), width: 1200, height: 630, alt: stockAlt(real.photos[0], i.name, true, site.market) }
      : undefined;
  return {
    title: `${i.name} Rental ${site.market}: ${formatPrice(customerPrice(i))} ${unitLabel(i)}`,
    description: `Rent a ${lower(i.name)} in ${site.market} and the suburbs for ${formatPrice(customerPrice(i))} ${unitLabel(i)}. ${i.specs}. ${i.description} Delivery and setup available.`,
    alternates: { canonical: itemHref(i) },
    ...(og && { openGraph: { images: [og] } }),
  };
}

/** Quantities to show in the "how many" table: by guest count when the item scales with guests. */
function quantityRows(i: CatalogItem) {
  if (i.perGuest) {
    return [50, 100, 150, 200, 250].map((g) => {
      const qty = Math.max(i.minQty ?? 1, Math.ceil(g * i.perGuest!));
      return { label: `${g} guests`, qty };
    });
  }
  const base = i.minQty ?? 1;
  const steps = customerPrice(i) >= 100 ? [1, 2, 3, 4] : customerPrice(i) >= 10 ? [1, 5, 10, 20] : [25, 50, 100, 200];
  return steps.map((n) => {
    const qty = Math.max(n, base);
    return { label: i.unit === "each" ? `${qty} ${qty === 1 ? "unit" : "units"}` : `${qty} × ${i.unit.replace(/^per /, "")}`, qty };
  });
}

function itemFaqs(i: CatalogItem) {
  const price = formatPrice(customerPrice(i));
  const c = getCategory(i.categoryId)!;
  const faqs = [
    {
      q: `How much does it cost to rent a ${lower(i.name)} in ${site.market}?`,
      a: `${price} ${unitLabel(i)} for one event day${i.priceSource === "estimated" ? ", based on current Chicago-area market rates" : ""}. Delivery, setup and pickup are quoted for your venue, along with an optional damage waiver and sales tax. Multi-day rentals are quoted on request.`,
    },
  ];
  if (i.perGuest) {
    const qty100 = Math.max(i.minQty ?? 1, Math.ceil(100 * i.perGuest));
    faqs.push({
      q: `How many ${plural(lower(i.name))} do I need for 100 guests?`,
      a: `About ${qty100}, which comes to ${formatPrice(Math.round(qty100 * customerPrice(i) * 100) / 100)}. Add 5-10% spares for anything guests handle, such as plates, glasses and napkins.`,
    });
  }
  faqs.push(
    {
      q: `Can you deliver a ${lower(i.name)} to my venue?`,
      a: `Yes. We arrange delivery, setup and pickup anywhere in ${site.marketLong}, including ${site.serviceArea.slice(1, 6).join(", ")} and nearby towns. Tell us about stairs, elevators or load-in windows and we include them in the quote.`,
    },
    {
      q: `How far ahead should I reserve?`,
      a: `For May to October weekends, reserve 2-4 months ahead; tents, specialty chairs and dance floors go first. For other dates, 2-4 weeks is usually enough. Your quote holds nothing until you approve it.`,
    },
    ...c.faqs.slice(0, 2),
  );
  return faqs;
}

export default async function ItemPage(props: PageProps<"/rentals/[category]/[item]">) {
  const i = await load(props);
  if (!i) notFound();
  const c = getCategory(i.categoryId)!;
  const price = customerPrice(i);
  const rows = quantityRows(i);
  const maxRow = Math.max(...rows.map((r) => r.qty * price), 1);
  const faqs = itemFaqs(i);
  const related = catalogItems.filter((x) => x.categoryId === i.categoryId && x.id !== i.id).slice(0, 4);
  const pageUrl = `${site.url}${itemHref(i)}`;
  const img = rentalImagePath(i.id, i.categoryId);
  // Real event photos: the same item type when we have it, otherwise general photos of the category.
  const real = photosForItem(i);
  const gallery = (real.matched ? real.photos : categoryPhotos(i.categoryId)).slice(0, 3);
  const galleryAlt = (p: (typeof gallery)[number]) => stockAlt(p, i.name, real.matched, site.market);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${i.name} rental`,
      description: `${i.description} ${i.specs}.`,
      url: pageUrl,
      category: `${c.name} rental`,
      brand: { "@type": "Brand", name: site.name },
      image: [
        ...(img ? [{ "@type": "ImageObject", url: `${site.url}${img}`, caption: rentalAlt(i.name, i.specs, i.id) }] : []),
        ...(real.matched ? gallery.map((p) => stockImageJsonLd(p, galleryAlt(p))) : []),
      ],
      offers: {
        "@type": "Offer",
        price: price.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: price.toFixed(2),
          priceCurrency: "USD",
          unitText: i.unit,
        },
        areaServed: site.serviceArea.map((name) => ({ "@type": "City", name })),
        seller: { "@id": `${site.url}/#business` },
        url: pageUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Rentals", item: `${site.url}/rentals` },
        { "@type": "ListItem", position: 3, name: c.name, item: `${site.url}/rentals/${c.id}` },
        { "@type": "ListItem", position: 4, name: i.name, item: pageUrl },
      ],
    },
    faqJsonLd(faqs),
  ];

  const facts: [string, string][] = [
    ["Specs", i.specs],
    ["Priced", unitLabel(i)],
    ["Category", c.name],
    ...(i.minQty ? ([["Minimum", `${i.minQty} ${i.unit === "each" ? "" : i.unit}`.trim()]] as [string, string][]) : []),
    ...(i.perGuest
      ? ([["Suggested", i.perGuest >= 1 ? `${i.perGuest} per guest` : `About ${Math.ceil(i.perGuest * 100)} per 100 guests`]] as [string, string][])
      : []),
    ["Delivery", `Across ${site.marketLong}`],
  ];

  return (
    <>
      <div className="container-x py-14">
        <JsonLd data={jsonLd} />
        <Breadcrumb trail={[{ name: "Rentals", href: "/rentals" }, { name: c.name, href: `/rentals/${c.id}` }, { name: i.name }]} />

        <div className="mt-10 grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
          <div className="md:sticky md:top-32 md:self-start">
            <RentalVisual item={i} priority photoWidth={720} className="aspect-square" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="md:py-4">
            <p className="font-serif text-lg text-gold italic">{c.name} rental · {site.market}</p>
            <h1 className="headline mt-4 text-5xl leading-[1] sm:text-6xl">{i.name}</h1>
            <p className="mt-6 text-lg leading-8">
              Rent a {lower(i.name)} in {site.market} and the suburbs for{" "}
              <strong className="font-medium">
                {formatPrice(price)} {unitLabel(i)}
              </strong>
              . {i.description}
            </p>

            <div className="mt-8 flex items-baseline gap-3 border-y border-line py-5">
              <span className="headline text-4xl">{formatPrice(price)}</span>
              <span className="text-sm text-muted">{unitLabel(i)}, one event day</span>
              {i.priceSource === "estimated" && <span className="chip ml-auto">Estimated</span>}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/quote?items=${i.id}&from=item-${i.id}`} className="btn-primary">
                Add to my quote
              </Link>
              <Link href={`/book?from=item-${i.id}`} className="btn-ghost">
                Book a free call
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Delivery, setup, damage waiver and tax are itemized in your proposal. Nothing is charged until you approve it.
            </p>

            <dl className="mt-10 border-t border-line text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[130px_1fr] gap-4 border-b border-line py-4">
                  <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {i.chairSlug && (
              <p className="mt-6 text-sm">
                <Link href={`/chairs/${i.chairSlug}`} className="link-line">
                  See finishes, styling and 3D view
                </Link>
              </p>
            )}
          </div>
        </div>

        {gallery.length > 0 && (
          <section className="mt-24" aria-labelledby="real-photos">
            <p className="eyebrow">Real event photos</p>
            <h2 id="real-photos" className="headline mt-6 text-4xl">
              {real.matched ? `${i.name} style at real events` : `${c.name} at real events`}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              {real.matched
                ? "Example photos of this type of rental at real events, so you can picture it. Our rental partner's exact item, colour and finish may differ; ask for a photo of the actual piece in your quote."
                : `Example photos of ${c.name.toLowerCase()} at real events. Ask us for a photo of this exact item when you request a quote.`}
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {gallery.map((p) => (
                <figure key={p.key}>
                  <div className="media relative aspect-[4/3] overflow-hidden">
                    <StockImg photo={p} alt={galleryAlt(p)} width={480} height={360} />
                    <ExampleChip />
                  </div>
                  <figcaption className="mt-2 text-xs text-muted">
                    {p.alt}. <PhotoCredit photo={p} />
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className="mt-28 grid gap-16 lg:grid-cols-2" aria-labelledby="howmany">
          <figure>
            <p className="eyebrow">Quantity &amp; cost</p>
            <h2 id="howmany" className="headline mt-6 text-4xl">
              {i.perGuest ? `How many you need` : "Cost at a glance"}
            </h2>
            <figcaption className="mt-3 text-sm text-muted">
              {i.perGuest
                ? `Suggested quantity by guest count and the rental cost at ${formatPrice(price)} ${unitLabel(i)}.`
                : `Rental cost for common quantities at ${formatPrice(price)} ${unitLabel(i)}.`}
            </figcaption>
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-[0.18em] text-muted uppercase">
                  <th className="pb-2 font-medium">{i.perGuest ? "Event size" : "Quantity"}</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="w-2/5 pb-2" aria-hidden />
                  <th className="pb-2 text-right font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const cost = Math.round(r.qty * price * 100) / 100;
                  return (
                    <tr key={r.label} className="border-t border-line">
                      <td className="py-3">{r.label}</td>
                      <td className="py-3 text-right tabular-nums">{r.qty}</td>
                      <td className="py-3 pl-4">
                        <span className="block h-2 rounded-full bg-gold/75" style={{ width: `${Math.max(3, (cost / maxRow) * 100)}%` }} />
                      </td>
                      <td className="py-3 text-right tabular-nums">{formatPrice(cost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </figure>
          <div>
            <p className="eyebrow">Planning tips</p>
            <h2 className="headline mt-6 mb-8 text-4xl">Getting {c.name.toLowerCase()} right</h2>
            <Steps steps={c.planning.slice(0, 4)} compact />
          </div>
        </section>

        <section className="mt-28 max-w-4xl" aria-labelledby="faq">
          <p className="eyebrow">Questions</p>
          <h2 id="faq" className="headline mt-6 mb-8 text-4xl sm:text-5xl">
            {i.name} rental FAQs
          </h2>
          <Faqs faqs={faqs} />
        </section>

        {related.length > 0 && (
          <section className="mt-28" aria-labelledby="related">
            <h2 id="related" className="headline text-4xl">
              More {c.name.toLowerCase()}
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <RentalCard key={r.id} item={r} />
              ))}
            </div>
            <p className="mt-10">
              <Link href={`/rentals/${c.id}`} className="link-line">
                All {c.name.toLowerCase()} and prices
              </Link>
            </p>
          </section>
        )}
      </div>
      <div className="mt-24 -mb-32">
        <CallCta title={<>Need help planning your <em className="text-gold">{c.name.toLowerCase()}</em>?</>} source={`item-${i.id}`} />
      </div>
    </>
  );
}
