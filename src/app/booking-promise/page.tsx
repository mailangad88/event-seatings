import type { Metadata } from "next";
import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { Callout, FaqList, Figure, Icon, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { BOOKING_FEE_LABEL } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { replyPromise, site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Payments, Deposits & Our Booking Promise",
  description: `Who you pay, when, and what's protected when you book event rentals through ${site.name} in ${site.market}: free quotes, a ${BOOKING_FEE_LABEL} booking fee only after your vendor confirms, locked prices, insured rental companies and a backup if one cancels.`,
  alternates: { canonical: "/booking-promise" },
});

const promises: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "shield",
    title: "Price lock",
    text: "The total in the proposal you approve is what you pay for those items. Prices only change if you change your order.",
  },
  {
    icon: "check",
    title: "Insured rental companies",
    text: "We ask every Chicago-area rental company we book for proof of general liability insurance, and we tell you before you pay if one hasn't provided it yet. We don't issue certificates of insurance ourselves.",
  },
  {
    icon: "users",
    title: "Backup guarantee",
    text: "If your rental company cancels, we find a comparable replacement. If it costs more, we cover the difference up to the full amount of your booking fee. If we can't replace it, your booking fee is refunded.",
  },
  {
    icon: "chat",
    title: "One person, start to finish",
    text: `One coordinator handles every vendor, change and question, and ${replyPromise}.`,
  },
  {
    icon: "calendar",
    title: "Free changes until 14 days out",
    text: "Adjust quantities or swap items free of our charge until 14 days before your event, subject to availability and the rental company's own terms.",
  },
  {
    icon: "heart",
    title: "72-hour change of heart",
    text: "Your booking fee is fully refundable for 72 hours after you pay. After that, if you postpone, it moves to your new date within 12 months.",
  },
];

const payments = [
  { what: "Quote, planning call and proposal", amount: "Free", to: "No one", when: "Any time, no card needed" },
  { what: `Booking & coordination fee`, amount: `${BOOKING_FEE_LABEL} on top of the rental company's price for your items`, to: site.name, when: "When you approve your proposal, after the vendor confirms your date" },
  { what: "Rental deposit", amount: "Usually 25-50%, set by the rental company", to: "The rental company", when: "At booking, under their rental agreement" },
  { what: "Balance", amount: "Remaining rental, delivery, damage waiver and tax", to: "The rental company", when: "Usually 7-14 days before the event" },
  { what: "Security deposit (some items)", amount: "Varies, refundable", to: "The rental company", when: "Before delivery, returned after pickup" },
];

const flow = [
  { icon: "quote" as const, title: "Free quote", text: "Build your list online. No card, no commitment." },
  { icon: "users" as const, title: "Vendor confirms", text: "We check your date with local rental companies we know." },
  { icon: "check" as const, title: "You approve", text: `Pay the ${BOOKING_FEE_LABEL} booking fee securely. Your vendor is locked in.` },
  { icon: "calendar" as const, title: "Deposit & contract", text: "The rental company sends its agreement and deposit invoice. We're copied in." },
  { icon: "truck" as const, title: "Delivered & collected", text: "Balance due before the event. We track delivery and pickup." },
];

