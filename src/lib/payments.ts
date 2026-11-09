import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { paymentPlanFor } from "./catalog-types";
import { firstBookingDiscountApplied, withFirstBookingDiscount } from "./offers";
import type { Lead } from "./store";

// Deposit checkout for customer proposals (/proposal/<token>).
//
// Customers pay us in stages (PAYMENT_SCHEDULE in catalog-types): a deposit to book, then up to two
// more installments before the event. This file only collects the first one, through Stripe; later
// installments are recorded by hand in /admin/payments (cash, Zelle, check or a second Stripe link).
// Payment runs on Stripe Checkout, called with plain fetch (no SDK). Everything is OFF until
// STRIPE_SECRET_KEY is set; without it the proposal page says "we'll send you a secure payment link"
// and Angad can mark the deposit paid by hand in /admin. The lead fields keep their old names:
// fee_status / fee_amount / fee_paid_at now describe this first payment.
//
// Env:
//   STRIPE_SECRET_KEY       sk_live_… or sk_test_…  (turns checkout on)
//   STRIPE_WEBHOOK_SECRET   whsec_…  (optional but recommended; marks the fee paid even if the customer closes the tab)
//   BOOKING_CHARGE          "fee" (default: the deposit on the rentals) or "hold" (a fixed refundable hold)
//   BOOKING_HOLD_USD        hold amount when BOOKING_CHARGE=hold (default 100)

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

export type ChargeMode = "fee" | "hold";
export const chargeMode = (): ChargeMode => (process.env.BOOKING_CHARGE === "hold" ? "hold" : "fee");

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const subtotalOf = (lead: Pick<Lead, "quote_subtotal" | "items">) =>
  lead.quote_subtotal ?? (lead.items ?? []).reduce((s, l) => s + l.line_total, 0);

// What the customer pays us at checkout, in USD: the first stage of their payment plan.
export function amountDue(lead: Pick<Lead, "quote_subtotal" | "items" | "event_date">): number {
  if (chargeMode() === "hold") return round2(num(process.env.BOOKING_HOLD_USD, 100));
  const deposit = paymentPlanFor(subtotalOf(lead), lead.event_date)[0]?.amount ?? 0;
  return withFirstBookingDiscount(deposit, subtotalOf(lead));
}

// "Deposit" in general, or the specific share ("20% deposit", "50% deposit", "Full payment") once we
// know a lead's subtotal and event date.
export function chargeLabel(lead?: Pick<Lead, "quote_subtotal" | "items" | "event_date">): string {
  if (chargeMode() === "hold") return "Refundable booking hold";
  if (!lead) return "Deposit";
  return paymentPlanFor(subtotalOf(lead), lead.event_date)[0]?.label ?? "Deposit";
}

export const newProposalToken = () => randomBytes(16).toString("hex");

const stripe = async (path: string, init: { method?: string; body?: URLSearchParams; idempotencyKey?: string } = {}) => {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      // Stripe returns the first result for a repeated key, so a double-click can't refund twice.
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init.body,
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${path}: ${json?.error?.message ?? res.status}`);
  return json;
};

// Creates a one-time Stripe Checkout session for this proposal and returns the hosted payment URL.
export async function createCheckout(lead: Lead, siteUrl: string): Promise<{ id: string; url: string; amount: number }> {
  const amount = amountDue(lead);
  const back = `${siteUrl}/proposal/${lead.proposal_token}`;
  const event = [lead.event_type, lead.event_date].filter(Boolean).join(", ");
  const discount = firstBookingDiscountApplied(paymentPlanFor(subtotalOf(lead), lead.event_date)[0]?.amount ?? 0, subtotalOf(lead));
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${back}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: back,
    customer_email: lead.email,
    client_reference_id: lead.id,
    "metadata[lead_id]": lead.id,
    "payment_intent_data[metadata][lead_id]": lead.id,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
    "line_items[0][price_data][product_data][name]": chargeLabel(lead),
    "line_items[0][price_data][product_data][description]":
      `Payment for your event rentals${event ? ` (${event})` : ""}.${discount > 0 ? ` Includes your $${discount} first-booking offer.` : ""} Fully refundable for 72 hours. The rest is due in one or two more payments before your event.`.slice(0, 500),
  });
  const session = await stripe("checkout/sessions", { method: "POST", body });
  return { id: session.id, url: session.url, amount };
}

// Asks Stripe whether a checkout session belongs to this lead and is paid (used on the success redirect).
export async function checkoutPaid(sessionId: string, leadId: string): Promise<boolean> {
  if (!stripeEnabled() || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return false;
  const s = await stripe(`checkout/sessions/${sessionId}`);
  return s?.metadata?.lead_id === leadId && s?.payment_status === "paid";
}

// Verifies a Stripe webhook signature (the "Stripe-Signature" header: t=…,v1=…). Rejects events older than 5 minutes.
export function verifyStripeSignature(payload: string, header: string | null, secret: string, now = Date.now()): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );
  const t = Number(parts.t);
  if (!t || Math.abs(now / 1000 - t) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .some((p) => {
      const sig = Buffer.from(p.slice(3), "hex");
      const exp = Buffer.from(expected, "hex");
      return sig.length === exp.length && timingSafeEqual(sig, exp);
    });
}

// Refunds the card payment behind a proposal's checkout session, in full. Only ever called from the two-step
// Refund button in /admin/payments. Returns Stripe's refund id and the amount refunded in USD.
export async function refundCheckout(sessionId: string, leadId: string): Promise<{ id: string; amount: number; status: string }> {
  if (!stripeEnabled()) throw new Error("Stripe is not set up");
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new Error("Not a Stripe checkout payment");
  const s = await stripe(`checkout/sessions/${sessionId}`);
  if (s?.metadata?.lead_id !== leadId) throw new Error("This payment belongs to a different proposal");
  const intent = typeof s?.payment_intent === "string" ? s.payment_intent : s?.payment_intent?.id;
  if (!intent || s?.payment_status !== "paid") throw new Error("Stripe has no completed payment for this proposal");
  const refund = await stripe("refunds", {
    method: "POST",
    body: new URLSearchParams({ payment_intent: intent, reason: "requested_by_customer", "metadata[lead_id]": leadId }),
    idempotencyKey: `refund-${sessionId}`,
  });
  return { id: refund.id, amount: (refund.amount ?? 0) / 100, status: refund.status };
}
