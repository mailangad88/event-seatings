import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { PriceBars, RentalCard, itemHref } from "@/components/rentals/parts";
import { rentalImagePath } from "@/components/rentals/RentalVisual";
import { Breadcrumbs, FaqList, Figure, JsonLd, PriceDisclaimer, QuoteCta, Section, StatRow } from "@/components/ui";
import { catalogItems, customerPrice, formatPrice, type CatalogItem } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { LOCAL_RENTALS_UPDATED, localAreas, costCategories, costPath, getCostCategory, localCategories, localCategoryPath } from "@/data/local-rentals";
import { allInEstimate } from "@/lib/fees";
import { sceneFor } from "@/lib/scenes";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return costCategories.map((c) => ({ category: c.id }));
}

type Props = { params: Promise<{ category: string }> };

const pct = (arr: number[], p: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * p))];

function load(id: string) {
  const cc = getCostCategory(id);
  const cat = cc && getCategory(cc.id);
  if (!cc || !cat) return null;
  const items = catalogItems.filter((i) => i.categoryId === cc.id);
  const prices = items.map(customerPrice).sort((a, b) => a - b);
  return { cc, cat, items, prices, low: prices[0], q1: pct(prices, 0.25), median: pct(prices, 0.5), q3: pct(prices, 0.75), high: prices[prices.length - 1] };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const d = load((await props.params).category);
  if (!d) return {};
  const { cat, low, median, high } = d;
  const path = costPath(cat.id);
  return seo({
    title: `${cat.name} Rental Cost in Chicago: ${formatPrice(low)} to ${formatPrice(high)}`,
    description: `What ${cat.name.toLowerCase()} rentals cost in Chicago: from ${formatPrice(low)}, typically ${formatPrice(median)} per item, plus delivery, setup, damage waiver and tax, with example totals.`,
    alternates: { canonical: path },
  });
}

/** Price bands with how many items fall in each, for the distribution chart. */
function bands(prices: number[]) {
  const edges = [0, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, Infinity];
  const out: { label: string; n: number }[] = [];
  for (let k = 0; k < edges.length - 1; k++) {
    const n = prices.filter((p) => p >= edges[k] && p < edges[k + 1]).length;
    if (n) out.push({ label: edges[k + 1] === Infinity ? `${formatPrice(edges[k])}+` : `${formatPrice(edges[k])}-${formatPrice(edges[k + 1])}`, n });
  }
  return out;
}

