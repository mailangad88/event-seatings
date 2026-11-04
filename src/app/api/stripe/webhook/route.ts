import { bodyTooLarge } from "@/lib/rate-limit";
import { verifyStripeSignature } from "@/lib/payments";
import { markFeePaid } from "@/lib/proposals";
import { getLead } from "@/lib/store";
import { sendAlert } from "@/lib/alerts";
import { log } from "@/lib/log";

// Stripe calls this when a proposal's checkout completes, so the fee is marked paid even if the
// customer closes the tab before the success page loads. Add the endpoint in Stripe → Developers →
// Webhooks: https://beyondchiavari.com/api/stripe/webhook, events checkout.session.completed and
// checkout.session.async_payment_succeeded, then set STRIPE_WEBHOOK_SECRET to its signing secret.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const big = bodyTooLarge(request, 512 * 1024);
  if (big) return big;
  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return new Response("Bad signature", { status: 400 });
  }

  const event = JSON.parse(payload);
  const paidEvents = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];
  const session = event?.data?.object;
  if (paidEvents.includes(event?.type) && session?.payment_status === "paid") {
    const lead = session.metadata?.lead_id ? await getLead(String(session.metadata.lead_id)) : undefined;
    if (lead) {
      await markFeePaid(lead, "Stripe Checkout", {
        amount: typeof session.amount_total === "number" ? session.amount_total / 100 : undefined,
        sessionId: session.id,
      });
    } else {
      // Money came in but no lead matches: the owner has to sort it out by hand, so say so loudly.
      log.error("stripe_paid_unknown_lead", { sessionId: session.id, leadId: session.metadata?.lead_id });
      await sendAlert("Stripe payment with no matching lead", {
        session: String(session.id ?? ""),
        lead: String(session.metadata?.lead_id ?? "none"),
        amount: typeof session.amount_total === "number" ? (session.amount_total / 100).toFixed(2) : undefined,
      });
    }
  }
  return Response.json({ received: true });
}
