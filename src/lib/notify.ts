import "server-only";
import type { Lead } from "./store";

// Emails the owner when a lead comes in, if RESEND_API_KEY and NOTIFY_EMAIL are set.
// Failures are logged, never shown to the visitor.
export async function notifyOwner(lead: Lead) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;

  const lines = Object.entries(lead)
    .filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "Event Seatings <onboarding@resend.dev>",
        to,
        subject: `New ${lead.kind} lead: ${lead.name ?? lead.email}`,
        text: lines.join("\n"),
      }),
    });
  } catch (err) {
    console.error("notifyOwner failed", err);
  }
}