const faqs: Faq[] = [
  {
    q: "Do I pay anything to get a quote?",
    a: `No. Quotes, the planning call and your proposal are free. You only pay ${site.name}'s booking fee once a rental company has confirmed your date and you approve the proposal.`,
  },
  {
    q: `How does ${site.name} make money?`,
    a: `Prices on our site include a ${BOOKING_FEE_LABEL} booking and coordination fee on top of the rental company's price. Your proposal shows it as its own line, so you always see the rental company's price and our fee. Some partner rental companies also pay us a referral commission; that never raises your price.`,
  },
  {
    q: "Who do I pay for the rentals themselves?",
    a: "You pay the rental company that delivers your items, under its own rental agreement: usually a deposit at booking and the balance 7-14 days before the event. We send you their terms before you approve anything.",
  },
  {
    q: "What if something gets damaged?",
    a: "Most Chicago rental companies offer a damage waiver, often around 8-12% of the rental, that covers normal accidental damage like stains or a scuffed leg. It doesn't cover loss, theft or careless damage. We recommend it for every event. If there's a damage charge, we review it with the rental company against their published damage schedule.",
  },
  {
    q: "Does my venue need a certificate of insurance?",
    a: "Many Chicago venues require one from every vendor. We can't issue or send certificates of insurance to venues yet, so check your venue's rules before you book and tell us what they require. Some venues also ask hosts for one-day event liability insurance, and we'll tell you on your call if yours does.",
  },
  {
    q: "What if the rental company cancels?",
    a: "Our backup guarantee applies: we find a comparable replacement, cover any price difference up to the full amount of your booking fee, and refund the booking fee if we can't replace your order.",
  },
  {
    q: "What if I need to cancel or postpone?",
    a: "Your booking fee is fully refundable for 72 hours after you pay. After that it can move to a new date within 12 months. Deposits paid to the rental company follow its cancellation policy. If you don't accept the rental company's agreement once we share it, your booking fee is refunded in full.",
  },
  {
    q: "How do I pay?",
    a: "Our booking fee is paid by card or bank transfer through a secure Stripe payment link. Rental companies take card, check or bank transfer under their own invoices.",
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
        intro={`Booking rentals through ${site.name} costs nothing until a rental company confirms your date. Then your prices are locked, the rental company has shown us proof of insurance, and one person looks after your event from quote to pickup.`}
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
          caption={`How paying for event rentals works with ${site.name}: free quote, the rental company confirms, you approve and pay the booking fee, the rental company takes its deposit, then delivery and pickup.`}
        />
        <div className="mt-12 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Payment schedule for event rentals booked through {site.name}</caption>
            <thead className="bg-surface-2 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold">Payment</th>
                <th scope="col" className="px-5 py-4 font-semibold">Amount</th>
                <th scope="col" className="px-5 py-4 font-semibold">Paid to</th>
                <th scope="col" className="px-5 py-4 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.what} className="border-t border-line align-top">
                  <th scope="row" className="px-5 py-4 font-medium">{p.what}</th>
                  <td className="px-5 py-4 text-muted">{p.amount}</td>
                  <td className="px-5 py-4 text-muted">{p.to}</td>
                  <td className="px-5 py-4 text-muted">{p.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="note" title="Your total never surprises you" className="mt-8">
          The prices you see on our site already include our booking fee. Your proposal splits it out: the rental
          company&apos;s price, our {BOOKING_FEE_LABEL} fee, then delivery, damage waiver and tax for your venue. Nothing
          is charged until you approve it.
        </Callout>
      </Section>

      <Section eyebrow="Damage & insurance" title="What's covered if something goes wrong">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="card p-7">
            <Icon name="shield" size={26} className="text-gold" />
            <h3 className="display-3 mt-4">Damage waiver</h3>
            <p className="mt-3 leading-7 text-muted">
              Offered by most rental companies, often around 8-12% of the rental. It covers everyday accidents like
              wine on a linen or a scuffed chair. It does not cover loss, theft or careless damage. We recommend it for
              every event.
            </p>
          </article>
          <article className="card p-7">
            <Icon name="check" size={26} className="text-gold" />
            <h3 className="display-3 mt-4">Vendor insurance</h3>
            <p className="mt-3 leading-7 text-muted">
              We ask every rental company we book for proof of general liability insurance. We don&apos;t issue
              certificates of insurance ourselves, so if your venue asks for one before load-in, tell us before you book and
              we&apos;ll ask the rental company whether it can provide one.
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
          Items are your responsibility between delivery and pickup, under the rental company&apos;s agreement. If a
          damage charge comes up, we review it with the rental company against their published damage schedule. Full
          details are in our <Link href="/terms" className="link">terms</Link>.
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
