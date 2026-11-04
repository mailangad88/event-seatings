import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { Callout, FaqList, Figure, Icon, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { DEPOSIT, DEPOSIT_LABEL } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { replyPromise, site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Payments, Deposits & Our Booking Promise",
  description: `Who you pay, when, and what's protected when you book event rentals with ${site.name} in ${site.market}: free quotes, every price in writing, a deposit refundable for ${DEPOSIT.refundHours} hours, locked prices and a replacement if an item falls through.`,
  alternates: { canonical: "/booking-promise" },
});

const promises: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "shield",
    title: "Price lock",
    text: "The item prices on the quote you book are what you pay for those items. Prices only change if you change your order.",
  },
  {
    icon: "quote",
    title: "Every line in writing",
    text: "Your quote lists every item, then delivery, setup, damage waiver and tax as their own lines. No separate booking fee.",
  },
  {
    icon: "users",
    title: "Replacement if an item falls through",
    text: "If something you booked can't be delivered, we replace it with the same or better at the price you agreed, or refund what you paid for it.",
  },
  {
    icon: "chat",
    title: "One person, start to finish",
    text: `One coordinator handles every change and question, and ${replyPromise}. On the morning of your event we check your delivery is on its way.`,
  },
  {
    icon: "calendar",
    title: "Free changes until 14 days out",
    text: "Add or drop quantities and swap items at no charge until 14 days before your event, subject to stock.",
  },
  {
    icon: "heart",
    title: `${DEPOSIT.refundHours}-hour change of heart`,
    text: `Your deposit is fully refundable for ${DEPOSIT.refundHours} hours after you pay. After that, our terms explain cancelling or moving your date.`,
  },
];

const payments = [
  { what: "Quote, planning call and proposal", amount: "Free", when: "Any time, no card needed" },
  { what: "Deposit", amount: `${Math.round(DEPOSIT.share * 100)}% of the rentals, at least $${DEPOSIT.min}`, when: `When you book. Fully refundable for ${DEPOSIT.refundHours} hours` },
  { what: "Balance", amount: "The rest of the rentals, plus delivery, setup, damage waiver and tax", when: `${DEPOSIT.balanceDaysBefore} days before your event, after your final count` },
];

const flow = [
  { icon: "quote" as const, title: "Free quote", text: "Build your list online. No card, no commitment." },
  { icon: "phone" as const, title: "Free call", text: "We go through your venue, times and anything tricky." },
  { icon: "check" as const, title: "Deposit", text: `A ${DEPOSIT_LABEL} reserves your items for your date.` },
  { icon: "calendar" as const, title: "Balance", text: `Due ${DEPOSIT.balanceDaysBefore} days before, once your count is final.` },
  { icon: "truck" as const, title: "Delivered & collected", text: "We check delivery on the morning and arrange pickup after." },
];

const faqs: Faq[] = [
  {
    q: "Do I pay anything to get a quote?",
    a: "No. Quotes, the planning call and your proposal are free. You pay only when you decide to book.",
  },
  {
    q: `How does ${site.name} charge?`,
    a: "By the item, at the prices on our site. Your quote adds delivery and pickup, setup if you want it, a damage waiver and sales tax. There is no separate booking or planning fee.",
  },
  {
    q: "Who do I pay?",
    a: `${site.name}, for everything on your quote: a ${DEPOSIT_LABEL} to book and the balance ${DEPOSIT.balanceDaysBefore} days before your event.`,
  },
  {
    q: "What if something gets damaged?",
    a: "The damage waiver on your quote covers everyday accidents like wine on a linen or a scuffed chair leg. It doesn't cover loss, theft or careless damage. If a damage charge comes up, we show you what was damaged and the charge before anything is billed.",
  },
  {
    q: "Does my venue need a certificate of insurance?",
    a: "Many Chicago venues ask for one from everyone delivering. We can't issue certificates of insurance yet, so check your venue's rules and tell us what they require before you book. Some venues also ask hosts for one-day event liability insurance, and we'll tell you on your call if yours does.",
  },
  {
    q: "What if an item isn't available after I book?",
    a: "We replace it with the same or better at the price you agreed. If we can't, we refund what you paid for that item.",
  },
  {
    q: "What if I need to cancel or postpone?",
    a: `Your deposit is fully refundable for ${DEPOSIT.refundHours} hours after you pay. After that, our terms set out what's refunded or moved to a new date.`,
  },
  {
    q: "How do I pay?",
    a: "By card or bank transfer through a secure Stripe payment link sent with your proposal.",
  },
];

