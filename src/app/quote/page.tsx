import type { Metadata } from "next";
import { QuoteForm, type QuoteItem } from "@/components/QuoteForm";
import { rentalAlt, rentalImagePath } from "@/components/rentals/RentalVisual";
import { Figure, FaqList, JsonLd, PageHero, StepFlow, type Faq } from "@/components/ui";
import { catalogItems } from "@/data/catalog";
import { getEventPreset, getLook } from "@/data/quote-presets";
import { toPublicItem } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Instant Event Rental Quote: Chairs, Tables, Linens & More",
  description: `Build your event rental list and see a live price. Chairs, tables, linens, tableware, tents and more for weddings and events in ${site.market} and the suburbs.`,
  alternates: { canonical: "/quote" },
};

const faqs: Faq[] = [
  {
    q: "How accurate is the instant estimate?",
    a: "It uses current rental rates for each item and your quantities. Your final proposal confirms availability for your date and adds delivery, setup, damage waiver and tax for your venue, so the rental total itself rarely moves.",
  },
  {
    q: "Do I pay anything when I send a quote request?",
    a: "No. Sending the form only saves your list. Nothing is charged or reserved until you approve a final proposal.",
  },
  {
    q: "Who delivers and sets up the rentals?",
    a: `We coordinate everything with trusted rental partners across ${site.market} and the suburbs, so you deal with one team for chairs, tables, linens and the rest of your list.`,
  },
  {
    q: "How fast will I hear back?",
    a: "Usually within one business day. If you'd like to talk it through sooner, you can book a free 15-minute call after you send your list.",
  },
  {
    q: "What if I don't see an item I need?",
    a: "Add it to the notes. We source most event rentals, from tents and dance floors to specialty linens and lounge furniture.",
  },
  {
    q: "How many chairs and tables do I need?",
    a: "Enter your guest count and the builder suggests quantities: one chair and place setting per guest, and one 60-inch round per eight guests. Adjust anything you like.",
  },
];

const steps = [
  { title: "Pick your rentals", text: "Choose items and quantities and watch the total update.", icon: "chair" as const },
  { title: "Send your list", text: "Add your date and venue. No payment, no commitment.", icon: "calendar" as const },
  { title: "Get a confirmed proposal", text: "We check availability with our partners, usually within a day.", icon: "quote" as const },
  { title: "Delivered and set up", text: "Everything arrives, gets set up and is picked up after.", icon: "truck" as const },
];

export default async function QuotePage(props: PageProps<"/quote">) {
  const sp = await props.searchParams;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const list = (v: unknown) => str(v)?.split(",") ?? [];
  const ids = new Set(catalogItems.map((i) => i.id));

  // Home page "Shop the look" and event tiles pass ?look= or ?event= to start from a typical list.
  const preset = getLook(str(sp.look)) ?? getEventPreset(str(sp.event));
  const presetLines = preset?.lines.filter((l) => ids.has(l.id));

  // Old links pass chair slugs (?chairs=ghost,bentwood); catalog pages pass ids (?items=round-60).
  const initial = [
    ...list(sp.chairs).map((s) => catalogItems.find((i) => i.chairSlug === s)?.id),
    ...list(sp.items),
  ].filter((id): id is string => !!id && ids.has(id));

  const guestsParam = Math.min(5000, Math.max(0, Math.floor(Number(sp.guests) || 0)));
  const guests = guestsParam || (preset ? 100 : 0);
  // Where the visitor clicked through from, saved on the lead as the form source.
  const from = (str(sp.from) ?? (preset && `${str(sp.look) ? "look" : "event"}-${preset.id}`))
    ?.replace(/[^\w-]/g, "")
    .slice(0, 60);

  // Only customer-safe fields reach the browser; vendor names and costs stay on the server.
  const items: QuoteItem[] = catalogItems.map((i) => ({
    ...toPublicItem(i),
    categoryId: i.categoryId,
    image: i.image ?? rentalImagePath(i.id, i.categoryId),
    imageAlt: i.imageAlt ?? rentalAlt(i.name, i.specs),
  }));

  const hero = scenes.gildedIvory;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: `${site.name} event rental catalog`,
          itemListElement: items.slice(0, 60).map((i) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Product", name: i.name, category: i.category },
            price: i.price.toFixed(2),
            priceCurrency: "USD",
            areaServed: site.market,
          })),
        }}
      />
      <PageHero
        eyebrow="Instant quote"
        title="Price your event in minutes"
        intro={
          <>
            Pick chairs, tables, linens, tableware and more, set quantities and watch your total add up. Send it when
            you&apos;re ready and we&apos;ll confirm availability with a personal proposal. No payment, no commitment.
          </>
        }
        breadcrumbs={[{ name: "Get a quote", href: "/quote" }]}
        media={<Figure src={hero.src} alt={hero.alt} caption={hero.caption} width={hero.width} height={hero.height} ratio="4/3" priority />}
      />

      <div className="container-x section-y">
        <StepFlow steps={steps} caption="How a quote works: pick rentals, send your list, get a proposal, delivered and set up." />
        <div className="mt-16">
          <QuoteForm
            items={items}
            initialItems={initial}
            initialGuests={guests}
            preset={preset && presetLines ? { label: preset.label, eventType: preset.eventType, lines: presetLines } : undefined}
            from={from}
          />
        </div>

        <section className="mt-24" aria-labelledby="quote-faq">
          <p className="eyebrow">Questions</p>
          <h2 id="quote-faq" className="display-2 mt-3">Before you send your list</h2>
          <FaqList faqs={faqs} className="mt-8 max-w-3xl" />
        </section>
      </div>
    </>
  );
}
