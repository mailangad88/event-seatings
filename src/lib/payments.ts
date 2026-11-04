import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { coordinationFee } from "./catalog-types";
import type { Lead } from "./store";

// Booking-fee checkout for customer proposals (/proposal/<token>).
//
// The proposal names the rental company before the customer pays (so they can check it), and shares
// its contact details and agreement after. Payment runs on Stripe Checkout, called with plain
// fetch (no SDK). Everything is OFF until STRIPE_SECRET_KEY is set; without it the proposal page
// says "we'll send you a secure payment link" and Angad can mark the fee paid by hand in /admin.
//
// Env:
//   STRIPE_SECRET_KEY       sk_live_… or sk_test_…  (turns checkout on)
//   STRIPE_WEBHOOK_SECRET   whsec_…  (optional but recommended; marks the fee paid even if the customer closes the tab)
//   BOOKING_CHARGE          "fee" (default: our flat booking fee, $295 up to 200 guests, $495 above) or "hold" (a fixed refundable hold)
//   BOOKING_HOLD_USD        hold amount when BOOKING_CHARGE=hold (default 100)
//   BOOKING_FEE_MIN_USD     optional floor for tiny orders (default none; if you set one, say so in the Booking Promise)

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

export type ChargeMode = "fee" | "hold";
export const chargeMode = (): ChargeMode => (process.env.BOOKING_CHARGE === "hold" ? "hold" : "fee");

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// What the customer pays us at checkout, in USD.
export function amountDue(lead: Pick<Lead, "guest_count">): number {
  if (chargeMode() === "hold") return round2(num(process.env.BOOKING_HOLD_USD, 100));
  // One flat fee per event, set by guest count (see COORDINATION_FEE). Item prices carry no markup.
  return round2(Math.max(Number(process.env.BOOKING_FEE_MIN_USD) || 0, coordinationFee(lead.guest_count)));
}

export const chargeLabel = () => (chargeMode() === "hold" ? "Refundable booking hold" : "Booking & coordination fee");

export const newProposalToken = () => randomBytes(16).toString("hex");

const stripe = async (path: string, init: { method?: string; body?: URLSearchParams } = {}) => {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
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
    "line_items[0][price_data][product_data][name]": chargeLabel(),
    "line_items[0][price_data][product_data][description]":
      `Secures your event rentals${event ? ` (${event})` : ""}. Refundable for 72 hours. Rental charges are paid to the rental company.`.slice(0, 500),
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
