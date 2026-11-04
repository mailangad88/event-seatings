import type { Metadata } from "next";
import Link from "@/components/Link";
import { DEPOSIT } from "@/lib/catalog-types";
import { site } from "@/lib/site";
import { ChairStrip } from "@/components/ChairStrip";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Terms of Use",
  description: `Terms for using the ${site.name} website and booking event rentals with us: prices, deposit and balance, the Booking Promise, damage and liability.`,
  alternates: { canonical: "/terms" },
});

export default function TermsPage() {
  return (
    <div className="container-x max-w-3xl py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="display-1 mt-6">Terms of use</h1>
      <p className="mt-4 text-sm text-muted">Last updated November 4, 2026</p>
      <ChairStrip className="mt-10" slugs={["windsor", "shell", "garden-folding"]} caption="Plain-language terms for using this site." />
      <div className="prose-post mt-10">
        <h2>What {site.name} is</h2>
        <p>
          {site.name} rents event furniture and equipment in the Chicago area and arranges delivery, setup and pickup.
          Orders may be fulfilled and delivered by independent delivery and fulfillment partners working for us. You book
          with, and pay, {site.name}.
        </p>
        <h2>Quote requests are not bookings</h2>
        <p>
          Submitting a quote request does not reserve rentals, hold a date or create a contract. A booking exists only
          once you approve our written proposal and pay the deposit.
        </p>
        <h2>Prices</h2>
        <p>
          Prices on this site are our prices for a one-day rental. There is no separate booking fee. Your proposal lists
          every item, then delivery and pickup, setup, a damage waiver and sales tax for your venue. Prices marked as
          estimates are confirmed in your proposal. Once you pay the deposit, the item prices in your proposal are locked
          unless you change your order.
        </p>
        <h2>Payment</h2>
        <ul>
          <li>
            <strong>Deposit:</strong> {Math.round(DEPOSIT.share * 100)}% of the rentals (at least ${DEPOSIT.min}), paid when
            you book. It is fully refundable for {DEPOSIT.refundHours} hours after payment.
          </li>
          <li>
            <strong>Balance:</strong> the rest of your order, including delivery, setup, damage waiver and tax, due{" "}
            {DEPOSIT.balanceDaysBefore} days before your event.
          </li>
        </ul>
        <h2>Our Booking Promise</h2>
        <p>
          (1) The item prices in the proposal you book are what you pay for those items unless you change your order;
          (2) if an item you booked can&apos;t be delivered, we replace it with the same or better at the agreed price, or
          refund what you paid for that item; (3) quantity changes are free until 14 days before the event, subject to
          stock. We do not issue certificates of insurance. Details are on our{" "}
          <Link href="/booking-promise">Booking Promise</Link> page.
        </p>
        <h2>Damage, loss and insurance</h2>
        <p>
          You are responsible for rented items between delivery and pickup. The damage waiver on your proposal covers
          everyday accidental damage and does not cover loss, theft or negligence. {site.name} does not provide insurance.
          If a damage charge arises, we show you what was damaged and the charge before billing it.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the extent allowed by law, {site.name}&apos;s total liability for any booking is limited to the amount you
          paid us for that booking.
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