export default async function RentalCostPage(props: Props) {
  const d = load((await props.params).category);
  if (!d) notFound();
  const { cc, cat, items, prices, low, q1, median, q3, high } = d;
  const path = costPath(cat.id);
  const lc = localCategories.find((l) => l.id === cat.id);
  const scene = sceneFor(`cost-${cat.id}`);
  const dist = bands(prices);
  const maxBand = Math.max(...dist.map((b) => b.n));
  // Three sample orders: a budget, typical and premium item at a common quantity.
  const qty = (i: CatalogItem) => (i.perGuest ? Math.max(i.minQty ?? 1, Math.ceil(100 * i.perGuest)) : Math.max(1, i.minQty ?? 1));
  const sorted = [...items].sort((a, b) => customerPrice(a) - customerPrice(b));
  const samples = [sorted[Math.floor(sorted.length * 0.1)], sorted[Math.floor(sorted.length * 0.5)], sorted[Math.floor(sorted.length * 0.9)]]
    .filter((x, n, a) => x && a.findIndex((y) => y.id === x.id) === n)
    .map((i) => {
      const q = qty(i);
      const est = allInEstimate(customerPrice(i) * q, { categoryIds: [cat.id] });
      return { i, q, rental: customerPrice(i) * q, est };
    });
  const showcase = [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured && rentalImagePath(i.id, i.categoryId))].slice(0, 3);
  const bars = [sorted[0], ...[0.2, 0.4, 0.6, 0.8].map((p) => sorted[Math.floor(sorted.length * p)]), sorted[sorted.length - 1]].filter((x, n, a) => x && a.findIndex((y) => y.id === x.id) === n);

  const answer = `${cat.name} rentals in Chicago cost ${formatPrice(low)} to ${formatPrice(high)} per item through ${site.name}, and half of our ${items.length} options cost between ${formatPrice(q1)} and ${formatPrice(q3)}. Delivery, usually $150 to $400 per order, setup, a damage waiver of about 10% and sales tax are added, so delivered orders often run 35 to 60% above the rental total.`;

  const faqs = [
    { q: cc.question, a: answer },
    {
      q: `What is the cheapest ${cat.name.toLowerCase()} rental?`,
      a: `${sorted[0].name} at ${formatPrice(low)} ${sorted[0].unit === "each" ? "each" : sorted[0].unit}. Remember that delivery is priced per order, so very small orders cost more per item once delivery is added.`,
    },
    {
      q: "Do rental prices include delivery and setup?",
      a: "No. The prices shown are the rental for one event day: our own price, with no separate booking fee. Delivery and pickup, setup, a damage waiver and sales tax are itemized on your free quote before you pay anything.",
    },
    {
      q: `How can I save on ${cat.name.toLowerCase()} rentals?`,
      a: `${cc.savings.join(". ")}. Combining categories on one order also saves, because one delivery covers everything.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${cat.name} rental cost in Chicago`,
          description: answer,
          url: `${site.url}${path}`,
          dateModified: LOCAL_RENTALS_UPDATED,
          image: { "@type": "ImageObject", contentUrl: `${site.url}${scene.src}`, caption: scene.alt },
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          about: {
            "@type": "Product",
            name: `${cat.name} rental`,
            image: `${site.url}${scene.src}`,
            offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: low.toFixed(2), highPrice: high.toFixed(2), offerCount: items.length },
          },
        }}
      />
      <header className="tone-sand border-b border-line">
        <div className="container-x pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs className="mb-8 md:mb-12" items={[{ name: "Rental cost guides", href: "/rental-cost" }, { name: cat.name, href: path }]} />
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">Cost guide · Chicago</p>
              <h1 className="display-1 mt-4">{cc.question}</h1>
              <p className="lede mt-6 max-w-2xl" data-answer>{answer}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/quote?from=cost-${cat.id}`} className="btn-primary">Price my event</Link>
                <Link href={`/rentals/${cat.id}`} className="btn-ghost">See every {cat.name.toLowerCase()} price</Link>
              </div>
            </div>
            <Figure src={scene.src} alt={scene.alt} caption={scene.caption} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />
          </div>
        </div>
      </header>

      <Section>
        <StatRow
          stats={[
            { value: formatPrice(low), label: "lowest price" },
            { value: formatPrice(median), label: "median item" },
            { value: `${formatPrice(q1)}-${formatPrice(q3)}`, label: "middle half of items" },
            { value: String(items.length), label: "items priced" },
          ]}
        />
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <figure>
            <h2 className="display-2">How prices spread</h2>
            <figcaption className="mt-3 text-sm text-muted">Number of {cat.name.toLowerCase()} items in each price band (per item, one event day).</figcaption>
            <ul className="mt-6 space-y-3">
              {dist.map((b) => (
                <li key={b.label} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
                  <span className="tabular-nums">{b.label}</span>
                  <span className="h-2.5 rounded-full bg-gold/80" style={{ width: `${Math.max(3, (b.n / maxBand) * 100)}%` }} />
                  <span className="text-right tabular-nums">{b.n}</span>
                </li>
              ))}
            </ul>
          </figure>
          <PriceBars items={bars} caption={`From the cheapest to the most expensive ${cat.name.toLowerCase()}, with steps in between.`} />
        </div>
      </Section>

      <Section tone="sand" eyebrow="Example orders" title="What a delivered order really costs">
        <div className="grid gap-6 md:grid-cols-3">
          {samples.map(({ i, q, rental, est }) => (
            <article key={i.id} className="card p-6">
              <h3 className="font-heading font-semibold text-xl">
                <Link href={itemHref(i)} className="link-line">{i.name}</Link>
              </h3>
              <p className="mt-1 text-sm text-muted">
                {q.toLocaleString()} x {formatPrice(customerPrice(i))}
                {i.perGuest ? " (100 guests)" : ""}
              </p>
              <dl className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between"><dt>Rental</dt><dd className="tabular-nums">{formatPrice(Math.round(rental * 100) / 100)}</dd></div>
                {est.lines.map((l) => (
                  <div key={l.label} className="flex justify-between text-muted"><dt>{l.label}</dt><dd className="tabular-nums">{formatPrice(Math.round(l.amount))}</dd></div>
                ))}
                <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>About</dt><dd className="tabular-nums">{formatPrice(Math.round(est.total))}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <PriceDisclaimer className="mt-8" />
      </Section>

      <Section eyebrow="What moves the price" title={`${cat.name} cost drivers`}>
        <ol className="grid gap-6 md:grid-cols-3">
          {cc.drivers.map((x, n) => (
            <li key={x.title} className="card p-6">
              <span className="font-heading font-semibold text-3xl text-gold">{String(n + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-medium">{x.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{x.body}</p>
            </li>
          ))}
        </ol>
        {showcase.length > 0 && (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((i) => <RentalCard key={i.id} item={i} />)}
          </div>
        )}
      </Section>

      <Section tone="sand" eyebrow="FAQ" title={`${cat.name} rental cost: questions`}>
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
        </div>
      </Section>

      <Section title="Related">
        <div className="grid gap-10 md:grid-cols-2">
          <nav aria-label="Other cost guides">
            <h3 className="font-medium">Other cost guides</h3>
            <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {costCategories.filter((c) => c.id !== cat.id).map((c) => (
                <li key={c.id}><Link href={costPath(c.id)} className="link-line">{getCategory(c.id)?.name} rental cost</Link></li>
              ))}
            </ul>
          </nav>
          {lc && (
            <nav aria-label={`${lc.label} by area`}>
              <h3 className="font-medium">{lc.label} by area</h3>
              <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {localAreas.slice(0, 12).map((l) => (
                  <li key={l.slug}><Link href={localCategoryPath(l.slug, lc)} className="link-line">{lc.label} in {l.name}</Link></li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </Section>

      <QuoteCta source={`cost-${cat.id}`} />
    </>
  );
}
