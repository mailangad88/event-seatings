import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallCta } from "@/components/CallCta";
import { RentalVisual, rentalAlt, rentalImagePath } from "@/components/rentals/RentalVisual";
import { Breadcrumb, Faqs, JsonLd, RentalCard, Steps, faqJsonLd, itemHref } from "@/components/rentals/parts";
import { canonicalItem, catalogItems, customerPrice, formatPrice, getCatalogItem, type CatalogItem } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { categoryPhotos, isPhotoFirst, photosForItem, stockAlt, stockImageJsonLd, stockSrc } from "@/data/stock-photos";
import { imagesFor, originalImage, rentalImage, rentalImageJsonLd, soloImage, styledImage } from "@/data/rental-images";
import { ExampleChip, PhotoCredit, StockImg } from "@/components/rentals/StockPhoto";
import { allInEstimate } from "@/lib/fees";
import { PriceDisclaimer } from "@/components/ui";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

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
// Item names are used as written mid-sentence ("Rent a Stainless Steel Table"). Lowercasing them broke
// brand and style names (Igloo, Americana, Imperial Onyx) and left half-lowercased names before.
const lower = (s: string) => s;
/** "a" or "an" for a phrase: "an oblong table", "an 8' banquet table", "a uniform cover". */
const article = (s: string) => (/^(8|11|18)\b|^(?!one|uni|use|eu)[aeiou]/i.test(s) ? "an" : "a");
const withArticle = (s: string) => `${article(s)} ${s}`;

// Names shared by several items (sizes or finishes of one product) get their specs in the title,
// so every page has a unique title in search results.
const nameCounts = catalogItems.reduce((m, x) => m.set(x.name, (m.get(x.name) ?? 0) + 1), new Map<string, number>());
const titleName = (i: CatalogItem) => {
  if ((nameCounts.get(i.name) ?? 0) < 2 || !i.specs) return i.name;
  // The spec goes first so it survives when a long title is cut to fit search results.
  const raw = i.specs.replace(/^group:\s*/i, "");
  const spec = raw.length > 40 ? `${raw.slice(0, 38).replace(/[\s,;]+\S*$/, "")}…` : raw;
  return `${spec} ${i.name}`;
};
const plural = (s: string) => (/(s|x|ch|sh)$/.test(s) ? `${s}es` : `${s}s`);

const wc = (s: string) => s.split(/\s+/).filter(Boolean).length;

/**
 * The rest of the direct answer under the H1: the item description, then planning facts until the
 * answer reaches about 40-60 words (what the SEO audit checks for answer engines).
 */
function answerExtras(i: CatalogItem, price: number): string {
  const qty = i.perGuest ? Math.max(i.minQty ?? 1, Math.ceil(100 * i.perGuest)) : 0;
  const extras = [
    i.description ?? "",
    qty ? `A 100-guest event needs about ${qty.toLocaleString()}, or ${formatPrice(Math.round(qty * price * 100) / 100)} before delivery.` : "",
    i.minQty ? `The minimum order is ${i.minQty}.` : "",
    "Delivery, setup and pickup are added to the same itemized quote, and the quote is free.",
    `We book it with a vetted ${site.market}-area rental company.`,
  ].filter(Boolean);
  let out = "";
  const lead = 12; // words in "Rent a … in Chicago and the suburbs for $x each."
  for (const e of extras) {
    if (wc(out) + lead >= 40 && wc(out) + wc(e) + lead > 60) break;
    out = out ? `${out} ${e}` : e;
  }
  return out;
}

