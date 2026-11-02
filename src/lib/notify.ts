import "server-only";
import { usd } from "./catalog-types";
import { site } from "./site";
import type { Lead } from "./store";

// Emails the owner when a lead comes in, if RESEND_API_KEY and NOTIFY_EMAIL are set.
// Failures are logged, never shown to the visitor.
export async function notifyOwner(lead: Lead) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;

  const skip = new Set(["items", "activity", "quote_cost", "id"]);
  const quote = lead.items?.length
    ? [
        `QUOTE ${usd(lead.quote_subtotal ?? 0)} (vendor cost ${usd(lead.quote_cost ?? 0)}, margin ${usd((lead.quote_subtotal ?? 0) - (lead.quote_cost ?? 0))})`,
        ...lead.items.map((i) => `  ${i.qty} x ${i.name} @ ${usd(i.unit_price)} = ${usd(i.line_total)}`),
        "",
      ]
    : [];
  const lines = [
    ...quote,
    ...Object.entries(lead)
      .filter(([k, v]) => !skip.has(k) && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`),
    "",
    `Open in CRM: ${site.url}/admin/leads/${lead.id}`,
  ];

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to,
        subject: `New ${lead.kind} lead: ${lead.name ?? lead.email}${lead.quote_subtotal ? ` · ${usd(lead.quote_subtotal, 0)}` : ""}`,
        text: lines.join("\n"),
      }),
    });
  } catch (err) {
    console.error("notifyOwner failed", err);
  }
}
