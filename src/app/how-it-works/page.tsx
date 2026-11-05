import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { Callout, FaqList, Figure, Icon, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { DEPOSIT_LABEL, PAYMENT_SCHEDULE } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { replyPromise, site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "How Event Rentals Work: One Quote for Everything",
  description: `How ${site.name} works: build one itemized quote for chairs, tables, linens, tents and more at the prices on our site, book with a deposit, and we handle delivery, setup and pickup.`,
  alternates: { canonical: "/how-it-works" },
});

const detail = [
  {
    icon: "search",
    title: "1. Build your list",
    text: "Browse rentals by category or start from a styled look. Add quantities as you go; your running total updates instantly.",
    points: ["14 categories, chairs to tents", "Styled looks you can price in one click", "Save and come back any time"],
  },
  {
    icon: "quote",
    title: "2. Send your quote request",
    text: "Tell us your date, venue and guest count. It takes about two minutes and there is no charge or obligation.",
    points: ["Itemized prices", "Delivery and setup shown separately", "Venue notes for the crew"],
  },
  {
    icon: "users",
    title: "3. We confirm your date",
    text: "After a quick call, we check every item for your date and send one itemized proposal, usually within one business day.",
    points: ["Every price and policy shown up front", "Substitutes if something is booked", "One contact for everything"],
  },
  {
    icon: "truck",
    title: "4. Approve, then relax",
    text: `Approve your proposal and pay a ${DEPOSIT_LABEL} to reserve your items. The rest comes due in stages, the last of it ${PAYMENT_SCHEDULE.finalDueDaysBefore} days before your event. We handle delivery, setup and pickup.`,
    points: ["Prices locked once you book", "Replacement if an item falls through", "Pickup the same night or next morning"],
  },
] as const;

const faqs: Faq[] = [
  { q: "How long does a quote take?", a: "Most confirmed quotes go out within one business day. Peak-season Saturdays can take a little longer when we are checking a long list." },
  { q: "Can I change my order after booking?", a: "Yes. Quantities can usually be adjusted until about two weeks before the event, subject to availability." },
  { q: "What if an item is unavailable?", a: "We suggest the closest match in style and price, and you choose whether to swap it." },
  {
    q: "When do I pay, and who do I pay?",
    a: `Nothing until you approve your proposal. Then you pay ${site.name} a ${DEPOSIT_LABEL} to book, fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours (${Math.round(PAYMENT_SCHEDULE.lateFirstShare * 100)}% if your event is within ${PAYMENT_SCHEDULE.secondDueDaysBefore} days), then the rest in stages, the last of it ${PAYMENT_SCHEDULE.finalDueDaysBefore} days before your event.`,
  },
  {
    q: "Is there a booking fee?",
    a: "No. You pay the item prices on our site, plus delivery, setup, damage waiver and tax as their own lines on your quote. That includes one coordinator, a delivery check on the morning of your event, and our Booking Promise.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "How it works", href: "/how-it-works" }]}
        eyebrow="How it works"
        title="How booking your rentals works"
        intro={`Booking with ${site.name} takes four steps: pick your rentals and see live prices, send one free quote request, approve the proposal we confirm for your date, then get delivery, setup and pickup. Here is what happens at each step.`}
        actions={
          <>
            <Link href="/quote?from=how-it-works" className="btn-primary">Start my quote</Link>
            <Link href="/rentals" className="btn-ghost">Browse rentals</Link>
          </>
        }
        media={<Figure {...scenes.midnightGold} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="The process" title="Four steps, about two minutes of your time">
        <StepFlow
          caption={`The ${site.name} booking process: build your list, send your quote request, we confirm your date, and rentals are delivered, set and collected.`}
          steps={detail.map((d) => ({ icon: d.icon, title: d.title.slice(3), text: d.text }))}
        />
      </Section>

      <Section tone="sand">
        <div className="grid gap-5 md:grid-cols-2">
          {detail.map((d) => (
            <article key={d.title} className="card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={d.icon} size={24} />
              </span>
              <h2 className="display-3 mt-5">{d.title}</h2>
              <p className="mt-3 leading-7 text-muted">{d.text}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {d.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Icon name="check" size={16} className="text-gold" /> {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Callout kind="tip" title="Planning tip" className="mt-8">
          Book tents, dance floors and popular chairs first. They sell out earliest for summer Saturdays, while linens and
          dinnerware are usually easier to source closer to the date.
        </Callout>
      </Section>

      <Section eyebrow="Payments & protection" title="Who you pay, and what we guarantee">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <article className="card p-7">
            <h3 className="display-3">Paying for your rentals</h3>
            <ol className="mt-5 space-y-4">
              {[
                ["Free", "Quote, planning call and proposal. No card needed."],
                [DEPOSIT_LABEL[0].toUpperCase() + DEPOSIT_LABEL.slice(1), `Paid to ${site.name} when you book. Fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours.`],
                [`${Math.round(PAYMENT_SCHEDULE.secondShare * 100)}% installment`, `Due ${PAYMENT_SCHEDULE.secondDueDaysBefore} days before the event.`],
                ["Balance", `The rest, with delivery, setup, damage waiver and tax, ${PAYMENT_SCHEDULE.finalDueDaysBefore} days before the event.`],
                ["No booking fee", "The prices on our site are what you pay for the items."],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4">
                  <Icon name="check" size={18} className="mt-1 shrink-0 text-gold" />
                  <span>
                    <span className="font-semibold">{k}.</span> <span className="text-muted">{v}</span>
                  </span>
                </li>
              ))}
            </ol>
          </article>
          <article className="card p-7">
            <h3 className="display-3">The Booking Promise</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                "Price lock on your booked proposal",
                "Every line in writing",
                "Replacement if an item falls through",
                `One coordinator, ${replyPromise}`,
                "Free changes until 14 days before",
                `${PAYMENT_SCHEDULE.refundHours}-hour full refund on your deposit`,
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="shield" size={16} className="text-gold" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/booking-promise" className="btn-ghost btn-sm mt-6">Payments, damage & insurance →</Link>
          </article>
        </div>
      </Section>

      <Section tone="sand" eyebrow="Questions" title="About the process">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>

      <div className="-mb-32">
        <CallCta source="how-it-works" />
      </div>
    </>
  );
}
