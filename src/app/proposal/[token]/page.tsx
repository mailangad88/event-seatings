import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { Icon, PriceDisclaimer } from "@/components/ui";
import { PAYMENT_SCHEDULE, paymentPlanFor, usd } from "@/lib/catalog-types";
import { allInEstimate } from "@/lib/fees";
import { firstBookingDiscountApplied } from "@/lib/offers";
import { amountDue, chargeLabel, chargeMode, checkoutPaid, stripeEnabled } from "@/lib/payments";
import { markFeePaid } from "@/lib/proposals";
import { site } from "@/lib/site";
import { contact } from "@/lib/contact";
import { getLeadByProposalToken } from "@/lib/store";
import { acceptProposal, startCheckout } from "./actions";
import { TermsCheckbox } from "./TermsCheckbox";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your rental proposal",
  robots: { index: false, follow: false },
};

const day = (d?: string) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : undefined;

// A customer's proposal: every item at our price, delivery, setup, waiver and tax, the total, and the
// deposit that books it (or a refundable hold). The supplier is never shown to the customer.
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
  const due = lead.fee_amount ?? amountDue(lead);
  const allIn = allInEstimate(subtotal);
  // The payment plan for this order: a deposit now, maybe a second installment, then the balance.
  // The installment amount is rentals only (no fees); the balance absorbs the rest, fees included.
  const plan = paymentPlanFor(subtotal, lead.event_date);
  const discount = chargeMode() === "fee" ? firstBookingDiscountApplied(plan[0]?.amount ?? 0) : 0;
  const installment = plan.length === 3 ? plan[1] : undefined;
  const finalDueDate = plan.length > 1 ? plan.at(-1)?.dueDate : undefined;
  const balance = Math.max(0, Math.round((allIn.total - (chargeMode() === "fee" ? due + (installment?.amount ?? 0) : 0)) * 100) / 100);
  const byDate = (dueDate: string | undefined, daysBefore: number) => (dueDate ? day(dueDate) : `${daysBefore} days before your event`);
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
                <div className="flex justify-between font-medium"><dt>Rentals</dt><dd className="tabular-nums">{usd(subtotal)}</dd></div>
                {allIn.lines.map((f) => (
                  <div key={f.label} className="flex justify-between"><dt className="text-muted">{f.label}{f.note ? ` (${f.note})` : ""}</dt><dd className="tabular-nums">{usd(f.amount)}</dd></div>
                ))}
                <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Estimated total</dt><dd className="tabular-nums">{usd(allIn.total)}</dd></div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-muted">
                No separate booking fee. Delivery and setup are confirmed once we have your venue details; anything that changes is shown here before you pay the balance.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-muted">Your coordinator will add the itemized list here.</p>
          )}
          <PriceDisclaimer className="mt-4" />
        </section>

        <aside className="space-y-6">
          <section className="card p-6" aria-labelledby="book">
            <h2 id="book" className="font-heading font-semibold text-2xl">Book your date</h2>
            {paid ? (
              <div className="mt-3 space-y-2 text-sm leading-6">
                <p className="flex items-center gap-2 font-medium text-ink"><Icon name="check" size={18} className="text-gold" /> Booking secured. Thank you!</p>
                <p className="text-muted">
                  Your items are reserved for your date. We&apos;ll confirm delivery and pickup times by email.{" "}
                  {installment && (
                    <>A second payment of {usd(installment.amount)} is due {byDate(installment.dueDate, PAYMENT_SCHEDULE.secondDueDaysBefore)}, and the{" "}</>
                  )}
                  {!installment && <>The{" "}</>}
                  balance is due {byDate(finalDueDate, PAYMENT_SCHEDULE.finalDueDaysBefore)}. Reply any time to change quantities.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-4 text-sm leading-6">
                <p>Your items are held while you decide. Paying the deposit reserves them for your date.</p>
                <div className="rounded-xl bg-gold-soft/50 p-4">
                  <p className="text-muted">{chargeLabel(lead)}</p>
                  <p className="mt-1 font-heading font-semibold text-3xl tabular-nums">{usd(due)}</p>
                  {discount > 0 && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gold">
                      <Icon name="check" size={14} /> Includes your {usd(discount)} first-booking offer
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {chargeMode() === "hold" ? (
                      `Fully refundable for ${PAYMENT_SCHEDULE.refundHours} hours. Counts toward your order.`
                    ) : (
                      <>
                        Fully refundable for {PAYMENT_SCHEDULE.refundHours} hours. Counts toward your order.{" "}
                        {installment && <>About {usd(installment.amount)} due {byDate(installment.dueDate, PAYMENT_SCHEDULE.secondDueDaysBefore)}.{" "}</>}
                        About {usd(balance)} balance due {byDate(finalDueDate, PAYMENT_SCHEDULE.finalDueDaysBefore)}.
                      </>
                    )}
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
                    <TermsCheckbox missing={sp.terms === "missing"} />
                    <button className="btn-primary w-full">Secure my booking</button>
                    <p className="mt-2 text-center text-xs text-muted">Secure card or bank payment by Stripe.</p>
                  </form>
                  </>
                ) : sp.accepted === "1" || lead.terms_accepted_at ? (
                  <p className="rounded-xl border border-line p-4 text-muted">
                    Thanks, you&apos;ve accepted this quote. We&apos;ll send a secure payment link
                    {site.phone ? <> shortly, or call <a href={`tel:${contact.phone}`} className="text-accent">{site.phone}</a></> : null}.
                  </p>
                ) : (
                  <form action={acceptProposal} className="rounded-xl border border-line p-4">
                    <input type="hidden" name="token" value={token} />
                    <p className="text-muted">
                      Ready to book? Accept your quote and we&apos;ll send a secure payment link
                      {site.phone ? <>, or call <a href={`tel:${contact.phone}`} className="text-accent">{site.phone}</a></> : null}.
                    </p>
                    <TermsCheckbox missing={sp.terms === "missing"} />
                    <button className="btn-primary w-full">Accept this quote</button>
                  </form>
                )}
              </div>
            )}
          </section>
          <p className="px-1 text-xs leading-5 text-muted">
            Read our{" "}
            <Link href="/booking-promise" className="underline underline-offset-2">Booking Promise</Link> and{" "}
            <Link href="/terms" className="underline underline-offset-2">terms</Link>.
          </p>
          <p className="px-1 text-xs leading-5 text-muted">
            Follow delivery times, payments and messages in{" "}
            <Link href="/account" className="underline underline-offset-2">your account</Link>. Sign in with the email this proposal was sent to.
          </p>
        </aside>
      </div>
    </div>
  );
}