export async function generateMetadata(props: PageProps<"/rentals/[category]/[item]">): Promise<Metadata> {
  const i = await load(props);
  if (!i) return {};
  const img = isPhotoFirst(i.id) && !styledImage(i.id) ? undefined : rentalImagePath(i.id, i.categoryId);
  const real = photosForItem(i);
  const og = img
    ? { url: img, alt: rentalAlt(i.name, i.specs, i.id) }
    : real.matched
      ? { url: stockSrc(real.photos[0], 1200, 630), width: 1200, height: 630, alt: stockAlt(real.photos[0], i.name, true, site.market) }
      : undefined;
  return seo({
    title: `${titleName(i)} Rental ${site.market}: ${formatPrice(customerPrice(i))} ${unitLabel(i)}`,
    description: `Rent ${withArticle(lower(titleName(i)))} in ${site.market} and the suburbs for ${formatPrice(customerPrice(i))} ${unitLabel(i)}. ${i.specs}. ${i.description} Delivery and setup available.`,
    alternates: { canonical: itemHref(canonicalItem(i)) },
    ...(og && { openGraph: { images: [og] } }),
  });
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
      q: `How much does it cost to rent ${withArticle(lower(i.name))} in ${site.market}?`,
      a: `${price} ${unitLabel(i)} for one event day${i.priceSource === "estimated" ? ", based on current Chicago-area market rates" : ""}. Delivery and pickup (usually $150-$400 per order), setup, a damage waiver (about 10%) and sales tax are added for your venue, so a delivered order typically costs 35-60% more than the rental rates alone. Multi-day rentals are quoted on request.`,
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
      q: `Can you deliver ${withArticle(lower(i.name))} to my venue?`,
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
  // Related: the next items in the same category (wrapping round), so every item links to different
  // neighbours instead of every page showing the same first four.
  const siblings = catalogItems.filter((x) => x.categoryId === i.categoryId);
  const at = siblings.findIndex((x) => x.id === i.id);
  const related = [1, 2, 3, 4].map((n) => siblings[(at + n) % siblings.length]).filter((x, n, a) => x.id !== i.id && a.indexOf(x) === n);
  const pageUrl = `${site.url}${itemHref(i)}`;
  // Where this item sits in its own range (same vendor section, else category), by price. Gives every
  // item page a comparison that is specific to it.
  const range = (i.section ? siblings.filter((x) => x.section === i.section) : siblings).slice().sort((a, b) => customerPrice(a) - customerPrice(b) || a.name.localeCompare(b.name));
  const rank = range.findIndex((x) => x.id === i.id);
  const cheaper = range.slice(Math.max(0, rank - 2), rank).filter((x) => x.name !== i.name);
  const pricier = range.slice(rank + 1, rank + 3).filter((x) => x.name !== i.name);
  const rangeName = (i.section ?? c.name).toLowerCase();
  const img = isPhotoFirst(i.id) && !styledImage(i.id) ? undefined : rentalImagePath(i.id, i.categoryId);
  // Real event photos: the same item type when we have it, otherwise general photos of the category.
  const real = photosForItem(i);
  const gallery = (real.matched ? real.photos : categoryPhotos(i.categoryId)).slice(0, 3);
  const galleryAlt = (p: (typeof gallery)[number]) => stockAlt(p, i.name, real.matched, site.market);
  // When the hero is a styled event scene, also show the plain render so the exact piece is clear.
  const scene = styledImage(i.id);
  const plain = scene ? originalImage(i.id) : undefined;
  const solo = soloImage(i.id);

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
        ...(img
          ? rentalImage(i.id)
            ? imagesFor(i.id).map((m) => rentalImageJsonLd(m))
            : [{ "@type": "ImageObject", url: `${site.url}${img}`, caption: rentalAlt(i.name, i.specs, i.id) }]
          : []),
        ...(solo ? [rentalImageJsonLd(solo)] : []),
        ...(plain ? [rentalImageJsonLd(plain)] : []),
        ...gallery.map((p) => stockImageJsonLd(p, galleryAlt(p))),
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
    ...(i.unit === "each" ? [] : ([["Priced", unitLabel(i)]] as [string, string][])),
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
            <p className="mt-6 text-lg leading-8" data-answer>
              Rent {withArticle(lower(i.name))} in {site.market} and the suburbs for{" "}
              <strong className="font-medium">
                {formatPrice(price)} {unitLabel(i)}
              </strong>
              . {answerExtras(i, price)}
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
            {(() => {
              // Show what a delivered order really costs, not just the rental rate.
              const qty = i.perGuest ? Math.max(i.minQty ?? 1, Math.ceil(100 * i.perGuest)) : Math.max(1, i.minQty ?? 1);
              const est = allInEstimate(price * qty, { categoryIds: [i.categoryId] });
              return (
                <div className="mt-6 border border-line bg-surface p-5 text-sm">
                  <p className="font-medium">
                    Delivered and set up: about {formatPrice(Math.round(est.total))}
                    <span className="font-normal text-muted">
                      {" "}
                      for {qty.toLocaleString()} {qty === 1 ? "unit" : "units"}
                      {i.perGuest ? " (100 guests)" : ""}
                    </span>
                  </p>
                  <dl className="mt-3 space-y-1 text-muted">
                    <div className="flex justify-between gap-4">
                      <dt>Rental ({qty.toLocaleString()} × {formatPrice(price)})</dt>
                      <dd className="tabular-nums">{formatPrice(est.rentals)}</dd>
                    </div>
                    {est.lines.map((l) => (
                      <div key={l.label} className="flex justify-between gap-4">
                        <dt>
                          {l.label}
                          {l.note && <span className="text-xs"> ({l.note})</span>}
                        </dt>
                        <dd className="tabular-nums">{formatPrice(l.amount)}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-muted">
                    Delivery is one charge per order, so it shrinks per item as your list grows. Your proposal confirms
                    every fee for your venue. Nothing is charged until you approve it.
                  </p>
                  <PriceDisclaimer className="mt-2" vendorLink />
                </div>
              );
            })()}

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

        {(solo || (scene && plain)) && (
          <section className="mt-24" aria-labelledby="piece-itself">
            <p className="eyebrow">The piece itself</p>
            <h2 id="piece-itself" className="headline mt-6 text-4xl">
              {i.name} on its own
            </h2>
            <p className="mt-4 max-w-2xl text-muted">
              A closer look at a single piece, so you can see its shape, finish and colour.
              {plain && " The plain render is built from the rental\u2019s real dimensions."}
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[solo, plain].filter((m): m is NonNullable<typeof m> => !!m).map((m) => (
                <figure key={m.src}>
                  <div className="media relative overflow-hidden" style={{ aspectRatio: `${m.width} / ${m.height}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.src} alt={m.alt} width={m.width} height={m.height} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                  <figcaption className="mt-2 text-xs text-muted">{m.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

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

        {range.length > 2 && (
          <section className="mt-28 max-w-4xl" aria-labelledby="compare">
            <p className="eyebrow">How it compares</p>
            <h2 id="compare" className="headline mt-6 text-4xl">
              {i.name} vs similar {rangeName}
            </h2>
            <p className="mt-6 leading-8">
              At {formatPrice(price)} {unitLabel(i)}, the {i.name.toLowerCase()} is number {rank + 1} of {range.length} in our{" "}
              {rangeName} range by price, which runs from {formatPrice(customerPrice(range[0]))} to{" "}
              {formatPrice(customerPrice(range[range.length - 1]))}.
              {cheaper.length > 0 && (
                <>
                  {" "}For less, consider {cheaper.map((x, n) => (
                    <span key={x.id}>
                      {n > 0 ? " or " : ""}
                      <Link href={itemHref(x)} className="link-line">{x.name.toLowerCase()}</Link> ({formatPrice(customerPrice(x))})
                    </span>
                  ))}.
                </>
              )}
              {pricier.length > 0 && (
                <>
                  {" "}One step up: {pricier.map((x, n) => (
                    <span key={x.id}>
                      {n > 0 ? " or " : ""}
                      <Link href={itemHref(x)} className="link-line">{x.name.toLowerCase()}</Link> ({formatPrice(customerPrice(x))})
                    </span>
                  ))}.
                </>
              )}
            </p>
          </section>
        )}

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

        {/* Phones: keep the price and "Add to my quote" in reach while reading specs and FAQs. */}
        <div className="sticky bottom-0 z-40 -mx-4 mt-16 flex items-center gap-3 border-t border-line bg-surface/95 py-3 pr-20 pl-4 backdrop-blur md:hidden">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{i.name}</span>
            <span className="text-xs text-muted">
              <strong className="font-medium text-ink">{formatPrice(price)}</strong> {unitLabel(i)}
            </span>
          </span>
          <Link href={`/quote?items=${i.id}&from=item-bar-${i.id}`} className="btn-primary shrink-0 !px-4 !py-2.5 text-sm">
            Add to quote
          </Link>
        </div>
      </div>
      <div className="mt-24 -mb-32">
        <CallCta title={<>Need help planning your <em className="text-gold">{c.name.toLowerCase()}</em>?</>} source={`item-${i.id}`} />
      </div>
    </>
  );
}
