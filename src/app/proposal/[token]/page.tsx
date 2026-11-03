import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVendor } from "@/data/vendors";
import { Icon, PriceDisclaimer } from "@/components/ui";
import { BOOKING_FEE_LABEL, usd } from "@/lib/catalog-types";
import { amountDue, chargeLabel, chargeMode, checkoutPaid, stripeEnabled } from "@/lib/payments";
import { markFeePaid } from "@/lib/proposals";
import { site } from "@/lib/site";
import { getLeadByProposalToken } from "@/lib/store";
import { startCheckout } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your rental proposal",
  robots: { index: false, follow: false },
};

const day = (d?: string) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : undefined;

// A customer's proposal. The rental partner's name, contact and contract are shown only after the
// booking fee (or a refundable hold) is paid, so the quote can't be taken straight to the vendor.
export default async function ProposalPage(props: PageProps<"/proposal/[token]">) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  let lead = await getLeadByProposalToken(token);
  if (!lead) notFound();

  // Back from Stripe: confirm with Stripe directly rather than trusting the URL.
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;
  if (sessionId && lead.fee_status !== "paid") {
    try {
      if (await checkoutPaid(sessionId, lead.id)) {
        await markFeePaid(lead, "Stripe Checkout", { sessionId });
        lead = { ...lead, fee_status: "paid" };
      }
    } catch (err) {
      console.error("checkout check failed", err);
    }
  }

  const paid = lead.fee_status === "paid";
  const lines = lead.items ?? [];
  const subtotal = lead.quote_subtotal ?? lines.reduce((s, l) => s + l.line_total, 0);
  const vendorPrice = lead.quote_cost ?? lines.reduce((s, l) => s + l.vendor_price * l.qty, 0);
  const fee = subtotal - vendorPrice;
  const due = lead.fee_amount ?? amountDue(lead);
  const vendor = lead.assigned_vendor ? getVendor(lead.assigned_vendor) : undefined;
  const event = [lead.event_type, day(lead.event_date), lead.guest_count ? `${lead.guest_count} guests` : undefined, lead.venue ?? lead.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="container-x py-12 md:py-16">
      <p className="eyebrow">{site.name} proposal</p>
      <h1 className="display-1 mt-2">{lead.name ? `${lead.name.split(" ")[0]}, here's your rental plan` : "Your rental plan"}</h1>
      {event && <p className="mt-3 text-muted">{event}</p>}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section className="card p-6 md:p-8" aria-labelledby="items">
          <h2 id="items" className="font-heading font-semibold text-2xl">Your items</h2>
          {lines.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <thead className="text-left text-muted">
                  <tr className="border-b border-line">
                    <th className="py-2 font-medium">Item</th>
                    <th className="py-2 text-right font-medium">Qty</th>
                    <th className="py-2 text-right font-medium">Each</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={`${l.id}-${l.variant ?? ""}`} className="border-b border-line/60">
                      <td className="py-2 pr-3">{l.name}</td>
                      <td className="py-2 text-right tabular-nums">{l.qty}</td>
                      <td className="py-2 text-right tabular-nums">{usd(l.unit_price)}</td>
                      <td className="py-2 text-right tabular-nums">{usd(l.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="mt-5 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Rental company&apos;s price</dt><dd className="tabular-nums">{usd(vendorPrice)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Our booking &amp; coordination fee ({BOOKING_FEE_LABEL})</dt><dd className="tabular-nums">{usd(fee)}</dd></div>
                <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Rentals total</dt><dd className="tabular-nums">{usd(subtotal)}</dd></div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-muted">
                Delivery, setup, damage waiver and sales tax are set by the rental company and listed on its agreement before you pay it anything.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-muted">Your coordinator will add the itemized list here.</p>
          )}
          <PriceDisclaimer className="mt-4" />
        </section>

        <aside className="space-y-6">
          <section className="card p-6" aria-labelledby="partner">
            <h2 id="partner" className="font-heading font-semibold text-2xl">Your rental company</h2>
            {paid ? (
              <div className="mt-3 space-y-2 text-sm leading-6">
                <p className="flex items-center gap-2 font-medium text-ink"><Icon name="check" size={18} className="text-gold" /> Booking secured. Thank you!</p>
                {vendor ? (
                  <>
                    <p className="text-lg font-heading font-semibold">{vendor.name}</p>
                    {vendor.phone && <p>Phone: <a href={`tel:${vendor.phone}`} className="text-accent">{vendor.phone}</a></p>}
                    {vendor.website && <p><a href={vendor.website} className="text-accent" rel="noopener" target="_blank">Website</a></p>}
                    <p className="text-muted">
                      They&apos;ll send their rental agreement and deposit invoice. We stay your contact for every change until pickup.
                    </p>
                  </>
                ) : (
                  <p className="text-muted">We&apos;re confirming your order with the rental company now and will introduce you by email.</p>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-4 text-sm leading-6">
                <p>
                  A Chicago-area rental company has your items for this date. We share its name, contact and rental agreement as soon as
                  your booking is secured.
                </p>
                <div className="rounded-xl bg-gold-soft/50 p-4">
                  <p className="text-muted">{chargeLabel()}</p>
                  <p className="mt-1 font-heading font-semibold text-3xl tabular-nums">{usd(due)}</p>
                  <p className="mt-1 text-xs text-muted">
                    {chargeMode() === "hold"
                      ? "Fully refundable for 72 hours. Counts toward your booking fee."
                      : "Fully refundable for 72 hours. After that it can move to a new date within 12 months."}
                  </p>
                </div>
                {stripeEnabled() ? (
                  <>
                  {sp.checkout === "error" && (
                    <p role="alert" className="mb-3 text-sm text-rose">
                      Checkout couldn&apos;t open just now. Please try again, or reply to our email and we&apos;ll help.
                    </p>
                  )}
                  <form action={startCheckout}>
                    <input type="hidden" name="token" value={token} />
                    <button className="btn-primary w-full">Secure my booking</button>
                    <p className="mt-2 text-center text-xs text-muted">Secure card or bank payment by Stripe.</p>
                  </form>
                  </>
                ) : (
                  <p className="rounded-xl border border-line p-4 text-muted">
                    Ready to book? Reply to your coordinator&apos;s email
                    {site.phone ? <> or call <a href={`tel:${site.phone}`} className="text-accent">{site.phone}</a></> : null} and we&apos;ll send
                    a secure payment link.
                  </p>
                )}
              </div>
            )}
          </section>
          <p className="px-1 text-xs leading-5 text-muted">
            Rentals are paid to the rental company under its own agreement. Read our{" "}
            <Link href="/booking-promise" className="underline underline-offset-2">Booking Promise</Link> and{" "}
            <Link href="/terms" className="underline underline-offset-2">terms</Link>.
          </p>
        </aside>
      </div>
    </div>
  );
}
