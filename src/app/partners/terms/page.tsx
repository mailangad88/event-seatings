import { vendorPageRobots } from "@/lib/vendor-pages";
import type { Metadata } from "next";
import Link from "@/components/Link";
import { Callout, FaqList, Figure, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { PARTNER_TERMS, partnerFeeOn, partnerFreeCount, partnerFreeOrders, partnerRatePct } from "@/lib/partner-terms";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Rental Partner Terms on One Page",
  description: `The full terms for Chicago-area rental companies that take orders from ${site.name}: ${partnerRatePct} of the rental subtotal after ${partnerFreeOrders}, only on orders that book, paid monthly. We pay your full price-sheet rates, your contract, no exclusivity.`,
  alternates: { canonical: "/partners/terms" },
  // For rental companies only: kept out of search and AI answers so customers don't land here (see src/lib/vendor-pages.ts).
  robots: vendorPageRobots,
});

const T = PARTNER_TERMS;

const groups: { title: string; rows: [string, string][] }[] = [
  {
    title: "Money",
    rows: [
      ["Joining", "Free. No setup fee and no monthly fee."],
      ["Free orders", `Nothing on ${partnerFreeOrders} after you sign. Orders booked before you sign are never charged.`],
      ["Referral fee", `${partnerRatePct} of the rental subtotal on orders we send that book. The subtotal is rental items only, after any discount. Not delivery, setup labor, damage waiver, tax or deposits.`],
      ["When it's owed", "Only after the event happens and the customer has paid you. Nothing on cancelled or refunded orders. Part-refunds lower the fee to match."],
      ["Rate lock", `${partnerRatePct} is locked for ${T.rateLockMonths} months from signing.`],
      ["Statements", `One statement a month, by the month of the event. Due ${T.netDays} days after we send it, by ACH, Zelle or check.`],
      ["If you won't do a percentage", `A flat $${T.perOrderFallback} for each order you accept instead. Nothing for orders you turn down.`],
    ],
  },
  {
    title: "Prices and customers",
    rows: [
      ["Your prices", `You set your price sheet and we pay those rates for every order. Quotes are good for ${T.quoteValidDays} days. Give us ${T.noticeDays} days' notice of price changes.`],
      ["Who pays you", `${site.name} does. We place each order and pay your usual deposit when it's confirmed and the balance before the event. Customers book and pay with us, at our own prices.`],
      ["Our customers", `Customers on our orders stay ours for ${T.attributionMonths} months, including their next events. Please don't contact them about anything but their delivery, or offer to book them direct.`],
      ["Customer details", "Used only for delivering that order. Please don't add them to your marketing."],
    ],
  },
  {
    title: "Orders",
    rows: [
      ["How an order reaches you", "An email with a quote ID (BC-YYYY-####), the date, venue, guest count and exact items and quantities."],
      ["Reply time", `Yes, no or yes with changes within ${T.replyHours} business hours. Same day for events less than 14 days out.`],
      ["Status", "A short weekly update on open orders: booked, quoted, or lost and why."],
      ["If you have to cancel", "Tell us right away, return what we paid for that order, and help us find a replacement. What we promise our customer is ours to keep, not yours."],
      ["Your work", "Delivery, setup, pickup, damage, cleaning and the taxes on your rentals, including the Chicago lease tax, stay with you."],
    ],
  },
  {
    title: "Listings, photos and leaving",
    rows: [
      ["Insurance", "A general liability certificate on file before your first booking."],
      ["Your listing", `We show your item names, sizes and prices. Ask us to change or remove anything and it's done within ${T.removalDays} business days.`],
      ["Photos", "Only with your written OK, credited to you. You can take that back any time."],
      ["Exclusivity", "None either way."],
      ["Quality", "Two confirmed customer complaints in 90 days pauses new orders until we've sorted it out together."],
      ["Length", `12 months, renewing on its own. Either of us can stop with ${T.noticeDays} days' notice. Fees are still owed on orders placed before then.`],
      ["Changes to these terms", "60 days' written notice before any fee changes."],
    ],
  },
];

