import type { Metadata } from "next";
import { QuoteForm } from "@/components/QuoteForm";
import { ProcessFlow } from "@/components/ProcessFlow";
import { catalogItems } from "@/data/catalog";
import { toPublicItem } from "@/lib/catalog-types";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Instant Event Rental Quote: Chairs, Tables & More",
  description: `Build your event rental list and see a live price estimate. Chairs, tables, linens and more for weddings and events in ${site.market} and the suburbs.`,
  alternates: { canonical: "/quote" },
};

const faqs: [string, string][] = [
  [
    "How accurate is the instant estimate?",
    "It uses current rental rates for each item and your quantities. Your final proposal confirms availability for your date and adds delivery, setup, damage waiver and tax for your venue, so the rental total itself rarely moves.",
  ],
  [
    "Do I pay anything when I send a quote request?",
    "No. Sending the form only saves your list. Nothing is charged or reserved until you approve a final proposal.",
  ],
  [
    "Who delivers and sets up the rentals?",
    `We coordinate everything with trusted rental partners across ${site.market} and the suburbs, so you deal with one team for chairs, tables, linens and the rest of your list.`,
  ],
  [
    "How fast will I hear back?",
    "Usually within one business day. If you'd like to talk it through sooner, you can book a free 15-minute call after you send your list.",
  ],
  [
    "What if I don't see an item I need?",
    "Add it to the notes. We source most event rentals, from tents and dance floors to specialty linens and lounge furniture.",
  ],
  [
    "How many chairs and tables do I need?",
    "Enter your guest count and the builder suggests quantities: one chair per guest, and one 60-inch round per eight guests or one 8-foot banquet table per eight to ten. Adjust anything you like.",
  ],
];

export default async function QuotePage(props: PageProps<"/quote">) {
  const sp = await props.searchParams;
  const list = (v: unknown) => (typeof v === "string" ? v.split(",") : []);
  const ids = new Set(catalogItems.map((i) => i.id));
  // Old links pass chair slugs (?chairs=ghost,bentwood); new ones pass catalog ids (?items=round-60).
  const initial = [
    ...list(sp.chairs).map((s) => catalogItems.find((i) => i.chairSlug === s)?.id),
    ...list(sp.items),
  ].filter((id): id is string => !!id && ids.has(id));

  // Only customer-safe fields reach the browser; vendor names and costs stay on the server.
  const items = catalogItems.map(toPublicItem);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
      {
        "@type": "OfferCatalog",
        name: `${site.name} event rental catalog`,
        itemListElement: items.slice(0, 60).map((i) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Product", name: i.name, category: i.category },
          price: i.price.toFixed(2),
          priceCurrency: "USD",
          areaServed: site.market,
        })),
      },
    ],
  };

  return (
    <div className="container-x max-w-7xl py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="eyebrow">Instant estimate</p>
      <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-8xl">
        Build your <em className="text-gold">quote</em>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
        Pick what you need, set quantities and watch your price add up. Send it when you&apos;re ready, and we&apos;ll
        confirm availability for your date with a personal proposal. No payment, no commitment.
      </p>
      <ProcessFlow className="mt-16 border-y border-line py-10" />
      <div className="mt-20">
        <QuoteForm items={items} initialItems={initial} />
      </div>

      <section className="mt-28 border-t border-line pt-16" aria-labelledby="quote-faq">
        <p className="eyebrow">Questions</p>
        <h2 id="quote-faq" className="headline mt-4 text-4xl sm:text-5xl">Before you send your list</h2>
        <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {faqs.map(([q, a]) => (
            <div key={q}>
              <dt className="font-serif text-xl">{q}</dt>
              <dd className="mt-2 leading-7 text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
