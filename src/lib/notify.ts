import "server-only";
import { createElement } from "react";
import { render } from "@react-email/render";
import { NewReviewEmail, TextEmail } from "@/emails/templates";
import { usd } from "./catalog-types";
import { LeadAlertEmail } from "@/emails/LeadAlertEmail";
import { buildLeadAlert, leadAlertText } from "./lead-alert";
import { site } from "./site";
import type { Review } from "./reviews";
import { listLeadsByEmail, listPartners, type Lead } from "./store";
import { unsubscribeUrl } from "./unsubscribe";

// All email goes through Resend and only when RESEND_API_KEY is set. Owner alerts also need NOTIFY_EMAIL;
// anything sent to a visitor also needs NOTIFY_FROM on a verified sending domain (never the resend.dev test sender).
// Failures are logged, never shown to the visitor.

type Mail = { to: string; subject: string; text: string; from?: string; unsubscribe?: string; html?: string };

// Branded HTML (React Email, src/emails) built from the plain text, so every email looks like the site while
// the text part stays exactly as written. A caller can pass its own `html` instead.
async function brandedHtml(subject: string, text: string, unsubscribe?: string) {
  try {
    return await render(createElement(TextEmail, { subject, text, unsubscribe }));
  } catch (err) {
    console.error("email html render failed", err);
    return undefined;
  }
}

export async function sendEmail({ to, subject, text, from, unsubscribe, html }: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  html ??= await brandedHtml(subject, text, unsubscribe);
  const headers: Record<string, string> = {};
  if (unsubscribe?.startsWith("http")) {
    headers["List-Unsubscribe"] = `<${unsubscribe}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  try {
    const res = await fetch(`${process.env.RESEND_API_URL ?? "https://api.resend.com"}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: from ?? process.env.NOTIFY_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to,
        subject,
        text,
        ...(html ? { html } : {}),
        // Replies from visitors land in the owner's inbox, not a no-reply box.
        ...(process.env.NOTIFY_EMAIL && to !== process.env.NOTIFY_EMAIL ? { reply_to: process.env.NOTIFY_EMAIL } : {}),
        ...(Object.keys(headers).length ? { headers } : {}),
      }),
    });
    if (!res.ok) console.error("sendEmail failed", res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (err) {
    console.error("sendEmail failed", err);
    return false;
  }
}

const kindLabel: Record<Lead["kind"], string> = {
  quote: "Quote request",
  call: "Call request",
  chat: "Chat question",
  quiz: "Style quiz",
  waitlist: "Download / sign-up",
  partner: "Vendor application",
};

const prettyDate = (d?: string) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : undefined;

// The owner alert: who, what, how good, what to do first, consent, where they came from and every page they visited.
// Sent within seconds of the form. Returns true when Resend accepted it.
export async function notifyOwner(lead: Lead): Promise<boolean> {
  const to = process.env.NOTIFY_EMAIL;
  if (!process.env.RESEND_API_KEY || !to) return false;

  const [earlier, partners] = await Promise.all([
    listLeadsByEmail(lead.email).catch(() => [] as Lead[]),
    listPartners().catch(() => []),
  ]);
  const alert = buildLeadAlert(lead, { earlier, partners: new Map(partners.map((p) => [p.vendor_id, p])), siteUrl: site.url });
  const text = leadAlertText(alert);
  const html = await render(createElement(LeadAlertEmail, { alert, siteUrl: site.url })).catch((err) => {
    console.error("lead alert html render failed", err);
    return undefined;
  });

  return sendEmail({
    to,
    subject: `[${alert.grade}] New ${kindLabel[lead.kind].toLowerCase()}: ${lead.name ?? lead.email}${lead.event_date ? ` · ${prettyDate(lead.event_date)}` : ""}${lead.quote_subtotal ? ` · ${usd(lead.quote_subtotal, 0)}` : ""}${earlier.length > 1 ? " · came back" : ""}`,
    text,
    html,
  });
}

function bookingLine(lead: Lead) {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL;
  return url
    ? `Want to talk it through sooner? Pick a 15-minute time here: ${url}`
    : `Want to talk it through sooner? Reply with a good time to call${lead.phone ? "" : " and your number"}.`;
}

