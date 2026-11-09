import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { AreaMap } from "@/components/geo/AreaMap";
import { PriceBars, RentalCard, itemHref } from "@/components/rentals/parts";
import { rentalImagePath } from "@/components/rentals/RentalVisual";
import { Breadcrumbs, CheckList, FaqList, Figure, IconCards, JsonLd, LinkCards, PriceDisclaimer, QuoteCta, ReadMore, Section, StatRow } from "@/components/ui";
import { LaunchOffer } from "@/components/LaunchOffer";
import { catalogItems, customerPrice, formatPrice, type CatalogItem } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { getLocation, locationPath } from "@/data/geo";
import {
  LOCAL_RENTALS_UPDATED,
  areaRentalsPath,
  getLocalCategory,
  localAreas,
  guestRows,
  localCategories,
  localCategoryPath,
  settingKind,
  costPath,
} from "@/data/local-rentals";
import { render } from "@/lib/scenes";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";

// 281 areas x 10 categories is 2,810 pages, the biggest share of `next build`. Only the busiest areas are built
// ahead; every other area page renders in full on its first visit and is then cached like a built page (ISR), so
// search engines still get a 200 with the whole page. Unknown areas or categories still 404 (see `load`).
const PREBUILT_AREAS = new Set([
  "chicago", "the-loop", "river-north", "west-loop", "gold-coast", "lincoln-park", "lakeview", "wicker-park-bucktown",
  "logan-square", "south-loop", "hyde-park", "naperville", "evanston", "schaumburg", "aurora", "joliet", "oak-park",
  "oak-brook", "st-charles", "geneva", "hinsdale", "lake-forest", "elgin", "wheaton", "downers-grove",
  "arlington-heights", "skokie", "highland-park", "barrington",
]);

export function generateStaticParams() {
  return localAreas
    .filter((l) => PREBUILT_AREAS.has(l.slug))
    .flatMap((l) => localCategories.map((c) => ({ area: l.slug, category: c.slug })));
}

type Props = { params: Promise<{ area: string; category: string }> };

async function load(props: Props) {
  const { area, category } = await props.params;
  // Only areas with local copy have these pages (the list generateStaticParams used to enforce on its own).
  const loc = localAreas.some((l) => l.slug === area) ? getLocation(area) : undefined;
  const lc = getLocalCategory(category);
  const cat = lc && getCategory(lc.id);
  if (!loc || !lc || !cat) return null;
  const items = catalogItems.filter((i) => i.categoryId === lc.id);
  const prices = items.map(customerPrice).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  const place = loc.kind === "neighborhood" ? `${loc.name}, Chicago` : `${loc.name}, IL`;
  return { loc, lc, cat, items, prices, median, place };
}

/** Items to feature: curated first, then inventory items with their own image, spread across price points. */
function pick(items: CatalogItem[], n: number, seed: string): CatalogItem[] {
  const featured = items.filter((i) => i.featured);
  const rest = items.filter((i) => !i.featured && rentalImagePath(i.id, i.categoryId));
  // A small pictured pool would give every area the same picks (near-duplicate pages), so fall back to all of them.
  const pool = rest.length >= 3 * n ? rest : items.filter((i) => !i.featured);
  const h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rotated = pool.map((_, k) => pool[(k + h) % pool.length]);
  return [...featured, ...rotated].slice(0, n);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const d = await load(props);
  if (!d) return {};
  const { loc, lc, cat, prices, place, items } = d;
  const path = localCategoryPath(loc.slug, lc);
  // cat.name (e.g. "Concessions") instead of the longer lc.label keeps most titles under fitTitle's
  // 65-char cutoff, so the place name survives untruncated instead of two long titles truncating to
  // the same text (e.g. "South Chicago" vs "South Chicago Heights" both cutting to "South Chicago").
  const title = `${cat.name} rentals in ${place}: Prices from ${formatPrice(prices[0])}`;
  const description = `${lc.label} in ${place}: ${items.length} options from ${formatPrice(prices[0])}, sizing for your guest count, local delivery notes and one free itemized quote.`;
  return seo({
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [{ url: render(lc.scene).src, alt: render(lc.scene).alt }] },
    other: { "geo.region": "US-IL", "geo.placename": loc.name, "geo.position": `${loc.lat};${loc.lng}`, ICBM: `${loc.lat}, ${loc.lng}` },
  });
}

