import type { Metadata } from "next";
import Link from "@/components/Link";
import { Breadcrumbs, FaqList, Figure, JsonLd, QuoteCta, Section } from "@/components/ui";
import { catalogItems, customerPrice, formatPrice } from "@/data/catalog";
import { getCategory } from "@/data/catalog-products";
import { costCategories, costPath } from "@/data/local-rentals";
import { render } from "@/lib/scenes";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = seo({
  title: "Event Rental Costs in Chicago: Price Guides by Item",
  description: "What event rentals cost in Chicago: price ranges for chairs, tables, linens, tents, dance floors, bounce houses and more, plus what delivery and setup add.",
  alternates: { canonical: "/rental-cost" },
});

export default function RentalCostHub() {
  const rows = costCategories.map((c) => {
    const prices = catalogItems.filter((i) => i.categoryId === c.id).map(customerPrice).sort((a, b) => a - b);
    return { c, name: getCategory(c.id)?.name ?? c.id, low: prices[0], median: prices[Math.floor(prices.length / 2)], n: prices.length };
  });
  const scene = render("hero-layouts");
  const faqs = [
    {
      q: "How much do event rentals cost for 100 guests in Chicago?",
      a: "A simple setup of folding chairs, banquet tables and polyester linens for 100 guests often lands around $800 to $1,500 delivered. Upgraded chairs, full tableware, a tent and a dance floor can take it to $5,000 or more. Each guide below shows real price ranges.",
    },
    {
      q: "What fees are added to rental prices?",
      a: "Delivery and pickup (usually $150 to $400 per order), setup and teardown, a damage waiver of about 10% and sales tax. Every quote itemizes them before you book.",
    },
    {
      q: "Is there a booking fee on top of the item prices?",
      a: `No. Item prices are ${site.name}'s own prices for a one-day rental, and there's no separate booking fee. Delivery and pickup, setup, a damage waiver and sales tax are their own lines on your written quote.`,
    },
    {
      q: "Which categories cost the most to rent?",
      a: "Tents and dance floors usually carry the highest per-unit price because of the labor to install them, followed by specialty chairs and upgraded linens. Standard folding chairs, napkins and flatware sit at the low end. The table above ranks every category by its own low and median price.",
    },
    {
      q: "Does ordering more bring the per-item price down?",
      a: "The per-item price itself usually stays flat, but delivery, setup and a damage waiver are mostly fixed costs per order, so they shrink as a share of the total once you add more items or more quantity to the same quote.",
    },
    {
      q: "Do prices change by season?",
      a: "The item prices shown here hold year-round, but demand pushes delivery scheduling and availability in peak months (May through October weekends), which can mean less flexibility on short-notice orders rather than a higher listed price.",
    },
  ];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Event rental cost guides for Chicago",
          itemListElement: rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}${costPath(r.c.id)}`, name: `${r.name} rental cost` })),
        }}
      />
      <header className="tone-sand border-b border-line">
        <div className="container-x pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs className="mb-8 md:mb-12" items={[{ name: "Rental cost guides", href: "/rental-cost" }]} />
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">Cost guides · Chicago</p>
              <h1 className="display-1 mt-4">What event rentals <em className="text-gold">cost</em> in Chicago</h1>
              <p className="lede mt-6 max-w-2xl" data-answer>
                Event rentals in Chicago range from under a dollar for a napkin or fork to thousands for a large tent. Each guide below
                shows the real price range for one category, from {catalogItems.length.toLocaleString()} priced items, plus what delivery,
                setup, a damage waiver and tax add to a delivered order.
              </p>
            </div>
            <Figure src={scene.src} alt={scene.alt} caption={scene.caption} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />
          </div>
        </div>
      </header>

      <Section title="Price ranges by category">
        <table className="w-full text-left text-sm">
          <caption className="mb-4 text-left text-muted">Per item for one event day, at our price. Delivery, setup, damage waiver and tax are extra.</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-4 font-medium">Category</th>
              <th scope="col" className="py-3 pr-4 font-medium">From</th>
              <th scope="col" className="py-3 pr-4 font-medium">Median</th>
              <th scope="col" className="py-3 font-medium">Items</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.c.id} className="border-b border-line">
                <td className="py-3 pr-4"><Link href={costPath(r.c.id)} className="link-line">{r.name} rental cost</Link></td>
                <td className="py-3 pr-4 tabular-nums">{formatPrice(r.low)}</td>
                <td className="py-3 pr-4 tabular-nums">{formatPrice(r.median)}</td>
                <td className="py-3 tabular-nums">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section tone="sand" eyebrow="FAQ" title="Rental costs: common questions">
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
          <p className="mt-8 text-sm text-muted">
            To see how much prices differ between companies for the same item, read the{" "}
            <Link href="/data/chicago-rental-prices" className="link-line">Chicago event rental price index</Link>. For chairs by style and quantity, see the <Link href="/chair-rental-cost" className="link-line">chair rental cost guides</Link>. For local prices,
            pick your town in <Link href="/party-rentals" className="link-line">party rentals by area</Link>.
          </p>
        </div>
      </Section>
      <QuoteCta source="rental-cost-hub" />
    </>
  );
}
