import type { Metadata } from "next";
import Link from "next/link";
import { FaqList, Figure, Icon, JsonLd, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { BOOKING_FEE_FULL } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { replyPromise, site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "How We Work: Hosts, Rental Companies and Who Pays Whom",
  description: `How ${site.name} works for event hosts and Chicago-area rental companies: who does what, who pays whom, how fast we reply, and what each side can count on, from first quote to pickup.`,
  alternates: { canonical: "/how-we-work" },
});

const hostSteps = [
  { title: "Pick your rentals", text: "Browse items with prices and build one list for your whole event.", icon: "search" as const },
  { title: "Send one quote request", text: "Date, venue and guest count. Free, no card needed.", icon: "quote" as const },
  { title: "We check with rental companies", text: "We confirm your date and send one proposal.", icon: "phone" as const },
  { title: "Approve and pay our fee", text: `Our flat booking fee secures it, paid only after every company confirms. Then we introduce your rental company.`, icon: "check" as const },
  { title: "Delivery, setup, pickup", text: "Your rental company delivers. We stay your one contact.", icon: "truck" as const },
];

const vendorSteps = [
  { title: "Sign up online", text: "Company, area, schedule, prices. About five minutes.", icon: "quote" as const },
  { title: "We call and check", text: "Within one business day. You check your listing.", icon: "phone" as const },
  { title: "Get orders", text: "Items, quantities, date and venue, with a quote ID.", icon: "chat" as const },
  { title: "Reply within 4 hours", text: "Yes, no, or a suggested swap. No charge for a no.", icon: "calendar" as const },
  { title: "Book and deliver", text: "Your contract, your deposit, your crew.", icon: "truck" as const },
];

const money: { from: string; to: string; what: string; when: string; icon: IconName }[] = [
  { from: "Host", to: site.name, what: `Flat booking and coordination fee: $295, or $495 over 200 guests`, when: "When the host approves a proposal a rental company has confirmed", icon: "shield" },
  { from: "Host", to: "Rental company", what: "Deposit, then the balance, damage waiver and tax", when: "Under the rental company's own agreement, usually balance 7-14 days before", icon: "truck" },
  { from: "Rental company", to: site.name, what: "5% of the rental subtotal (0% in the first 90 days)", when: "Monthly statement, due 15 days after the month of the event", icon: "calendar" },
];

const timeline: [string, string][] = [
  ["Quote request arrives", `We reply to the host. Our team ${replyPromise}.`],
  ["Same day", "We call the host to go over the list, then send the order to rental companies that cover that area and date."],
  ["Within 4 business hours", "Rental companies reply yes, no or with a swap."],
  ["Usually within one business day", "The host gets one proposal with every item, fee and policy listed."],
  ["Host approves", `The host pays our flat booking fee and we introduce the rental company, which sends its agreement and deposit invoice.`],
  ["Up to 14 days before", "Free changes to quantities, subject to stock. We pass changes to the rental company."],
  ["Event day", "The rental company delivers and sets up. We're on the phone if anything goes wrong."],
  ["After the event", "Pickup the same night or next morning. We ask the host for a review and log the booking on the partner's monthly statement."],
];

const promises: { side: string; items: string[] }[] = [
  {
    side: "What hosts can count on",
    items: [
      "Every price on the site is the rental company's own price, and our flat fee is its own line on the proposal",
      "Nothing to pay until a rental company confirms your date",
      "One coordinator for every rental company on your order",
      "Free changes until 14 days before the event",
      "72-hour full refund on our booking fee",
      "We ask every rental company for proof of insurance",
    ],
  },
  {
    side: "What rental companies can count on",
    items: [
      "You keep your list price, contract, deposit and damage waiver",
      "Orders only in the areas and on the dates you choose",
      "Every order spoken to the host first, with items and quantities",
      "No fee for orders you turn down",
      "No monthly fee and no exclusivity, 30 days' notice to leave",
      "Your name stays off the public site",
    ],
  },
];

const faqs: Faq[] = [
  { q: `What is ${site.name}?`, a: `A booking service for event rentals in ${site.marketLong}. Hosts build one quote for chairs, tables, linens, tents and more. We check the date with local rental companies, send one proposal, and coordinate delivery, setup and pickup.` },
  { q: `Does ${site.name} own the rentals?`, a: "No. Established local rental companies own, deliver, set up and collect everything. We find the right companies for your order and look after the booking from start to finish." },
  { q: "Who do I pay?", a: `Hosts pay our flat booking fee ($295, or $495 over 200 guests) to us, and the rental company's deposit and balance to the rental company. Rental companies may pay us a small referral fee only on orders we sent that booked, and it never changes the host's price.` },
  { q: "Why don't you show rental company names?", a: "So hosts can compare items and prices without twenty phone calls, and so we're paid for the work of putting the order together. Once the host pays our fee, we share the rental company's name, contact and agreement." },
  { q: "What if a rental company cancels?", a: "We find a comparable replacement and cover any price difference up to $500. If we can't replace the order, we refund our booking fee. That's part of our Booking Promise." },
  { q: "How do rental companies join?", a: "They sign up online at /partners/onboard. We call within one business day, they check their listing, and orders start once they've signed the one-page partner agreement." },
];

