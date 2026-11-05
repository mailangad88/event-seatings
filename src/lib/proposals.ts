import "server-only";
import { usd } from "./catalog-types";
import { site } from "./site";
import { getLead, updateLead, type Lead } from "./store";

// Marks a proposal's deposit (or hold) as paid.
// Safe to call twice (the Stripe webhook and the success redirect can both arrive).
export async function markFeePaid(lead: Lead, via: string, extra: { amount?: number; sessionId?: string } = {}) {
  const fresh = (await getLead(lead.id)) ?? lead;
  if (fresh.fee_status === "paid") return;
  const amount = extra.amount ?? fresh.fee_amount;
  await updateLead(
    fresh.id,
    {
      fee_status: "paid",
      fee_paid_at: new Date().toISOString(),
      ...(amount ? { fee_amount: amount } : {}),
      ...(extra.sessionId ? { stripe_session_id: extra.sessionId } : {}),
    },
    [{ type: "note", text: `Deposit paid${amount ? ` (${usd(amount)})` : ""} via ${via}.` }],
  );
  await alertOwner(fresh, amount, via);
}

async function alertOwner(lead: Lead, amount: number | undefined, via: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to,
        subject: `Deposit paid: ${lead.name ?? lead.email}${amount ? ` · ${usd(amount)}` : ""}`,
        text: [
          `${lead.name ?? lead.email} paid the deposit via ${via}.`,
          `Event: ${[lead.event_type, lead.event_date, lead.city].filter(Boolean).join(", ") || "not given"}`,
          "",
          "Next: place the order with the rental partner and pay their deposit. The customer's remaining payments come due in stages before the event.",
          `Open in CRM: ${site.url}/admin/leads/${lead.id}`,
        ].join("\n"),
      }),
    });
  } catch (err) {
    console.error("fee alert failed", err);
  }
}