export default async function AreaCategoryPage(props: Props) {
  const d = await load(props);
  if (!d) notFound();
  const { loc, lc, cat, items, prices, median, place } = d;
  const path = localCategoryPath(loc.slug, lc);
  const url = `${site.url}${path}`;
  const scene = render(lc.scene);
  const shown = pick(items, 6, loc.slug);
  const bars = pick(items, 10, `${loc.slug}-bars`).filter((i, k, a) => a.findIndex((x) => x.id === i.id) === k);
  const rows = guestRows(lc);
  const nearby = loc.nearby.flatMap((s) => localAreas.find((l) => l.slug === s) ?? []);
  const others = localCategories.filter((c) => c.slug !== lc.slug);
  const lower = lc.label.toLowerCase();

  // Direct answer for answer engines: 40-60 words, every number computed from the catalog.
  const answer = `${lc.label} in ${place} start at ${formatPrice(prices[0])}, and the typical item costs about ${formatPrice(median)}, across ${items.length} options. Delivery to ${loc.name} is priced per order, usually $150 to $400 depending on distance, stairs and timing, and one free itemized quote covers delivery, setup and pickup.`;

  // Settings in this area with what changes for this category there.
  const settings = loc.settings.map((s) => ({ ...s, tip: lc.tips[settingKind(s.name)] }));
  // Two delivery notes for the area, rotated by category so sibling pages differ.
  const k = localCategories.indexOf(lc);
  const logistics = [loc.logistics[k % loc.logistics.length], loc.logistics[(k + 1) % loc.logistics.length]];
  // Two paragraphs of local copy, also rotated by category, so area pages for the same category don't read alike.
  const story = loc.story[k % loc.story.length];
  const story2 = loc.story.length > 1 ? loc.story[(k + 1) % loc.story.length] : undefined;

  const sub = (s: string) => s.replaceAll("{area}", loc.name);
  const faqs = [
    {
      q: `How much does ${lc.phrase} cost in ${loc.name}?`,
      a: `${lc.label} through ${site.name} start at ${formatPrice(prices[0])} per item, with a typical item around ${formatPrice(median)} and premium pieces up to ${formatPrice(prices[prices.length - 1])}. Delivery to ${loc.name}, setup, a damage waiver of about 10% and sales tax are added on the same itemized quote.`,
    },
    {
      q: `Do you deliver ${lower} to ${loc.name}?`,
      a: `Yes. We deliver ${lower} to ${place}${loc.zips.length ? ` (ZIP ${loc.zips.slice(0, 4).join(", ")})` : ""}. Delivery is priced per order by the partner and shown on your quote before you book.`,
    },
    { q: sub(lc.localFaq.q), a: sub(lc.localFaq.a) },
    { q: `How far ahead should I book ${lower} in ${loc.name}?`, a: lc.booking },
    ...cat.faqs.slice(0, 1),
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${lc.label} in ${place}`,
      serviceType: lc.phrase,
      description: answer,
      url,
      provider: { "@type": "LocalBusiness", "@id": `${site.url}/#business`, name: site.name, url: site.url },
      areaServed: {
        "@type": loc.kind === "neighborhood" ? "Place" : "City",
        name: place,
        geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng },
        ...(loc.zips.length ? { postalCode: loc.zips.join(", ") } : {}),
      },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: prices[0].toFixed(2),
        highPrice: prices[prices.length - 1].toFixed(2),
        offerCount: items.length,
      },
      image: { "@type": "ImageObject", contentUrl: `${site.url}${scene.src}`, caption: scene.alt },
      dateModified: LOCAL_RENTALS_UPDATED,
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <header className="tone-sand border-b border-line">
        <div className="container-x pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs
            className="mb-8 md:mb-12"
            items={[
              { name: "Party rentals by area", href: "/party-rentals" },
              { name: loc.name, href: areaRentalsPath(loc.slug) },
              { name: lc.label, href: path },
            ]}
          />
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">{loc.region} · {cat.name}</p>
              <h1 className="display-1 mt-4">
                {lc.label} in <em className="text-gold">{loc.name}</em>
              </h1>
              <p className="lede mt-6 max-w-2xl" data-answer>
                {answer}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/quote?from=local-${lc.slug}-${loc.slug}`} className="btn-primary">
                  Get a free quote
                </Link>
                <Link href={`/rentals/${cat.id}`} className="btn-ghost">
                  See all {cat.name.toLowerCase()}
                </Link>
              </div>
              <LaunchOffer from={`local-${lc.slug}-${loc.slug}`} />
            </div>
            <Figure src={scene.src} alt={`${scene.alt}. ${lc.label} for events in ${place}.`} caption={scene.caption} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />
          </div>
        </div>
      </header>

      <Section>
        <StatRow
          stats={[
            { value: formatPrice(prices[0]), label: `lowest ${cat.name.toLowerCase()} price` },
            { value: formatPrice(median), label: "typical item" },
            { value: String(items.length), label: "options to choose from" },
            { value: formatPrice(prices[prices.length - 1]), label: "top of the range" },
          ]}
        />
        <h2 className="display-2 mt-16">Popular {cat.name.toLowerCase()} for {loc.name} events</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => (
            <RentalCard key={i.id} item={i} showPrice />
          ))}
        </div>
        <PriceDisclaimer className="mt-8" />
      </Section>

      <Section tone="sand" eyebrow={`Planning for ${loc.name}`} title={`How much you need, by guest count`}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <table className="w-full text-left text-sm">
              <caption className="mb-4 text-left text-muted">{lc.sizingNote} These are rules of thumb; we confirm counts on your quote.</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-3 pr-4 font-medium">Guests</th>
                  <th scope="col" className="py-3 font-medium">You will need about</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.guests} className="border-b border-line">
                    <td className="py-3 pr-4 tabular-nums">{r.label}</td>
                    <td className="py-3">{r.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-sm text-muted">
              Want exact counts for your floor plan? Try the <Link href="/seating-planner" className="link-line">seating planner</Link> or see{" "}
              <Link href={costPath(cat.id)} className="link-line">what {cat.name.toLowerCase()} cost in Chicago</Link>.
            </p>
          </div>
          <PriceBars items={bars} caption={`Price per item for a sample of ${cat.name.toLowerCase()} available in ${loc.name}.`} />
        </div>
      </Section>

      <Section eyebrow={`Celebrating in ${loc.name}`} title={`Where ${loc.name} hosts use ${cat.name.toLowerCase()}`}>
        {story && (
          <ReadMore className="mb-10 max-w-3xl" label={`More about ${loc.name}`} lead={<p className="leading-7 text-muted">{story}</p>}>
            {story2 && <p className="leading-7 text-muted">{story2}</p>}
          </ReadMore>
        )}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <IconCards
            columns={2}
            items={settings.map((s) => ({
              title: s.name,
              text: s.note,
              extra: (
                <>
                  <strong className="font-medium">{cat.name} here:</strong> {s.tip}
                </>
              ),
            }))}
          />
          <div>
            <Figure caption={`${loc.name} (${loc.region}) on our Chicagoland delivery map.`}>
              <AreaMap active={loc} />
            </Figure>
            <h3 className="display-3 mt-10">Delivery notes for {loc.name}</h3>
            <CheckList className="mt-4" items={logistics} />
          </div>
        </div>
      </Section>

      <Section tone="sand" eyebrow="How to plan" title={`Getting ${lower} right`}>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cat.planning.map((p, i) => (
            <li key={p.title} className="card p-6">
              <span className="font-heading font-semibold text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-medium">{p.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{p.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="FAQ" title={`${lc.label} in ${loc.name}: questions`}>
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
        </div>
      </Section>

      <Section tone="sand" title={`More for your ${loc.name} event`}>
        <div className="grid gap-10 lg:grid-cols-3">
          <nav aria-label={`Other rentals in ${loc.name}`}>
            <h3 className="eyebrow">Other rentals in {loc.name}</h3>
            <LinkCards
              compact
              columns={1}
              className="mt-4"
              items={[
                ...others.map((c) => ({ href: localCategoryPath(loc.slug, c), label: `${c.label} in ${loc.name}` })),
                { href: locationPath(loc), label: `Chair rentals in ${loc.name}` },
              ]}
            />
          </nav>
          <nav aria-label={`${lc.label} nearby`}>
            <h3 className="eyebrow">{lc.label} nearby</h3>
            <LinkCards
              compact
              columns={1}
              className="mt-4"
              items={nearby.map((n) => ({ href: localCategoryPath(n.slug, lc), label: `${lc.label} in ${n.name}`, icon: "pin" as const }))}
            />
          </nav>
          <nav aria-label="Start planning">
            <h3 className="eyebrow">Start planning</h3>
            <LinkCards
              compact
              columns={1}
              className="mt-4"
              items={[
                { href: areaRentalsPath(loc.slug), label: `Everything we rent in ${loc.name}`, icon: "pin" as const },
                { href: `/rentals/${cat.id}`, label: `Full ${cat.name.toLowerCase()} price list`, icon: "list" as const },
                { href: costPath(cat.id), label: `${cat.name} rental cost guide`, icon: "wallet" as const },
                { href: "/how-it-works", label: "How booking works", icon: "route" as const },
                ...(shown[0] ? [{ href: itemHref(shown[0]), label: shown[0].name }] : []),
              ]}
            />
          </nav>
        </div>
      </Section>

      <QuoteCta source={`local-${lc.slug}-${loc.slug}`} title={<>Price your {loc.name} event in minutes</>} />
    </>
  );
}