const signOff = (email: string) => [
  "",
  `The ${site.name} team`,
  site.url.replace(/^https?:\/\//, ""),
  "",
  `You're getting this because you contacted ${site.name}. Stop all automated emails: ${unsubscribeUrl(email)}`,
];

// Instant confirmation to the visitor for quotes, call requests and chat questions:
// what happens next, the booking link and what to have ready. Downloads have their own email below.
export async function sendConfirmation(lead: Lead): Promise<string | undefined> {
  if (!process.env.NOTIFY_FROM || !["quote", "call", "chat"].includes(lead.kind) || lead.opted_out_at) return;
  // Fixed greeting: the name comes from an unauthenticated form, so never echo it into an email to an arbitrary address.
  const hi = "Hi,";
  const date = prettyDate(lead.event_date);
  const body: Record<string, string[]> = {
    quote: [
      `Thanks, we have your quote request${date ? ` for ${date}` : ""}${lead.quote_subtotal ? ` (estimate ${usd(lead.quote_subtotal, 0)})` : ""}.`,
      "",
      "What happens next:",
      "1. We check your date with our Chicago-area rental partners.",
      "2. You get one itemized proposal by email, usually within one business day.",
      "3. Nothing is charged or held until you approve it.",
      "",
      "To make the proposal exact, it helps to have ready:",
      "- Venue name and address, and whether it's indoors, outdoors or a tent",
      "- Delivery and pickup windows the venue allows",
      "- Any items you didn't see on the site",
    ],
    call: [
      "Thanks for asking for a call. We'll reach out within one business day to set a time.",
      "",
      "To make the 15 minutes count, have ready if you can:",
      "- Your date, guest count and venue",
      "- A rough budget for rentals",
      "- Photos or links of a look you like",
    ],
    chat: [
      "Thanks for your question. We read every message and will reply by email, usually within one business day.",
      "",
      `While you wait, you can price everything for your date in one list: ${site.url}/quote`,
    ],
  };
  const subject = lead.kind === "quote" ? "We got your quote request" : lead.kind === "call" ? "We got your call request" : "We got your question";
  const ok = await sendEmail({
    to: lead.email,
    subject,
    text: [hi, "", ...body[lead.kind], "", bookingLine(lead), ...signOff(lead.email)].join("\n"),
    unsubscribe: unsubscribeUrl(lead.email),
  });
  return ok ? subject : undefined;
}

/**
 * Emails a visitor the links to the free download they just unlocked (source "download:<slug>").
 * Needs RESEND_API_KEY and NOTIFY_FROM on a verified sending domain; without them the visitor still gets
 * the links on screen. This is also the first touch of the planning nurture sequence.
 */
export async function sendDownloadEmail(lead: Lead, title: string, files: { label: string; file: string }[]): Promise<string | undefined> {
  if (!process.env.NOTIFY_FROM || lead.opted_out_at) return;
  // Fixed greeting: the name comes from an unauthenticated form, so never echo it into an email to an arbitrary address.
  const hi = "Hi,";
  const text = [
    hi,
    "",
    `Here is your free ${title}:`,
    ...files.map((f) => `- ${f.label}: ${site.url}${f.file}`),
    "",
    "Two things that save planners the most time:",
    `1. Price every rental on one list (chairs, tables, linens, tents, dishes): ${site.url}/quote`,
    `2. Talk it through on a free 15-minute planning call: ${site.url}/book`,
    "",
    `More free kits and spreadsheets: ${site.url}/downloads`,
    ...signOff(lead.email),
  ].join("\n");
  const subject = `Your free ${title}`;
  return (await sendEmail({ to: lead.email, subject, text, unsubscribe: unsubscribeUrl(lead.email) })) ? subject : undefined;
}

/** Tells the owner a review is waiting in /admin/reviews. */
export async function notifyOwnerOfReview(review: Review) {
  const to = process.env.NOTIFY_EMAIL;
  if (!process.env.RESEND_API_KEY || !to) return;
  const subject = `New ${review.rating}-star review from ${review.name} (waiting for approval)`;
  const text = [
    `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} from ${review.name}${review.verified ? " (verified booking)" : ""}`,
    "",
    review.body,
    "",
    `Publish or hide: ${site.url}/admin/reviews`,
  ].join("\n");
  const html = await render(createElement(NewReviewEmail, { rating: review.rating, name: review.name, body: review.body, verified: review.verified })).catch(() => undefined);
  await sendEmail({ to, subject, text, html });
}
