import type { Metadata } from "next";
import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { Callout, FaqList, Figure, Icon, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { BOOKING_FEE_LABEL } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Event Rentals Work: One Quote for Everything",
  description: `How ${site.name} works: build one itemized quote for chairs, tables, linens, tents and more, pay nothing until a vendor confirms, and we coordinate insured Chicago-area rental companies from delivery to pickup.`,
  alternates: { canonical: "/how-it-works" },
};

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
    title: "3. We confirm with vendors",
    text: "After a quick call, we check your date with insured Chicago-area rental companies and send one proposal naming each vendor, usually within one business day.",
    points: ["Every fee and policy shown up front", "Substitutes if something is booked", "One contact for every vendor"],
  },
  {
    icon: "truck",
    title: "4. Approve, then relax",
    text: `Approve your proposal and pay our ${BOOKING_FEE_LABEL} booking fee. The rental company sends its agreement and deposit invoice, and we coordinate delivery, setup and pickup.`,
    points: ["Price locked once you approve", "Backup guarantee if a vendor cancels", "Pickup the same night or next morning"],
  },
] as const;

const faqs: Faq[] = [
  { q: "How long does a quote take?", a: "Most confirmed quotes go out within one business day. Peak-season Saturdays can take a little longer when we are checking several vendors." },
  { q: "Can I change my order after booking?", a: "Yes. Quantities can usually be adjusted until about two weeks before the event, subject to availability." },
  { q: "What if an item is unavailable?", a: "We suggest the closest match in style and price, and you choose whether to swap it." },
  {
    q: `Who actually delivers my rentals?`,
    a: `Independent Chicago-area rental companies that we vet and that carry liability insurance. ${site.name} is the booking and coordination service: we name your rental company in your proposal, and its rental agreement covers delivery, setup and pickup.`,
  },
  {
    q: "When do I pay, and who do I pay?",
    a: `Nothing until a rental company confirms your date and you approve your proposal. Then you pay our ${BOOKING_FEE_LABEL} booking fee to us, and the rental company's deposit and balance to them under their agreement.`,
  },
  {
    q: "Are your prices higher than booking direct?",
    a: `Our prices include a ${BOOKING_FEE_LABEL} booking and coordination fee on top of the rental company's price, and your proposal shows both. In return you get one quote for every category, one coordinator, and our Booking Promise.`,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "How it works", href: "/how-it-works" }]}
        eyebrow="How it works"
        title="One list. One quote. Every rental handled."
        intro={`Here is exactly what happens from the moment you start browsing to the moment the last chair leaves your venue.`}
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
          caption={`The ${site.name} booking process: build your list, send your quote request, we confirm with vendors, and rentals are delivered, set and collected.`}
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
        <p className="mt-6 text-sm text-muted">
          Run a rental company? <Link href="/partners" className="link">Become a partner</Link> and get itemized
          bookings from our customers.
        </p>
      </Section>

      <Section eyebrow="Payments & protection" title="Who you pay, and what we guarantee">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <article className="card p-7">
            <h3 className="display-3">Paying for your rentals</h3>
            <ol className="mt-5 space-y-4">
              {[
                ["Free", "Quote, planning call and proposal. No card needed."],
                [`${BOOKING_FEE_LABEL} booking fee`, `Paid to ${site.name} when you approve, only after your vendor confirms.`],
                ["Deposit", "Paid to the rental company at booking, under its agreement."],
                ["Balance", "Paid to the rental company, usually 7-14 days before the event."],
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
                "Price lock on your approved proposal",
                "Only insured, vetted rental companies",
                "Backup guarantee if a vendor cancels",
                "One coordinator, replies within one business hour",
                "Free changes until 14 days before",
                "72-hour full refund on our booking fee",
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
