import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { ProcessFlow } from "@/components/ProcessFlow";
import { Figure, FaqList, Icon, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";
import { getSanityFaqGroups } from "@/sanity/lib/faqs";

export const revalidate = 3600;

export const metadata: Metadata = seo({
  title: "Event Rental FAQ: Chicago Chairs, Tables, Linens & More",
  description: `Answers about renting chairs, tables, linens, dinnerware, tents and more for events in Chicago and the suburbs: pricing, delivery, setup, deposits, timing and damage.`,
  alternates: { canonical: "/faq" },
});

const groups: { id: string; title: string; faqs: Faq[] }[] = [
  {
    id: "how-it-works",
    title: "How it works",
    faqs: [
      {
        q: `What is ${site.name}?`,
        a: `${site.name} is a Chicago-area event rental company. You choose chairs, tables, linens, dinnerware, glassware, tents, lighting and decor in one place, get one itemized quote, and we handle delivery, setup and pickup.`,
      },
      {
        q: "Do I deal with several rental companies?",
        a: "No. You have one point of contact and one quote. We check availability, line up delivery windows and handle changes for you.",
      },
      {
        q: "Can I mix items from different categories?",
        a: "Yes, that is the point. Add a ceremony chair, a different reception chair, farm tables, linens and glassware to the same quote.",
      },
      {
        q: "Can I talk to a person before I decide?",
        a: `Of course. Book a free ${site.callLength} planning call and we will help with quantities, styles and budget.`,
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & payment",
    faqs: [
      {
        q: "How much do event rentals cost?",
        a: "Every item lists its per-piece or per-set price, and your quote totals live as you add items. Item prices are our own prices for a one-day rental, and there's no separate booking fee. Delivery, setup, damage waiver and any venue surcharges are itemized before you book.",
      },
      {
        q: "Is the quote free?",
        a: "Yes. Quotes are free with no obligation. Nothing is reserved or charged until you approve the final quote.",
      },
      {
        q: "Is there a deposit?",
        a: "Most bookings are secured with a deposit once you approve your quote, with the balance due before the event. Exact terms are shown on your quote.",
      },
      {
        q: "Are there minimum orders?",
        a: "No. There's no minimum order with us. Order exactly what you need, and delivery is priced for your order size and address.",
      },
      {
        q: "Should I get a few quotes before deciding?",
        a: "You're welcome to. Most rental companies only give you a price after a call or a form, so it's hard to compare. With us, you can see your full itemized price right on the site before you talk to anyone, so you know what you're comparing against.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery & setup",
    faqs: [
      {
        q: "Where do you deliver?",
        a: `Chicago and the suburbs, including ${site.serviceArea.slice(1).join(", ")} and nearby towns. Ask about venues farther out.`,
      },
      {
        q: "How much does delivery cost?",
        a: "It depends on your order size, your address and whether your venue has stairs or a loading dock. Most orders run $150 to $400 round trip. Your quote shows the exact amount for your date and venue before you book anything.",
      },
      {
        q: "Is setup included?",
        a: "Delivery and pickup are standard. Full setup (placing chairs, dressing tables) is available on most items and is shown as its own line on your quote.",
      },
      {
        q: "What if my venue has stairs, no elevator or strict load-in times?",
        a: "Tell us in your quote request. We share venue details with the delivery crew and plan around docks, stairs and time windows so there are no surprises.",
      },
      {
        q: "When are items picked up?",
        a: "Usually the night of the event or the next morning, depending on your venue's rules. We confirm the pickup window with you in advance.",
      },
    ],
  },
  {
    id: "planning",
    title: "Planning & quantities",
    faqs: [
      {
        q: "How far ahead should I book?",
        a: "For Saturdays from May to October, book 3 to 6 months ahead, especially for tents and popular chairs. Weekday and winter events can often be booked a few weeks out.",
      },
      {
        q: "How many chairs and tables do I need?",
        a: "Plan one chair per guest plus 3 to 5 percent extra. A 60-inch round seats 8 to 10, and an 8-foot banquet table seats 8 to 10. Our free planning call will check your floor plan.",
      },
      {
        q: "Do linens come pressed?",
        a: "Yes. Linens arrive cleaned and pressed. Return them used; laundering is included.",
      },
      {
        q: "What if something is damaged?",
        a: "Normal wear is expected. Breakage or loss is billed at replacement cost, and the damage waiver on your quote covers everyday accidental damage, which we will show on your quote.",
      },
    ],
  },
];

export default async function FaqPage() {
  const allGroups = [...groups, ...(await getSanityFaqGroups())];
  const all = allGroups.flatMap((g) => g.faqs);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: all.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "FAQ", href: "/faq" }]}
        eyebrow="Questions & answers"
        title="Everything you want to know before you rent"
        intro={
          <>
            Pricing, delivery, quantities and timing for event rentals across {site.marketLong}. Still curious? Email{" "}
            <a href={`mailto:${site.email}`} className="link">{site.email}</a>. Counting chairs or tables? Try the{" "}
            <Link href="/seating-planner" className="link">free seating planner</Link> or browse{" "}
            <Link href="/answers" className="link">quick Chicago answers</Link>.
          </>
        }
        actions={
          <>
            <Link href="/quote?from=faq" className="btn-primary">Build your quote</Link>
            <Link href="/book?from=faq" className="btn-ghost">Book a free call</Link>
          </>
        }
        media={<Figure {...scenes.blushLongTable} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />}
      />

      <div className="container-x section-y grid gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="FAQ topics" className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Topics</p>
          <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col">
            {allGroups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="chip hover:border-ink hover:text-ink lg:w-full lg:justify-between">
                  {g.title} <Icon name="arrow" size={14} className="hidden lg:block" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-14">
          {allGroups.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-28">
              <h2 className="display-3">{g.title}</h2>
              <FaqList faqs={g.faqs} schema={false} className="mt-5" />
            </section>
          ))}
        </div>
      </div>

      <Section tone="sand" eyebrow="At a glance" title="How renting with us works">
        <ProcessFlow />
      </Section>

      <div className="-mb-32">
        <CallCta source="faq" />
      </div>
    </>
  );
}