export default function HowWeWorkPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How booking event rentals with ${site.name} works`,
          description: `The steps from building a rental list to delivery and pickup, for hosts in ${site.marketLong}.`,
          step: hostSteps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "How we work", href: "/how-we-work" }]}
        eyebrow="How we work"
        title="How we work with hosts and rental companies"
        intro={
          <p data-answer>
            {site.name} sits between event hosts and local rental companies. Hosts build one quote at the rental companies&apos; own prices and pay us {BOOKING_FEE_FULL} booking fee when they approve it. Rental companies own the items, deliver them and are paid directly by the host under their own agreement. We check dates, put the order together and stay the one contact until pickup.
          </p>
        }
        actions={
          <>
            <Link href="/quote?from=how-we-work" className="btn-primary">Start a quote</Link>
            <Link href="/partners/onboard" className="btn-ghost">I run a rental company</Link>
          </>
        }
        media={<Figure {...scenes.gildedIvory} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="Who does what" title="Three sides, one order">
        <figure>
          <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {[
              { icon: "users" as const, name: "Host", text: "Picks rentals, sends one quote request, approves the proposal." },
              { icon: "chat" as const, name: site.name, text: "Checks dates, puts the order together, coordinates every rental company, handles changes." },
              { icon: "truck" as const, name: "Rental company", text: "Owns the items, sets the price, delivers, sets up and picks up." },
            ].flatMap((c, i, arr) => [
              <div key={c.name} className="card flex flex-col items-center p-6 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gold-soft text-gold"><Icon name={c.icon} size={28} /></span>
                <h3 className="display-3 mt-4">{c.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{c.text}</p>
              </div>,
              ...(i < arr.length - 1
                ? [<span key={`a${i}`} aria-hidden className="grid place-items-center text-gold"><Icon name="arrow" size={28} className="rotate-90 md:rotate-0" /></span>]
                : []),
            ])}
          </div>
          <figcaption className="mt-4 text-center text-sm text-muted">
            A host sends one request to {site.name}. We pass the order to a local rental company, which delivers on the day.
          </figcaption>
        </figure>
      </Section>

      <Section tone="sand" eyebrow="For hosts" title="How booking works for hosts">
        <StepFlow steps={hostSteps} caption={`The five steps a host goes through to book rentals with ${site.name}.`} />
        <p className="mt-8 text-sm text-muted">
          More detail: <Link href="/how-it-works" className="link">how booking works</Link> and the <Link href="/booking-promise" className="link">Booking Promise</Link>.
        </p>
      </Section>

      <Section eyebrow="For rental companies" title="How it works for rental companies">
        <StepFlow steps={vendorSteps} caption={`The five steps a rental company goes through to receive and fill orders from ${site.name}.`} />
        <p className="mt-8 text-sm text-muted">
          More detail: <Link href="/partners" className="link">partner program</Link>, <Link href="/partners/faq" className="link">partner questions</Link> and the{" "}
          <Link href="/partners/onboard" className="link">sign-up form</Link>.
        </p>
      </Section>

      <Section tone="sand" eyebrow="Money" title="Who pays whom, and when">
        <ul className="grid gap-5 lg:grid-cols-3">
          {money.map((m) => (
            <li key={m.what} className="card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-gold"><Icon name={m.icon} size={24} /></span>
              <p className="mt-4 text-sm font-medium">
                {m.from} <Icon name="arrow" size={14} className="mx-1 inline text-gold" /> {m.to}
              </p>
              <h3 className="display-3 mt-2">{m.what}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{m.when}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">
          We never hold a rental company&apos;s money. Damage, deposits and delivery terms are set by the rental company&apos;s own agreement.
        </p>
      </Section>

      <Section eyebrow="Timing" title="What happens, and how fast">
        <ol className="max-w-3xl divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {timeline.map(([when, what], i) => (
            <li key={when} className="grid gap-1 px-5 py-4 sm:grid-cols-[3rem_14rem_1fr] sm:gap-4 sm:px-6">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-soft text-sm font-medium text-gold">{i + 1}</span>
              <span className="font-medium">{when}</span>
              <span className="leading-7 text-muted">{what}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="sand" eyebrow="Our rules" title="What each side can count on">
        <div className="grid gap-5 md:grid-cols-2">
          {promises.map((p) => (
            <article key={p.side} className="card p-7">
              <h3 className="display-3">{p.side}</h3>
              <ul className="mt-5 space-y-3 text-sm">
                {p.items.map((t) => (
                  <li key={t} className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold" /> {t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Questions" title="About how we work">
        <FaqList faqs={faqs} className="max-w-3xl" />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote?from=how-we-work" className="btn-primary">Start a quote</Link>
          <Link href="/partners/onboard" className="btn-ghost">Sign up as a rental company</Link>
        </div>
      </Section>
    </>
  );
}
