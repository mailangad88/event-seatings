import Link from "@/components/Link";
import { FaqList, Figure, JsonLd, PageHero, QuoteCta, Section, StatRow } from "@/components/ui";
import { formatPrice } from "@/data/catalog";
import {
  PRICE_INDEX_CHECKED,
  PRICE_INDEX_CSV,
  PRICE_INDEX_SLUG,
  priceIndex,
  priceIndexCompanies,
  priceIndexGroups,
  sampleOrder,
} from "@/data/price-index";
import { render } from "@/lib/scenes";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";

const checked = new Date(`${PRICE_INDEX_CHECKED}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const year = PRICE_INDEX_CHECKED.slice(0, 4);
const title = `Chicago Event Rental Price Index ${year}`;
const description = `What ${priceIndex.length} common event rentals cost at ${priceIndexCompanies} Chicago-area rental companies, from their own published price lists. Free to use and cite, with a CSV download.`;

export const metadata = seo({
  title,
  description,
  alternates: { canonical: PRICE_INDEX_SLUG },
  openGraph: { title, description, url: PRICE_INDEX_SLUG, images: [{ url: render("hero-layouts").src, alt: render("hero-layouts").alt }] },
});

const usd = (n: number) => (n < 10 ? `$${n.toFixed(2)}` : formatPrice(n));

export default function PriceIndexPage() {
  const rows = [...priceIndex];
  const byGap = [...rows].sort((a, b) => b.gapPct - a.gapPct);
  const avgGap = Math.round(rows.reduce((s, r) => s + r.gapPct, 0) / rows.length);
  const biggest = byGap[0];
  const gold = rows.find((r) => r.id === "gold-chiavari");
  const order = sampleOrder();
  const orderGap = Math.round(order.high - order.low);
  const scene = render("hero-layouts");
  const max = byGap[0].gapPct;
  const citation = `${site.name}, "${title}," prices checked ${checked}, ${site.url}${PRICE_INDEX_SLUG}`;
  const linkHtml = `<a href="${site.url}${PRICE_INDEX_SLUG}">${title}</a> (${site.name})`;

  const faqs = [
    {
      q: "Where do these prices come from?",
      a: `From the public price lists and online stores of ${priceIndexCompanies} rental companies that deliver in the Chicago area, checked on ${checked}. We did not call for quotes or use private price sheets, so anyone can check the same pages.`,
    },
    {
      q: "Do these prices include delivery and tax?",
      a: "No. They are the per-item rental price each company lists for one event. Delivery and pickup, setup, a damage waiver (often around 10%) and sales tax are added on top, and those vary by company too.",
    },
    {
      q: "Why don't you name the rental companies?",
      a: "We work with many of these companies, and the point of the index is the spread in the market, not ranking one business against another. Each company's own site shows its prices.",
    },
    {
      q: "Why is the gap so big on some items?",
      a: "Part of it is the item itself: one company's gold Chiavari comes with a seat pad and another charges extra for it. Part of it is the business: minimum orders, delivery zones, how new the stock is and how much setup is included. The cheapest line price is not always the cheapest delivered order.",
    },
    {
      q: "Can I use this data in an article or on my website?",
      a: `Yes. You are free to quote the numbers or the CSV as long as you credit ${site.name} and link to this page. If you need a number we don't show here, email ${site.email}.`,
    },
    {
      q: "How often is the index updated?",
      a: "We plan to check the same price lists again before each wedding season. The date at the top of the page is when the prices were last checked.",
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: title,
          description,
          url: `${site.url}${PRICE_INDEX_SLUG}`,
          creator: { "@type": "Organization", name: site.name, url: site.url },
          license: "https://creativecommons.org/licenses/by/4.0/",
          isAccessibleForFree: true,
          dateModified: PRICE_INDEX_CHECKED,
          temporalCoverage: PRICE_INDEX_CHECKED,
          spatialCoverage: { "@type": "Place", name: "Chicago metropolitan area, Illinois" },
          variableMeasured: ["Lowest listed price (USD)", "Median listed price (USD)", "Highest listed price (USD)", "Gap between highest and lowest (%)"],
          distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${site.url}${PRICE_INDEX_CSV}` }],
        }}
      />
      <PageHero
        eyebrow={`Price data · checked ${checked}`}
        title={<>What event rentals <em className="text-gold">really cost</em> in Chicago</>}
        intro={
          <p data-answer>
            We compared the published prices of {priceIndexCompanies} Chicago-area rental companies for {rows.length} items that every company describes
            the same way. On average the highest price was {avgGap}% above the lowest for the exact same item.
            {gold && ` A gold Chiavari chair runs from ${usd(gold.low)} to ${usd(gold.high)} each, depending on who you call.`}
          </p>
        }
        breadcrumbs={[{ name: "Rental cost guides", href: "/rental-cost" }, { name: "Price index", href: PRICE_INDEX_SLUG }]}
        actions={
          <div className="flex flex-wrap gap-3">
            <a href={PRICE_INDEX_CSV} className="btn-primary" download>Download the CSV</a>
            <a href="#cite" className="btn-ghost">Cite or link to this</a>
          </div>
        }
        media={<Figure src={scene.src} alt={scene.alt} caption={scene.caption} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />}
      />

      <Section eyebrow="What we found" title="The same item, very different prices">
        <StatRow
          stats={[
            { value: String(priceIndexCompanies), label: "rental companies compared" },
            { value: String(rows.length), label: "like-for-like items" },
            { value: `${avgGap}%`, label: "average gap, highest vs lowest" },
            { value: `$${orderGap.toLocaleString()}`, label: "gap on a basic 100-guest order" },
          ]}
        />
        <ul className="mt-10 max-w-3xl list-disc space-y-3 pl-5 leading-7 text-muted">
          <li>
            The biggest gap was on the {biggest.label.toLowerCase()}: {usd(biggest.low)} at the lowest and {usd(biggest.high)} at the highest, {biggest.gapPct}%
            more.
          </li>
          {gold && (
            <li>
              {gold.companies} companies list a gold Chiavari chair. For 150 guests that is {formatPrice(gold.low * 150)} at the lowest rate and{" "}
              {formatPrice(gold.high * 150)} at the highest, before delivery.
            </li>
          )}
          <li>
            A basic 100-guest setup ({order.lines.map((l) => `${l.qty} ${l.label.toLowerCase()}${l.qty > 1 ? "s" : ""}`).join(", ")}) costs{" "}
            {formatPrice(order.low)} at the lowest listed prices and {formatPrice(order.high)} at the highest.
          </li>
          <li>Napkins, chair sashes and stanchions cost about the same everywhere. Folding chairs, china plates and party machines like cotton candy makers had some of the largest gaps.</li>
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Chart" title="How much more the highest price is than the lowest">
        <figure>
          <ol aria-label={`Gap between the highest and lowest published price for ${byGap.length} event rental items in Chicago`} className="max-w-3xl space-y-2">
            {byGap.map((r) => (
              <li key={r.id} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 text-sm sm:grid-cols-[14rem_1fr]">
                <span className="truncate text-right">{r.label}</span>
                <span className="flex items-center gap-2">
                  <span className="block h-4 rounded-sm bg-gold" style={{ width: `${Math.max(1, (r.gapPct / max) * 80)}%` }} aria-hidden />
                  <span className="tabular-nums">{r.gapPct}%</span>
                </span>
              </li>
            ))}
          </ol>
          <figcaption className="mt-4 max-w-3xl text-sm text-muted">
            Each bar shows how much more the most expensive company charges than the cheapest, for the same item. Published prices checked {checked}.
          </figcaption>
        </figure>
      </Section>

      <Section eyebrow="Full table" title="Prices by item">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="mb-4 text-left text-muted">
              Each company&apos;s own listed price for one event, before delivery, setup, damage waiver, tax and our flat booking fee.
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-3 pr-4 font-medium">Item</th>
                <th scope="col" className="py-3 pr-4 font-medium">Companies</th>
                <th scope="col" className="py-3 pr-4 font-medium">Lowest</th>
                <th scope="col" className="py-3 pr-4 font-medium">Median</th>
                <th scope="col" className="py-3 pr-4 font-medium">Highest</th>
                <th scope="col" className="py-3 font-medium">Gap</th>
              </tr>
            </thead>
            {priceIndexGroups.map((g) => (
              <tbody key={g}>
                <tr>
                  <th scope="rowgroup" colSpan={6} className="pt-6 pb-2 text-xs font-medium tracking-wide text-gold uppercase">{g}</th>
                </tr>
                {rows
                  .filter((r) => r.group === g)
                  .map((r) => (
                    <tr key={r.id} className="border-b border-line">
                      <th scope="row" className="py-3 pr-4 font-normal">
                        {r.href ? <Link href={r.href} className="link-line">{r.label}</Link> : r.label}
                        <span className="text-muted"> ({r.unit})</span>
                      </th>
                      <td className="py-3 pr-4 tabular-nums">{r.companies}</td>
                      <td className="py-3 pr-4 tabular-nums">{usd(r.low)}</td>
                      <td className="py-3 pr-4 tabular-nums">{usd(r.median)}</td>
                      <td className="py-3 pr-4 tabular-nums">{usd(r.high)}</td>
                      <td className="py-3 tabular-nums">{r.gapPct}%</td>
                    </tr>
                  ))}
              </tbody>
            ))}
          </table>
        </div>
      </Section>

      <Section tone="sand" eyebrow="How we did it" title="Method">
        <div className="max-w-3xl space-y-4 leading-7 text-muted">
          <p>
            On {checked} we read the public price lists and online stores of {priceIndexCompanies} rental companies that deliver in Chicago and the suburbs.
            We kept an item only when at least two companies list it and every listing describes the same thing: same size, same material, same basic style.
            Where one company lists an item twice, we used its lower price.
          </p>
          <p>
            Prices are per item for one event day, as listed. They leave out delivery, setup, damage waivers, tax, minimum order amounts and our flat booking fee.
            The median is the middle price when two or more companies list the item. Small differences in what is included (a seat pad, a color choice) can
            explain part of a gap, and we note those in the FAQ below.
          </p>
          <p>
            Want the delivered price for your own date? Our <Link href="/rental-cost" className="link-line">rental cost guides</Link> show full price ranges by
            category, and the <Link href="/quote" className="link-line">quote builder</Link> adds delivery and tax for your town.
          </p>
        </div>
      </Section>

      <Section id="cite" eyebrow="For writers and bloggers" title="Use this data">
        <div className="grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-line bg-surface p-6">
            <h3 className="font-medium">Suggested credit</h3>
            <p className="mt-3 text-sm leading-6 break-words text-muted">{citation}</p>
          </div>
          <div className="min-w-0 rounded-2xl border border-line bg-surface p-6">
            <h3 className="font-medium">Link code for your page</h3>
            <pre className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface-2 p-3 text-xs"><code>{linkHtml}</code></pre>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm text-muted">
          Writing about wedding or party costs in Chicago and need a number we don&apos;t show? Email{" "}
          <a href={`mailto:${site.email}?subject=Price%20index%20question`} className="link-line">{site.email}</a> or see our{" "}
          <Link href="/press" className="link-line">press page</Link>.
        </p>
      </Section>

      <Section tone="sand" eyebrow="FAQ" title="Questions about the price index">
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
        </div>
      </Section>
      <QuoteCta source="price-index" />
    </>
  );
}
