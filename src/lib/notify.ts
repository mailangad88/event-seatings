import "server-only";
import { createElement } from "react";
import { render } from "@react-email/render";
import { NewReviewEmail, TextEmail } from "@/emails/templates";
import { usd } from "./catalog-types";
import { scoreLead, suggestedReply, visitorLocalTime } from "./lead-score";
import { site } from "./site";
import type { Review } from "./reviews";
import type { Lead } from "./store";
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

const yesNo = (v?: boolean) => (v ? "yes" : "no");

// The owner alert: who, what, how good, where they came from and what to say first. Sent within seconds of the form.
export async function notifyOwner(lead: Lead) {
  const to = process.env.NOTIFY_EMAIL;
  if (!process.env.RESEND_API_KEY || !to) return;

  const score = lead.lead_score ? { grade: lead.lead_score, reasons: (lead.lead_score_reasons ?? "").split("; ") } : scoreLead(lead);
  const source = [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || "unknown";
  const firstSource = [lead.first_utm_source, lead.first_utm_medium, lead.first_utm_campaign].filter(Boolean).join(" / ");
  const localTime = visitorLocalTime(lead.visitor_tz, new Date(lead.created_at));

  const row = (label: string, v?: string | number | null) => (v === undefined || v === null || v === "" ? [] : [`${label}: ${v}`]);
  const lines = [
    `${score.grade} lead · ${kindLabel[lead.kind]}${lead.quote_subtotal ? ` · ${usd(lead.quote_subtotal, 0)}` : ""}`,
    `Why ${score.grade}: ${score.reasons.join(", ")}`,
    "",
    "WHO",
    ...row("Name", lead.name),
    ...row("Email", lead.email),
    ...row("Phone", lead.phone),
    `OK to email tips: ${yesNo(lead.email_consent)} · OK to call: ${yesNo(lead.call_consent)} · OK to text: ${yesNo(lead.sms_consent)}`,
    ...row("Their local time now", localTime),
    "",
    "EVENT",
    ...row("Type", lead.event_type),
    ...row("Date", prettyDate(lead.event_date)),
    ...row("Guests", lead.guest_count),
    ...row("City", lead.city),
    ...row("Venue", lead.venue),
    ...row("Message", lead.message),
    ...(lead.items?.length
      ? [
          "",
          `QUOTE ${usd(lead.quote_subtotal ?? 0)} (vendor cost ${usd(lead.quote_cost ?? 0)}, margin ${usd((lead.quote_subtotal ?? 0) - (lead.quote_cost ?? 0))})`,
          ...lead.items.map((i) => `  ${i.qty} x ${i.name} @ ${usd(i.unit_price)} = ${usd(i.line_total)}`),
        ]
      : []),
    "",
    "WHERE THEY CAME FROM",
    `Source: ${source}`,
    ...row("First found us via", firstSource && firstSource !== source ? firstSource : undefined),
    ...row("Landing page", lead.landing_page),
    ...row("Form", `${lead.source ?? lead.kind} on ${lead.page_path ?? "?"}`),
    ...row("Pages viewed", lead.pages_viewed),
    "",
    "SUGGESTED FIRST REPLY (edit before sending)",
    suggestedReply(lead),
    "",
    `Open in CRM: ${site.url}/admin/leads/${lead.id}`,
  ];

  await sendEmail({
    to,
    subject: `[${score.grade}] New ${kindLabel[lead.kind].toLowerCase()}: ${lead.name ?? lead.email}${lead.event_date ? ` · ${prettyDate(lead.event_date)}` : ""}${lead.quote_subtotal ? ` · ${usd(lead.quote_subtotal, 0)}` : ""}`,
    text: lines.join("\n"),
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
export async function sendConfirmation(lead: Lead) {
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
  await sendEmail({
    to: lead.email,
    subject: lead.kind === "quote" ? "We got your quote request" : lead.kind === "call" ? "We got your call request" : "We got your question",
    text: [hi, "", ...body[lead.kind], "", bookingLine(lead), ...signOff(lead.email)].join("\n"),
    unsubscribe: unsubscribeUrl(lead.email),
  });
}

/**
 * Emails a visitor the links to the free download they just unlocked (source "download:<slug>").
 * Needs RESEND_API_KEY and NOTIFY_FROM on a verified sending domain; without them the visitor still gets
 * the links on screen. This is also the first touch of the planning nurture sequence.
 */
export async function sendDownloadEmail(lead: Lead, title: string, files: { label: string; file: string }[]) {
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
  await sendEmail({ to: lead.email, subject: `Your free ${title}`, text, unsubscribe: unsubscribeUrl(lead.email) });
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
