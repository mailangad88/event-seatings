import type { Metadata } from "next";
import Link from "next/link";
import { BOOKING_FEE_LABEL } from "@/lib/catalog-types";
import { site } from "@/lib/site";
import { ChairStrip } from "@/components/ChairStrip";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Terms of Use",
  description: `Terms for using the ${site.name} website and booking event rentals through us: our booking fee, who you pay, the Booking Promise, damage and liability.`,
  alternates: { canonical: "/terms" },
});

export default function TermsPage() {
  return (
    <div className="container-x max-w-3xl py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="headline mt-6 text-5xl sm:text-6xl">Terms of use</h1>
      <p className="mt-4 text-sm text-muted">Last updated November 2, 2026</p>
      <ChairStrip className="mt-10" slugs={["windsor", "shell", "garden-folding"]} caption="Plain-language terms for using this site." />
      <div className="prose-post mt-10">
        <h2>What {site.name} is</h2>
        <p>
          {site.name} is an event rental booking and coordination service. We do not own or deliver the rentals
          ourselves. Items are supplied, delivered, set up and collected by independent Chicago-area rental companies
          (&ldquo;rental partners&rdquo;). Your proposal confirms that a rental partner has your items for your date. We share the partner&apos;s name, contact details and rental agreement once you pay our booking fee (or a refundable hold). If you don&apos;t accept that agreement, tell us within 72 hours and we refund the fee in full.
        </p>
        <h2>Quote requests are not bookings</h2>
        <p>
          Submitting a quote request does not reserve rentals, hold a date or create a contract. A booking exists only
          once a rental partner confirms availability, you approve our written proposal and you pay the booking fee.
        </p>
        <h2>Prices and our booking fee</h2>
        <p>
          Prices shown on this site include our booking and coordination fee of {BOOKING_FEE_LABEL} on top of the rental
          partner&apos;s price. Your proposal shows the rental partner&apos;s price and our fee as separate lines, plus
          delivery, setup, damage waiver and tax for your venue. Prices marked as estimates are confirmed in your
          proposal. Some rental partners also pay us a referral commission on bookings we introduce; this never
          increases your price.
        </p>
        <h2>Who you pay</h2>
        <ul>
          <li>
            <strong>Our booking fee</strong> is paid to {site.name} when you approve your proposal. It is fully
            refundable for 72 hours after payment. After that it is non-refundable, but if you postpone, it transfers
            to a new date within 12 months.
          </li>
          <li>
            <strong>The rental charges</strong> (deposit, balance, delivery, damage waiver, security deposit and taxes)
            are paid to the rental partner under its own rental agreement, which governs delivery, setup, pickup,
            damage, loss, late returns and cancellation. Its key terms are summarized in your proposal.
          </li>
        </ul>
        <h2>Our Booking Promise</h2>
        <p>
          For bookings made through us: (1) the total in your approved proposal is what you pay for those items unless
          you change your order; (2) we ask every rental partner for proof of general liability insurance before we
          book them, and we tell you before you pay if a partner has not provided it. We do not issue certificates of
          insurance ourselves; (3) if your rental partner cancels a confirmed order, we will find a
          comparable replacement and cover any price difference up to the amount of the booking fee you paid, or
          refund the booking fee in full if we cannot; (4) quantity changes are free of our charge until 14 days
          before the event, subject to availability and the rental partner&apos;s terms. Details are on our{" "}
          <Link href="/booking-promise">Booking Promise</Link> page.
        </p>
        <h2>Damage, loss and insurance</h2>
        <p>
          You are responsible for rented items between delivery and pickup, as set out in the rental partner&apos;s
          agreement. Damage waivers, where offered, are provided by the rental partner and usually exclude loss, theft
          and negligence. {site.name} does not provide insurance and is not responsible for damage to or loss of rented
          items. If a damage charge arises, we will review it with the rental partner against their published terms.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          The rental partner is solely responsible for the rentals it supplies and its services. To the extent allowed
          by law, {site.name}&apos;s total liability for any booking is limited to the booking fee you paid us for that
          booking.
        </p>
        <h2>Product images</h2>
        <p>
          3D renders and illustrations show the style of each item. Finishes, dimensions and details may vary slightly
          from what is shown.
        </p>
        <h2>Content</h2>
        <p>
          Articles on this site are general planning ideas, not professional advice. Please check requirements with
          your venue.
        </p>
        <h2>Contact</h2>
        <p>
          Questions? <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
    </div>
  );
}
