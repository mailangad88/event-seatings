import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { Callout, FaqList, Figure, Icon, JsonLd, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { DEPOSIT_LABEL, PAYMENT_SCHEDULE, usd } from "@/lib/catalog-types";
import { allInEstimate, DAMAGE_WAIVER } from "@/lib/fees";
import { readyPackages } from "@/lib/packages";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";
import { termsPolicy } from "@/lib/terms";

const pct = Math.round(PAYMENT_SCHEDULE.firstShare * 100);
const pct2 = Math.round(PAYMENT_SCHEDULE.secondShare * 100);
const latePct = Math.round(PAYMENT_SCHEDULE.lateFirstShare * 100);

export const metadata: Metadata = seo({
  title: "Pricing: Every Rental Priced on the Site, No Booking Fee",
  description: `${site.name} prices every chair, table, linen and tent on the site. Your quote adds delivery, setup, damage waiver and tax. Book with a ${pct}% deposit, refundable for ${PAYMENT_SCHEDULE.refundHours} hours, then pay in stages before your event. No separate booking fee.`,
  alternates: { canonical: "/pricing" },
});

const included: { icon: IconName; title: string; text: string }[] = [
  { icon: "quote", title: "A written all-in quote", text: "Every item at the price on our site, with delivery, setup, damage waiver and tax shown for your venue." },
  { icon: "truck", title: "Delivery and pickup", text: "We arrange drop-off before your event and pickup after it, at times that work for your venue." },
  { icon: "users", title: "Setup if you want it", text: "Chairs placed, tables set and linens on. Leave it off your quote if you'd rather do it yourself." },
  { icon: "phone", title: "One person to call", text: `A free ${site.callLength} call before you book, and the same person for every change after.` },
  { icon: "calendar", title: `Changes until ${termsPolicy.changeCutoffDays} days out`, text: `Add or drop quantities at no charge until ${termsPolicy.changeCutoffDays} days before your event, subject to stock.` },
  { icon: "shield", title: "If an item falls through", text: "We replace it with the same or better at the price you agreed, or refund what you paid for it." },
];

const flow = [
  { icon: "quote" as const, title: "Free quote", text: "Build your list on the site or tell us the date, guests and venue." },
  { icon: "phone" as const, title: "Free call", text: "We go through the plan, the venue and the delivery times." },
  { icon: "check" as const, title: `${pct}% deposit`, text: `Reserves your items. Fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours.` },
  { icon: "calendar" as const, title: `${pct2}% installment`, text: `Due ${PAYMENT_SCHEDULE.secondDueDaysBefore} days before your event.` },
  { icon: "calendar" as const, title: "Balance", text: `Due ${PAYMENT_SCHEDULE.finalDueDaysBefore} days before your event, once the final count is in.` },
  { icon: "truck" as const, title: "Delivered", text: "Dropped off, set up if you asked, and picked up after." },
];

// Real examples from our ready-made packages, priced from the catalog.
const examples = readyPackages
  .filter((p) => ["backyard-birthday-50", "wedding-150", "corporate-120", "sangeet-250"].includes(p.id))
  .map((p) => {
    const est = allInEstimate(p.rentals);
    return { name: p.name, guests: p.guests, rentals: p.rentals, extras: est.total - p.rentals, total: est.total, href: p.href };
  });

const checklist = [
  "Every item and its price is in writing on your quote",
  "Delivery, setup, damage waiver and tax are their own lines, not hidden in the price",
  "You talk to us on a call before anything is booked",
  `Your deposit is fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours`,
  "The rest comes due in stages, in writing on your quote from day one",
];

const faqs: Faq[] = [
  {
    q: `How does ${site.name} charge?`,
    a: `By the item. Every chair, table, linen and tent has its price on our site. Your quote adds delivery and pickup, setup if you want it, a ${Math.round(DAMAGE_WAIVER * 100)}% damage waiver and sales tax. There's no separate booking or planning fee.`,
  },
  {
    q: "When do I pay?",
    a: `Quotes and the planning call are free. To book, you pay a ${DEPOSIT_LABEL} of the rentals (at least $${PAYMENT_SCHEDULE.min}; ${latePct}% if your event is within ${PAYMENT_SCHEDULE.secondDueDaysBefore} days). A second payment of ${pct2}% is due ${PAYMENT_SCHEDULE.secondDueDaysBefore} days before your event, and the balance is due ${PAYMENT_SCHEDULE.finalDueDaysBefore} days before.`,
  },
  {
    q: "Can I get my deposit back?",
    a: `Yes, in full for ${PAYMENT_SCHEDULE.refundHours} hours after you pay. After that, our terms explain what happens if you cancel or move your date.`,
  },
  {
    q: "Why is delivery a separate line?",
    a: "Because it depends on your venue, not the items. A ground-floor hall with a loading dock costs less to deliver to than a third-floor loft with stairs. Keeping it separate means you see exactly what you're paying for.",
  },
  {
    q: "Are the prices on the site final?",
    a: "They're our prices for a one-day rental. Your written quote confirms them for your date, with delivery and setup worked out for your venue. Once you pay the deposit, the item prices on your quote are locked.",
  },
  {
    q: "What if an item isn't available for my date?",
    a: "We tell you before you pay and suggest the closest match. If something falls through after you've booked, we replace it with the same or better at the price you agreed, or refund what you paid for it.",
  },
  {
    q: "Is there a minimum order?",
    a: "Delivered orders usually start around $150 in rentals. Below that, ask us and we'll tell you the cheapest way to get what you need.",
  },
  {
    q: `You're new. Why should I trust ${site.name}?`,
    a: `We started in 2026 and don't have many reviews yet, so we don't ask you to take our word for it. You get every price in writing, talk to us before you book, and your deposit is fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours.`,
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Event rentals with delivery and setup",
          serviceType: "Event rental",
          provider: { "@type": "Organization", name: site.name, url: site.url },
          areaServed: { "@type": "City", name: "Chicago" },
          url: `${site.url}/pricing`,
          description: `Chairs, tables, linens, dinnerware, tents and more for Chicago-area events, priced item by item, with delivery, setup, damage waiver and tax on the quote. Book with a ${pct}% deposit. No separate booking fee.`,
          offers: examples.map((e) => ({ "@type": "Offer", name: `${e.name}, ${e.guests} guests (example)`, price: Math.round(e.total), priceCurrency: "USD" })),
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Pricing", href: "/pricing" }]}
        eyebrow="Pricing"
        title="Every rental priced on the site"
        intro={`You see the price of every chair, table, linen and tent before you ask. Your quote adds delivery, setup, damage waiver and tax for your venue. There's no separate booking fee. Book with a ${pct}% deposit, fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours.`}
        actions={
          <>
            <Link href="/quote?from=pricing" className="btn-primary">Get my free all-in quote</Link>
            <Link href="/book?from=pricing" className="btn-ghost">Book a free call</Link>
          </>
        }
        media={<Figure {...scenes.midnightLongTable} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="Examples" title="What typical events cost, all in">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Example event rental costs with {site.name}</caption>
            <thead className="bg-surface-2 text-xs tracking-wide text-muted uppercase">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold">Event</th>
                <th scope="col" className="px-5 py-4 text-right font-semibold">Rentals</th>
                <th scope="col" className="px-5 py-4 text-right font-semibold">Delivery, setup, waiver, tax</th>
                <th scope="col" className="px-5 py-4 text-right font-semibold">All in (est.)</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((e) => (
                <tr key={e.name} className="border-t border-line">
                  <th scope="row" className="px-5 py-4 font-medium">
                    <Link href={e.href} className="link">{e.name}</Link>, {e.guests} guests
                  </th>
                  <td className="px-5 py-4 text-right tabular-nums text-muted">{usd(e.rentals, 0)}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted">{usd(e.extras, 0)}</td>
                  <td className="px-5 py-4 text-right font-medium tabular-nums">{usd(e.total, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
          These use our <Link href="/packages" className="link">ready-made packages</Link> at today&apos;s prices, with setup included and
          the Chicago tax rate. Change the guest count or swap items in the <Link href="/quote" className="link">quote builder</Link> and
          the total updates as you go.
        </p>
      </Section>

      <Section tone="sand" eyebrow="Included" title="What your price covers">
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
          caption={`How paying works with ${site.name}: a free quote, a free call, a ${pct}% deposit to reserve your items, a ${pct2}% installment ${PAYMENT_SCHEDULE.secondDueDaysBefore} days before, the balance ${PAYMENT_SCHEDULE.finalDueDaysBefore} days before, then delivery.`}
        />
        <Callout kind="note" title="An example" className="mt-8 max-w-3xl">
          Say your quote comes to $4,000 in rentals plus delivery, setup, waiver and tax, more than {PAYMENT_SCHEDULE.secondDueDaysBefore} days out.
          You pay a {pct}% deposit on the rentals, {usd(4000 * PAYMENT_SCHEDULE.firstShare, 0)}, to book. Another {pct2}%,{" "}
          {usd(4000 * PAYMENT_SCHEDULE.secondShare, 0)}, is due {PAYMENT_SCHEDULE.secondDueDaysBefore} days before your event, and the rest is
          due {PAYMENT_SCHEDULE.finalDueDaysBefore} days before, after your final guest count is in. Book within {PAYMENT_SCHEDULE.secondDueDaysBefore}{" "}
          days of your event and it&apos;s {latePct}% down instead, with the rest due {PAYMENT_SCHEDULE.finalDueDaysBefore} days before.
        </Callout>
      </Section>

      <Section tone="sand" eyebrow="Before you pay" title="What you can check before you pay us anything">
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
            {site.name} started in 2026. That&apos;s why every price is on the site, every quote is in writing, and your deposit is
            refundable for {PAYMENT_SCHEDULE.refundHours} hours. Read the full <Link href="/booking-promise" className="link">Booking Promise</Link>,
            see <Link href="/how-it-works" className="link">how booking works</Link>, or browse{" "}
            <Link href="/rentals" className="link">every rental and its price</Link>.
          </Callout>
        </div>
      </Section>

      <Section eyebrow="Questions" title="Pricing questions, answered">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>

      <div className="-mb-32">
        <CallCta source="pricing" />
      </div>
    </>
  );
}
