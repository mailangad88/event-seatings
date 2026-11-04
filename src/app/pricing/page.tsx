import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { Callout, FaqList, Figure, Icon, JsonLd, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { BACKUP_CAP_LABEL, COORDINATION_FEE } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

const { standard, large, largeFrom, focusFrom } = COORDINATION_FEE;
const over = largeFrom - 1;

export const metadata: Metadata = seo({
  title: "Pricing: One Flat Fee, No Markup on Rentals",
  description: `You pay each Chicago rental company its own price. We charge one flat fee, $${standard} up to ${over} guests or $${large} above, only after every company confirms.`,
  alternates: { canonical: "/pricing" },
});

const tiers: { title: string; price: string; who: string; points: string[]; featured?: boolean }[] = [
  {
    title: "One company covers it",
    price: "$0",
    who: "Smaller parties where one rental company has everything",
    points: [
      "We tell you which company to call and what to ask for",
      "You book with them directly",
      "No fee from us",
    ],
  },
  {
    title: `Up to ${over} guests`,
    price: `$${standard}`,
    who: `Events that need two or more rental companies, usually ${focusFrom}+ guests`,
    points: [
      "One written quote across every company, each one named",
      "Every change handled until 14 days out",
      "Delivery check on the morning of your event",
      `Backup if a company cancels, up to ${BACKUP_CAP_LABEL} of any price difference`,
    ],
    featured: true,
  },
  {
    title: `Over ${over} guests`,
    price: `$${large}`,
    who: "Big weddings, sangeets, quinceañeras and galas",
    points: [
      "Everything in the $295 plan",
      "Tents, flooring, lighting and power checked against your site",
      "Delivery and pickup times lined up across every company",
      "One person to call on the day",
    ],
  },
];

const included: { icon: IconName; title: string; text: string }[] = [
  { icon: "quote", title: "A written all-in quote", text: "Every item at each rental company's own price, with delivery, setup, damage waiver and tax shown for your venue." },
  { icon: "users", title: "Companies named before you pay", text: "Your quote names every rental company, so you can look them up, read their reviews and call them yourself." },
  { icon: "phone", title: "A call with Angad", text: `A free ${site.callLength} call before anything is sent. Ask anything about the companies, the plan or the fee.` },
  { icon: "check", title: "Pay after they confirm", text: "You pay our fee only once every rental company has confirmed your date in writing. Not before." },
  { icon: "truck", title: "Morning-of check", text: "On the morning of your event we check every delivery is on its way and call you if anything changes." },
  { icon: "shield", title: "Backup if one cancels", text: `If a company cancels, we find a replacement and cover up to ${BACKUP_CAP_LABEL} of any price difference, or refund our fee.` },
];

const flow = [
  { icon: "quote" as const, title: "Free quote", text: "Tell us the date, guests and venue. Build the list or let us do it." },
  { icon: "phone" as const, title: "Free call", text: "We go through the plan and name the companies." },
  { icon: "users" as const, title: "Companies confirm", text: "Each rental company confirms your date and items in writing." },
  { icon: "check" as const, title: "You pay our fee", text: `$${standard}, or $${large} over ${over} guests. Refundable for 72 hours.` },
  { icon: "truck" as const, title: "Delivered", text: "You pay each company under its own agreement. We look after the rest." },
];

const direct = [
  ["Item prices", "The company's price", "The same price. We add no markup"],
  ["Who you call", "Each company, one by one", "One person for every company"],
  ["Comparing quotes", "You line them up yourself", "One written quote, all in"],
  ["Delivery times", "You line them up across companies", "We line them up and check on the morning"],
  ["If a company cancels", "You start again", `We replace it and cover up to ${BACKUP_CAP_LABEL} of the difference, or refund our fee`],
  ["What it costs", "Your time", `$${standard}, or $${large} over ${over} guests`],
];

const checklist = [
  "You get the full quote in writing, with every company named",
  "You can check each company on Google before you pay",
  "You talk to Angad on a call before anything is booked",
  "Every company confirms your date in writing first",
  "You can cancel for a full refund for 72 hours after paying",
];

const faqs: Faq[] = [
  {
    q: `How much does ${site.name} charge?`,
    a: `One flat fee per event: $${standard} up to ${over} guests, or $${large} above that. Item prices are each rental company's own price, with no markup. If one rental company covers your whole order, we tell you who to call and charge nothing.`,
  },
  {
    q: "When do I pay the fee?",
    a: "Only after every rental company on your quote has confirmed your date and items in writing, and you approve the plan. Quotes and the planning call are free and need no card.",
  },
  {
    q: "Why not just call the rental company myself?",
    a: "If one company has everything you need, you should, and we'll tell you which one. Our fee is worth it when your event needs several companies, such as chairs and tables from one, a tent from another and linens from a third. Then you get one quote, one person to call and a backup if one cancels.",
  },
  {
    q: "Is the fee a percentage of my order?",
    a: `No. It's the same $${standard} whether your rentals cost $2,000 or $10,000 (or $${large} over ${over} guests). It doesn't grow with your bill, so we have no reason to push you to rent more.`,
  },
  {
    q: "Do rental companies pay you too?",
    a: "Not today. Some may pay us a small referral fee in future. It will never change your price, and if a company on your quote pays us one, your quote will say so.",
  },
  {
    q: "What if a rental company cancels?",
    a: `We find a comparable replacement. If it costs more, we cover up to ${BACKUP_CAP_LABEL} of the difference. If we can't replace it, we refund our fee in full.`,
  },
  {
    q: "Can I get my fee back?",
    a: "Yes, in full for 72 hours after you pay. After that, if you postpone, the fee moves to your new date within 12 months. If you don't accept a rental company's agreement once you see it, we refund the fee.",
  },
  {
    q: `You're new. Why should I trust ${site.name}?`,
    a: `We started in 2026 and don't have reviews yet, so we don't ask you to take our word for it. You see every company's name before you pay, every company confirms in writing first, and you can get a full refund for 72 hours.`,
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Event rental coordination",
          serviceType: "Event rental booking and coordination",
          provider: { "@type": "Organization", name: site.name, url: site.url },
          areaServed: { "@type": "City", name: "Chicago" },
          url: `${site.url}/pricing`,
          description: `One quote across every Chicago-area rental company your event needs, at each company's own price, for a flat fee of $${standard} (up to ${over} guests) or $${large} (above), paid after every company confirms.`,
          offers: [
            { "@type": "Offer", name: "One company covers it", price: 0, priceCurrency: "USD" },
            { "@type": "Offer", name: `Coordination, up to ${over} guests`, price: standard, priceCurrency: "USD" },
            { "@type": "Offer", name: `Coordination, over ${over} guests`, price: large, priceCurrency: "USD" },
          ],
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Pricing", href: "/pricing" }]}
        eyebrow="Pricing"
        title="Pay every rental company its own price, plus one flat fee to us"
        intro={`We add nothing to item prices. For an event that needs several rental companies, we charge $${standard} (or $${large} over ${over} guests), and only after every company has confirmed your date in writing.`}
        actions={
          <>
            <Link href="/quote?from=pricing" className="btn-primary">Get my free all-in quote</Link>
            <Link href="/book?from=pricing" className="btn-ghost">Book a free call</Link>
          </>
        }
        media={<Figure {...scenes.midnightLongTable} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="The fee" title="What you pay us">
        <ul className="grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            // Subgrid: the three cards share rows, so prices, notes and lists start at the same height.
            <li key={t.title} className={`card row-span-4 grid grid-rows-subgrid gap-y-0 p-7 ${t.featured ? "ring-2 ring-gold" : ""}`}>
              <h3 className="display-3">{t.title}</h3>
              <p className="mt-3 font-heading text-4xl font-semibold tabular-nums">{t.price}</p>
              <p className="mt-2 text-sm text-muted">{t.who}</p>
              <ul className="mt-5 space-y-2 text-sm leading-6">
                {t.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Icon name="check" size={16} className="mt-1 shrink-0 text-gold" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <Callout kind="note" title="An example" className="mt-8 max-w-3xl">
          Say your 180-guest party needs chairs and tables from one company, a tent from another and linens from a
          third, and the rentals come to $4,000 with delivery and tax. You pay the three companies $4,000 under their own
          agreements, and you pay us ${standard}. The ${standard} is the same if the rentals come to $6,000.
        </Callout>
      </Section>

      <Section tone="sand" eyebrow="Included" title="What the fee covers">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {included.map((p) => (
            <li key={p.title} className="card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={p.icon} size={24} />
              </span>
              <h3 className="display-3 mt-5">{p.title}</h3>
              <p className="mt-3 leading-7 text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="How it works" title="When you pay, step by step">
        <StepFlow
          steps={flow}
          caption={`How paying works with ${site.name}: a free quote, a free call, every rental company confirms in writing, then you pay our flat fee, then each company delivers under its own agreement.`}
        />
      </Section>

      <Section tone="sand" eyebrow="Fair question" title="Should I just call the rental company myself?">
        <p className="max-w-3xl leading-7 text-muted">
          Sometimes, yes. If one company has everything for your party, call them, and we&apos;re happy to tell you who.
          Most backyard parties under about 100 guests are like this. Our fee makes sense when your event needs two or more
          companies and you don&apos;t want to manage them all. See typical lists for{" "}
          <Link href="/events/south-asian-weddings" className="link">South Asian weddings</Link>,{" "}
          <Link href="/events/quinceaneras" className="link">quinceañeras</Link> and{" "}
          <Link href="/events/weddings" className="link">weddings</Link>, browse{" "}
          <Link href="/rentals" className="link">rental prices</Link>, or read{" "}
          <Link href="/how-it-works" className="link">how booking works</Link> and our{" "}
          <Link href="/compare" className="link">booking options compared</Link>.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Booking rental companies yourself compared with booking through {site.name}</caption>
            <thead className="bg-surface-2 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold"> </th>
                <th scope="col" className="px-5 py-4 font-semibold">Calling each company yourself</th>
                <th scope="col" className="px-5 py-4 font-semibold">Through {site.name}</th>
              </tr>
            </thead>
            <tbody>
              {direct.map(([row, self, us]) => (
                <tr key={row} className="border-t border-line align-top">
                  <th scope="row" className="px-5 py-4 font-medium">{row}</th>
                  <td className="px-5 py-4 text-muted">{self}</td>
                  <td className="px-5 py-4 text-muted">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Before you pay" title="What you can check before you pay us anything">
        <div className="grid gap-8 lg:grid-cols-2">
          <ul className="space-y-3">
            {checklist.map((c) => (
              <li key={c} className="flex gap-3 leading-7">
                <Icon name="check" size={20} className="mt-1 shrink-0 text-green" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <Callout kind="check" title="We're new, and we say so">
            {site.name} started in 2026 and has no reviews yet. That&apos;s why nothing is paid until you&apos;ve seen the
            companies&apos; names and they&apos;ve confirmed in writing. Read the full{" "}
            <Link href="/booking-promise" className="link">Booking Promise</Link>.
          </Callout>
        </div>
      </Section>

      <Section tone="sand" eyebrow="Questions" title="Pricing questions, answered">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>

      <div className="-mb-32">
        <CallCta source="pricing" />
      </div>
    </>
  );
}