const steps = [
  { icon: "chat" as const, title: "Order email", text: `Items, date, venue, quote ID. Reply within ${T.replyHours} hours.` },
  { icon: "users" as const, title: "We place the order", text: "Confirmed in writing, and we pay your deposit." },
  { icon: "truck" as const, title: "You deliver", text: "Delivery, setup and pickup at the times we agree." },
  { icon: "calendar" as const, title: "Monthly statement", text: `${partnerRatePct} of booked rentals after the free period, due in ${T.netDays} days.` },
];

const faqs: Faq[] = [
  {
    q: `How much is the fee on a $5,000 order?`,
    a: `$${partnerFeeOn(5000).toLocaleString()} once your first ${partnerFreeCount} booked orders are done, and nothing on those. It's worked out on the rentals only, not your delivery, damage waiver or tax.`,
  },
  {
    q: "Do I sign something?",
    a: "Yes, a short agreement with these same terms. Reply to our email saying you agree, or sign the PDF we send. An attorney is finishing the full version, and nothing in it will differ from this page.",
  },
  {
    q: "What if a customer we already know comes through you?",
    a: "Tell us when the order arrives. If they were your customer in the last 12 months, there's no fee on that order.",
  },
  {
    q: "Can I leave?",
    a: `Any time, with ${T.noticeDays} days' notice. We'll remove your listing within ${T.removalDays} business days.`,
  },
];

export default function PartnerTermsPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: "Rental partners", href: "/partners" },
          { name: "Terms", href: "/partners/terms" },
        ]}
        eyebrow="For rental companies"
        title="Rental partner terms"
        intro={`Everything a Chicago-area rental company agrees to when it takes orders from ${site.name}, on one page. We pay your full price-sheet rates on your usual terms. You pay nothing on ${partnerFreeOrders}, then ${partnerRatePct} of the rentals on orders we send that book.`}
        actions={
          <>
            <Link href="/partners#apply" className="btn-primary">Apply as a partner</Link>
            <Link href="/partners/faq" className="btn-ghost">Partner FAQ</Link>
          </>
        }
        media={<Figure {...scenes.gildedIvory} ratio="4/5" sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="How an order works" title="From order email to statement">
        <StepFlow
          steps={steps}
          caption={`How an order moves between ${site.name} and a rental partner: an order email with a quote ID, we place and pay for the order, the rental company delivers, then a monthly statement.`}
        />
        <p className="mt-8 max-w-3xl leading-7 text-muted">
          See what customers see: the <Link href="/rentals" className="link-line">rental catalog with prices</Link>, the{" "}
          <Link href="/quote" className="link-line">quote builder</Link>, <Link href="/pricing" className="link-line">what customers pay us</Link>, and{" "}
          <Link href="/partners/faq" className="link-line">the partner FAQ</Link>. Already listed without asking?{" "}
          <Link href="/vendor-listings" className="link-line">Change or remove your listing</Link>.
        </p>
      </Section>

      {groups.map((g, i) => (
        <Section key={g.title} tone={i % 2 === 0 ? "sand" : undefined} title={g.title}>
          <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {g.rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6 sm:px-6">
                <dt className="font-medium">{k}</dt>
                <dd className="leading-7 text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ))}

      <Section eyebrow="Questions" title="About these terms">
        <FaqList faqs={faqs} className="max-w-3xl" />
        <Callout kind="note" title="Questions before you sign?" className="mt-8 max-w-3xl">
          Email <a href={`mailto:${site.email}`} className="link">{site.email}</a> and we&apos;ll call you back. Or{" "}
          <Link href="/partners#apply" className="link">apply in two minutes</Link> and we&apos;ll go through the terms on the call.
        </Callout>
      </Section>
    </>
  );
}
