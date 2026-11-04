import { usd } from "./catalog-types";
import type { Lead } from "./store";

// A/B/C lead score from what the visitor told us. Used in the owner alert, the CRM webhook and /admin.
// A = call them today: a dated event soon enough to book, enough size or spend to matter, and a way to reach them fast.
// B = real and worth a personal reply, but missing size, phone or urgency.
// C = early research (a download, quiz or question with no date).
// Rules are deliberately simple so they can be explained and tuned once real leads show which ones book.
export type LeadScore = { grade: "A" | "B" | "C"; reasons: string[] };

const daysUntil = (date: string, now = new Date()) =>
  Math.round((new Date(`${date}T12:00:00`).getTime() - now.getTime()) / 864e5);

export function scoreLead(lead: Lead, now = new Date()): LeadScore {
  const reasons: string[] = [];
  let points = 0;

  const days = lead.event_date ? daysUntil(lead.event_date, now) : undefined;
  if (days !== undefined) {
    if (days < 0) reasons.push("event date is in the past");
    else if (days <= 120) {
      points += 2;
      reasons.push(`event in ${days} days`);
    } else if (days <= 365) {
      points += 1;
      reasons.push(`event in ${Math.round(days / 30)} months`);
    } else reasons.push("event more than a year out");
  } else reasons.push("no event date");

  if (lead.guest_count) {
    if (lead.guest_count >= 100) points += 2;
    else if (lead.guest_count >= 40) points += 1;
    reasons.push(`${lead.guest_count} guests`);
  }
  if (lead.quote_subtotal) {
    if (lead.quote_subtotal >= 1500) points += 2;
    else if (lead.quote_subtotal >= 500) points += 1;
    reasons.push(`quote ${usd(lead.quote_subtotal, 0)}`);
  }
  if (lead.phone) {
    points += 1;
    reasons.push("left a phone number");
  }
  if (lead.kind === "quote" || lead.kind === "call") {
    points += 1;
    reasons.push(lead.kind === "quote" ? "asked for a quote" : "asked for a call");
  }

  const dated = days !== undefined && days >= 0;
  const grade = dated && points >= 5 ? "A" : dated && points >= 3 ? "B" : "C";
  return { grade, reasons };
}

const first = (name?: string) => name?.trim().split(/\s+/)[0] ?? "";

// A first reply the owner can send as is or edit. Plain, short and specific to what they asked.
export function suggestedReply(lead: Lead): string {
  const hi = first(lead.name) ? `Hi ${first(lead.name)},` : "Hi,";
  const when = lead.event_date
    ? new Date(`${lead.event_date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : "";
  const event = (lead.event_type ?? "event").toLowerCase();
  switch (lead.kind) {
    case "quote":
      return `${hi} thanks for your quote request for your ${event}${when ? ` on ${when}` : ""}. I'm checking availability for your date now. Two quick questions so the proposal is right: is the venue indoors or outdoors, and does the venue have a delivery window or loading dock rules? Happy to do a 10-minute call if that's easier.`;
    case "call":
      return `${hi} thanks for asking for a call about your ${event}${when ? ` on ${when}` : ""}. When is a good 15 minutes for you today or tomorrow? If you already know your guest count and venue, send them over and I'll come with prices.`;
    case "chat":
      return `${hi} thanks for your question. ${lead.message ? "Here's the short answer: [answer]. " : ""}If you'd like, I can price everything for your date in one list.`;
    case "partner":
      return `${hi} thanks for applying to partner with Beyond Chiavari. Could we set up a 15-minute call this week to walk through how referrals and pricing work?`;
    default:
      if (lead.source?.startsWith("planner:"))
        return `${hi} thanks for building your ${event} plan with our planner. ${when ? `When you're ready for ${when}, ` : "Once you have a date, "}reply with it and your venue and I'll confirm prices and availability for the whole list.`;
      return `${hi} thanks for grabbing the ${lead.source?.startsWith("download:") ? "planning kit" : "guide"}. ${when ? `Your ${event} on ${when} is on our radar. ` : ""}If you want rentals priced for your date, reply with your guest count and venue and I'll send a list.`;
  }
}

// The visitor's local time when they sent the form, e.g. "5:42 PM CST", from the browser's time zone.
export function visitorLocalTime(tz?: string, at = new Date()) {
  if (!tz) return undefined;
  try {
    return at.toLocaleString("en-US", { timeZone: tz, weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  } catch {
    return undefined;
  }
}
