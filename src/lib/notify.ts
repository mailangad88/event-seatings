import "server-only";
import { createElement, type ReactElement } from "react";
import { render, toPlainText } from "@react-email/render";
import { DownloadEmail, NewReviewEmail, OwnerLeadEmail, QuoteReceivedEmail } from "@/emails/templates";
import { usd } from "./catalog-types";
import type { Review } from "./reviews";
import { replyPromise, site } from "./site";
import type { Lead } from "./store";

// Email sending through Resend's HTTP API, with branded HTML from React Email (src/emails) plus a plain-text part.
// Nothing is sent unless RESEND_API_KEY is set. Failures are logged, never shown to the visitor.
async function send({ to, subject, email, from }: { to: string; subject: string; email: ReactElement; from?: string }) {
  const key = process.env.RESEND_API_KEY;
  const sender = from ?? process.env.NOTIFY_FROM;
  if (!key || !sender) return;
  try {
    const html = await render(email);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: sender, to, subject, html, text: toPlainText(html) }),
    });
    if (!res.ok) console.error("email send failed", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("email send failed", err);
  }
}

// Owner alerts may use Resend's shared test sender until a domain is verified; customer emails may not.
const ownerFrom = () => process.env.NOTIFY_FROM ?? `${site.name} <onboarding@resend.dev>`;

/** Emails the owner when a lead comes in, if RESEND_API_KEY and NOTIFY_EMAIL are set. */
export async function notifyOwner(lead: Lead) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await send({
    to,
    from: ownerFrom(),
    subject: `New ${lead.kind} lead: ${lead.name ?? lead.email}${lead.quote_subtotal ? ` · ${usd(lead.quote_subtotal, 0)}` : ""}`,
    email: createElement(OwnerLeadEmail, { lead }),
  });
}

/**
 * Emails a visitor the links to the free download they just unlocked (source "download:<slug>").
 * Needs RESEND_API_KEY and NOTIFY_FROM on a verified sending domain; without them the visitor still gets
 * the links on screen. This is also the first touch of the planning nurture sequence.
 */
export async function sendDownloadEmail(lead: Lead, title: string, files: { label: string; file: string }[]) {
  await send({ to: lead.email, subject: `Your free ${title}`, email: createElement(DownloadEmail, { name: lead.name, title, files }) });
}

/**
 * "We have your quote request" to the customer. Off unless CONFIRMATION_EMAILS=on (plus RESEND_API_KEY and a
 * verified NOTIFY_FROM), so turning on Resend never starts customer emails by surprise.
 */
export async function sendQuoteConfirmation(lead: Lead) {
  if (process.env.CONFIRMATION_EMAILS !== "on" || lead.kind !== "quote") return;
  await send({
    to: lead.email,
    subject: `We received your ${site.name} quote request`,
    email: createElement(QuoteReceivedEmail, { lead, replyPromise }),
  });
}

/** Tells the owner a review is waiting in /admin/reviews. */
export async function notifyOwnerOfReview(review: Review) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await send({
    to,
    from: ownerFrom(),
    subject: `New ${review.rating}-star review from ${review.name} (waiting for approval)`,
    email: createElement(NewReviewEmail, { rating: review.rating, name: review.name, body: review.body, verified: review.verified }),
  });
}