export default function BookingPromisePage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: "How it works", href: "/how-it-works" },
          { name: "Payments & Booking Promise", href: "/booking-promise" },
        ]}
        eyebrow="Payments & protection"
        title="Know exactly who you pay, when, and what's protected."
        intro={`A quote from ${site.name} costs nothing. When you book, your prices are locked, your deposit is refundable for ${DEPOSIT.refundHours} hours, and one person looks after your event from quote to pickup.`}
        actions={
          <>
            <Link href="/quote?from=booking-promise" className="btn-primary">Start my free quote</Link>
            <a href="#payments" className="btn-ghost">See the payment schedule</a>
          </>
        }
        media={<Figure {...scenes.gildedIvory} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="The Booking Promise" title="Six things we guarantee on every booking">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((p) => (
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

      <Section id="payments" tone="sand" eyebrow="Payments" title="Who you pay, and when">
        <StepFlow
          steps={flow}
          caption={`How paying for event rentals works with ${site.name}: a free quote, a free call, a deposit to book, the balance before the event, then delivery and pickup.`}
        />
        <div className="mt-12 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">Payment schedule for event rentals booked through {site.name}</caption>
            <thead className="bg-surface-2 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold">Payment</th>
                <th scope="col" className="px-5 py-4 font-semibold">Amount</th>
                <th scope="col" className="px-5 py-4 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.what} className="border-t border-line align-top">
                  <th scope="row" className="px-5 py-4 font-medium">{p.what}</th>
                  <td className="px-5 py-4 text-muted">{p.amount}</td>
                  <td className="px-5 py-4 text-muted">{p.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="note" title="Your total never surprises you" className="mt-8">
          The prices you see on our site are the prices on your proposal. It lists every item, then delivery, setup,
          damage waiver and tax for your venue. There&apos;s no booking fee on top, and nothing is charged until you book.
        </Callout>
      </Section>

      <Section eyebrow="Damage & insurance" title="What's covered if something goes wrong">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="card p-7">
            <Icon name="shield" size={26} className="text-gold" />
            <h3 className="display-3 mt-4">Damage waiver</h3>
            <p className="mt-3 leading-7 text-muted">
              Added to every quote at 10% of the rentals. It covers everyday accidents like wine on a linen or a scuffed chair.
              It does not cover loss, theft or careless damage.
            </p>
          </article>
          <article className="card p-7">
            <Icon name="check" size={26} className="text-gold" />
            <h3 className="display-3 mt-4">Venue paperwork</h3>
            <p className="mt-3 leading-7 text-muted">
              We don&apos;t issue certificates of insurance yet. If your venue asks for one before load-in, tell us before you
              book so we can tell you honestly whether we can meet its rules.
            </p>
          </article>
          <article className="card p-7">
            <Icon name="info" size={26} className="text-gold" />
            <h3 className="display-3 mt-4">Host event insurance</h3>
            <p className="mt-3 leading-7 text-muted">
              Some venues require hosts to carry one-day event liability insurance. We&apos;ll tell you on your call if
              yours does and point you to a provider. We don&apos;t sell insurance ourselves.
            </p>
          </article>
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-6 text-muted">
          Items are your responsibility between delivery and pickup. If a damage charge comes up, we show you what was
          damaged and the charge before anything is billed. Full details are in our <Link href="/terms" className="link">terms</Link>,
          and prices are on our <Link href="/pricing" className="link">pricing page</Link>.
        </p>
      </Section>

      <Section tone="sand" eyebrow="Questions" title="Payments and protection, answered">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>

      <div className="-mb-32">
        <CallCta source="booking-promise" />
      </div>
    </>
  );
}
