import type { Metadata } from "next";
import Link from "@/components/Link";
import { RentalCalculator, type CalcGroup, type CalcItem } from "@/components/RentalCalculator";
import { rentalAlt, rentalImagePath } from "@/components/rentals/RentalVisual";
import { FaqList, Figure, JsonLd, PageHero, QuoteCta, Section, type Faq } from "@/components/ui";
import { catalogItems } from "@/data/catalog";
import { toPublicItem } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

const title = "Event Rental Calculator: Chairs, Tables, Linens and Dishes";
const description =
  "Free event rental calculator: enter your guest count to get chairs, tables, linens, plates, flatware and glasses, priced from current Chicago rental lists.";

export const metadata: Metadata = seo({ title, description, alternates: { canonical: "/tools/rental-calculator" } });

function item(id: string): CalcItem {
  const raw = catalogItems.find((i) => i.id === id);
  if (!raw) throw new Error(`calculator item missing: ${id}`);
  const p = toPublicItem(raw);
  const cat = (raw as { categoryId?: string }).categoryId;
  const image = cat ? rentalImagePath(id, cat as Parameters<typeof rentalImagePath>[1]) : undefined;
  return { id, name: p.name, price: p.price, unit: p.unit, estimated: p.estimated, image, alt: rentalAlt(p.name, p.specs ?? "", id) };
}

const faqs: Faq[] = [
  { q: "How many tables do I need for 100 guests?", a: "Thirteen 60-inch rounds at 8 guests each, or ten at 10 guests each. Eight per table leaves room for chargers and centerpieces." },
  { q: "How many plates do I rent per guest?", a: "For a plated dinner, one dinner plate and one salad plate per guest, plus a charger if you want one. Add dessert plates if dessert is served separately." },
  { q: "Do the calculator prices include delivery?", a: "No. They are rental prices from current Chicago price lists, with no markup. Our flat booking fee is separate. Delivery, setup and tax depend on your venue and date and are added in your proposal." },
  { q: "Can I change the list before I send it?", a: "Yes. 'Price this exact list' opens the quote builder with these items and your guest count, and you can change anything there." },
];

export default function Page() {
  const chairs = ["white-folding", "white-resin-folding", "gold-chiavari", "crossback", "ghost"].map(item);
  const groups: CalcGroup[] = [
    { id: "tables", label: "Tables and linens", lines: [{ item: item("round-60"), per: "table" }, { item: item("round-floor-length"), per: "table" }, { item: item("cloth-napkins"), per: "guest" }] },
    {
      id: "dinner",
      label: "Plated dinner",
      lines: [
        { item: item("dinner-plate"), per: "guest" },
        { item: item("salad-plate"), per: "guest" },
        { item: item("dinner-fork"), per: "guest" },
        { item: item("salad-fork"), per: "guest" },
        { item: item("dinner-knife"), per: "guest" },
        { item: item("water-goblet"), per: "guest" },
        { item: item("wine-glass"), per: "guest" },
      ],
    },
    { id: "chargers", label: "Chargers", optional: "(optional)", lines: [{ item: item("charger-plate"), per: "guest" }] },
    { id: "cocktail", label: "Cocktail hour", optional: "(1 highboy per 10)", lines: [{ item: item("cocktail-highboy"), per: "ten" }, { item: item("spandex-highboy"), per: "ten" }] },
  ];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Event rental calculator",
          url: `${site.url}/tools/rental-calculator`,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description,
          provider: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Free tools", href: "/tools" }, { name: "Rental calculator", href: "/tools/rental-calculator" }]}
        eyebrow="Free tool"
        title="Event rental calculator"
        intro={
          <span id="short-answer" data-answer>
            Plan one chair per guest, one 60-inch round per eight guests with a floor-length linen each, and one of every plate, fork, knife and glass per guest for a plated dinner. Enter your guest count below to see the full list priced from current Chicago rental price lists, then send it as a quote.
          </span>
        }
        media={<Figure {...scenes.midnightLongTable} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />
      <Section title="Your list">
        <RentalCalculator chairs={chairs} groups={groups} />
      </Section>
      <Section tone="sand" eyebrow="FAQ" title="Questions people ask">
        <FaqList faqs={faqs} />
        <p className="mt-8 text-sm">
          More: <Link href="/solutions/how-much-to-rent-for-event" className="link">quantity rules of thumb</Link> ·{" "}
          <Link href="/seating-planner" className="link">seating planner</Link> · <Link href="/table-seating-guides" className="link">table seating guides</Link>
        </p>
      </Section>
      <QuoteCta source="rental-calculator" />
    </>
  );
}
