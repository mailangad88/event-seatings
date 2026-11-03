import { verifyStripeSignature } from "@/lib/payments";
import { markFeePaid } from "@/lib/proposals";
import { getLead } from "@/lib/store";

// Stripe calls this when a proposal's checkout completes, so the fee is marked paid even if the
// customer closes the tab before the success page loads. Add the endpoint in Stripe → Developers →
// Webhooks: https://beyondchiavari.com/api/stripe/webhook, events checkout.session.completed and
// checkout.session.async_payment_succeeded, then set STRIPE_WEBHOOK_SECRET to its signing secret.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

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
    }
  }
  return Response.json({ received: true });
}
