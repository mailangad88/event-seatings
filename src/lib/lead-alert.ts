import { getVendor } from "@/data/vendors";
import { styleName } from "./event-plan";
import { MARKUP, usd, type QuoteLine } from "./catalog-types";
import { interestsFor, interestSummary, type Interest } from "./interests";
import { sourceLabel, type JourneyClick } from "./journey";
import { scoreLead, suggestedReply } from "./lead-score";
import { partnerStatusLabel, statusLabel, type Lead, type VendorPartner } from "./store";

// Everything the owner needs to answer one enquiry well, worked out once and shown in two places:
// the alert email (lib/notify.ts + src/emails/LeadAlertEmail.tsx) and the lead page in /admin.
// All times are shown in US Central (the business) and, where useful, the visitor's own time zone.

export type Row = { label: string; value: string; tone?: "good" | "bad" | "note"; href?: string };
export type JourneyStep = { n: number; title: string; path: string; at: string; landed?: boolean; submitted?: boolean; visit: number };

export type VendorRoute = { name: string; phone?: string; share: number; items: number; status?: string; id: string };

export type LeadAlert = {
  id: string;
  badge: string;
  grade: string;
  gradeReasons: string[];
  name: string;
  email: string;
  phone?: string;
  summary: string; // "Wedding · Sat, Jun 12, 2027 · 120 guests · $3,412"
  outreach: { nextStep: string; opener: string; warning?: string; rows: Row[] };
  sent: Row[];
  consent: Row[];
  qualifying: Row[];
  quote?: { lines: QuoteLine[]; subtotal: number; cost: number; perGuest?: number };
  vendors: VendorRoute[];
  source: Row[];
  journey?: {
    firstVisit: string;
    cameFrom: string;
    visits: string;
    campaign: string;
    steps: JourneyStep[];
    clicks: (JourneyClick & { when: string })[];
  };
  interests: Interest[];
  earlier: { id: string; when: string; what: string }[];
  adminUrl: string;
};

const kindLabel: Record<Lead["kind"], string> = {
  quote: "Quote request",
  call: "Call request",
  chat: "Question",
  quiz: "Planner or quiz",
  waitlist: "Download or sign-up",
  partner: "Vendor application",
};

const CT = "America/Chicago";
const fmt = (d: Date, tz: string, o: Intl.DateTimeFormatOptions) => {
  try {
    return d.toLocaleString("en-US", { timeZone: tz, ...o });
  } catch {
    return d.toLocaleString("en-US", { timeZone: CT, ...o });
  }
};
export const centralTime = (iso: string) => fmt(new Date(iso), CT, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const prettyDate = (d?: string) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : undefined;
const daysUntil = (d: string, now: Date) => Math.round((new Date(`${d}T12:00:00`).getTime() - now.getTime()) / 864e5);
const ago = (ms: number) => {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${Math.max(m, 0)} min`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"}`;
  return `${Math.round(h / 24)} days`;
};

// When to call: 9 AM to 8 PM in their time zone. Says whether now works, and if not, when the window opens.
export function callWindow(tz: string | undefined, at: Date): string {
  const zone = tz || CT;
  const hour = Number(fmt(at, zone, { hour: "numeric", hourCycle: "h23" }));
  const minute = Number(fmt(at, zone, { minute: "numeric" }));
  const local = `${fmt(at, zone, { weekday: "short", hour: "numeric", minute: "2-digit" })} (${zone})`;
  if (!Number.isFinite(hour)) return local;
  if (hour >= 9 && hour < 20) return `${local}: a fine time to call now`;
  const hoursAhead = hour < 9 ? 9 - hour : 24 - hour + 9;
  const next = new Date(at.getTime() + hoursAhead * 3600e3 - minute * 60e3);
  const theirs = fmt(next, zone, { weekday: "short", hour: "numeric", minute: "2-digit" });
  const ours = fmt(next, CT, { weekday: "short", hour: "numeric", minute: "2-digit" });
  return `${local}: outside calling hours. Call from ${theirs} their time${zone === CT ? "" : ` (${ours} Chicago time)`}`;
}

function nextStep(lead: Lead, now: Date, topVendor?: string): { text: string; warning?: string } {
  const days = lead.event_date ? daysUntil(lead.event_date, now) : undefined;
  const vendor = topVendor ? ` with ${topVendor}` : " with the rental partner";
  const reach = lead.phone && (lead.call_consent || lead.kind === "call") ? "Call" : "Email";
  if (lead.kind === "partner") return { text: "A rental company wants to work with us. Call them, go over the referral terms, then add their contact in /admin/vendors." };
  if (lead.kind === "chat") return { text: "Answer their question by email today, then offer to price their list." };
  if (days !== undefined && days >= 0 && days <= 14)
    return { text: `${reach} within the hour. The event is ${days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}, so check stock${vendor} first, then confirm.`, warning: "Short notice: stock may already be booked for this date." };
  if (lead.kind === "call") return { text: "They asked for a call. Call them at the time below and have their list open." };
  if (lead.kind === "quote")
    return { text: `${reach} today. Check the date${vendor}, then send the proposal from the lead page so the deposit is collected first.` };
  if (lead.source?.startsWith("planner:")) return { text: "They built a plan with no date yet. Send the list back with prices and ask for the date and venue." };
  if (lead.source?.startsWith("download:")) return { text: "Early planning. Let the follow-up emails run, and reply personally only if they write back." };
  return { text: "Early planning. Send a short personal note with one useful link that matches what they looked at." };
}

export function buildLeadAlert(
  lead: Lead,
  opts: { earlier?: Lead[]; partners?: Map<string, VendorPartner>; siteUrl?: string; now?: Date } = {},
): LeadAlert {
  const now = opts.now ?? new Date(lead.created_at);
  const score = lead.lead_score ? { grade: lead.lead_score, reasons: (lead.lead_score_reasons ?? "").split("; ").filter(Boolean) } : scoreLead(lead);
  const lines = lead.items ?? [];
  const subtotal = lead.quote_subtotal ?? 0;
  const interests = interestsFor(lead);

  // Rental partners on this list, biggest share of the order first.
  const byVendor = new Map<string, { cost: number; items: number }>();
  for (const l of lines) {
    const v = byVendor.get(l.vendor_id) ?? { cost: 0, items: 0 };
    v.cost += l.vendor_price * l.qty;
    v.items += 1;
    byVendor.set(l.vendor_id, v);
  }
  const totalCost = [...byVendor.values()].reduce((s, v) => s + v.cost, 0) || 1;
  const vendors: VendorRoute[] = [...byVendor]
    .map(([id, v]): VendorRoute => {
      const vendor = getVendor(id);
      const p = opts.partners?.get(id);
      return { id, name: vendor?.name ?? id, phone: p?.contact_phone ?? vendor?.phone, share: Math.round((v.cost / totalCost) * 100), items: v.items, status: p ? partnerStatusLabel(p.status) : undefined };
    })
    .sort((a, b) => b.share - a.share);
  if (lead.assigned_vendor && !vendors.some((v) => v.id === lead.assigned_vendor)) {
    const v = getVendor(lead.assigned_vendor);
    vendors.unshift({ id: lead.assigned_vendor, name: v?.name ?? lead.assigned_vendor, phone: v?.phone, share: 0, items: 0, status: "Assigned" });
  }

  const step = nextStep(lead, now, vendors[0]?.name.split(" (")[0]);
  const earlierLeads = (opts.earlier ?? []).filter((l) => l.id !== lead.id && l.created_at <= lead.created_at);
  const earlier = earlierLeads.map((l) => ({
    id: l.id,
    when: centralTime(l.created_at),
    what: `${kindLabel[l.kind]}${l.event_date ? ` for ${prettyDate(l.event_date)}` : ""}${l.quote_subtotal ? `, ${usd(l.quote_subtotal, 0)}` : ""} (${statusLabel(l.status)})`,
  }));
  const j = lead.journey;
  const created = new Date(lead.created_at);

  const relationship = earlierLeads.length
    ? `Came back: ${earlierLeads.length} earlier enquir${earlierLeads.length === 1 ? "y" : "ies"}, last ${earlier[0].when} · stage ${statusLabel(lead.status)}`
    : `New contact · stage ${statusLabel(lead.status)}`;
  const engagement = j
    ? `${j.visits} visit${j.visits === 1 ? "" : "s"}, ${j.page_views} page view${j.page_views === 1 ? "" : "s"} · first seen ${centralTime(j.first_seen ?? j.pages[0].at)} · landed on ${j.pages[0].path}`
    : lead.pages_viewed
      ? `Pages: ${lead.pages_viewed}`
      : "No page history (they turned it off, or came straight to the form)";

  const days = lead.event_date ? daysUntil(lead.event_date, now) : undefined;
  const tierId = lead.source?.startsWith("planner:") ? lead.source.slice(8).split("-")[1] : undefined;
  const tier = tierId ? styleName(tierId) : "";
  const perGuest = subtotal && lead.guest_count ? subtotal / lead.guest_count : undefined;

  const cameFrom = sourceLabel(lead.first_utm_source ?? lead.utm_source, lead.first_utm_medium ?? lead.utm_medium);
  const campaign = [lead.utm_source && `source=${lead.utm_source}`, lead.utm_medium && `medium=${lead.utm_medium}`, lead.utm_campaign && `campaign=${lead.utm_campaign}`]
    .filter(Boolean)
    .join(", ");

  const opt = (label: string, value?: string | number | null, extra: Partial<Row> = {}): Row[] =>
    value === undefined || value === null || value === "" ? [] : [{ label, value: String(value), ...extra }];

  const siteUrl = opts.siteUrl ?? "";
  return {
    id: lead.id,
    badge: kindLabel[lead.kind],
    grade: score.grade,
    gradeReasons: score.reasons,
    name: lead.name ?? lead.email,
    email: lead.email,
    phone: lead.phone,
    summary: [lead.event_type, prettyDate(lead.event_date), lead.guest_count && `${lead.guest_count} guests`, subtotal && usd(subtotal, 0)].filter(Boolean).join(" · "),
    outreach: {
      nextStep: step.text,
      warning: step.warning,
      opener: suggestedReply(lead),
      rows: [
        ...opt("Their time", lead.phone ? callWindow(lead.visitor_tz, created) : `${callWindow(lead.visitor_tz, created).split(":")[0]} (no phone given, reply by email)`),
        { label: "Relationship", value: relationship },
        { label: "Engagement", value: engagement },
        ...opt("Interested in", interestSummary(interests)),
      ],
    },
    sent: [
      ...opt("Occasion", lead.event_type),
      ...opt("Event date", prettyDate(lead.event_date) && `${prettyDate(lead.event_date)}${days !== undefined ? (days >= 0 ? ` (in ${days} days)` : " (already passed)") : ""}`),
      ...opt("Guests", lead.guest_count),
      ...opt("Venue", lead.venue),
      ...opt("City", lead.city),
      ...opt("Phone", lead.phone, { href: lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : undefined }),
      ...opt("Message", lead.message),
      ...opt("Chairs", !lines.length && lead.chairs?.length ? lead.chairs.join(", ") : undefined),
      ...opt("Style quiz", lead.quiz_styles?.join(", ")),
      ...opt("Referred by", lead.referral_code && `referral code ${lead.referral_code}`),
    ],
    consent: [
      lead.phone
        ? lead.sms_consent
          ? { label: "Text messages", value: "OK to text about this quote.", tone: "good" }
          : { label: "Text messages", value: "NOT opted in. Do not text this number.", tone: "bad" }
        : { label: "Text messages", value: "No phone number given." },
      ...(lead.phone ? [{ label: "Calls", value: lead.call_consent || lead.kind === "call" ? "OK to call." : "Did not tick the call box. Email first.", tone: lead.call_consent || lead.kind === "call" ? "good" : "note" } as Row] : []),
      {
        label: "Email",
        value: lead.opted_out_at
          ? "Unsubscribed. Reply by hand only to what they asked."
          : lead.email_consent
            ? "OK to send planning tips and follow-ups."
            : "Reply to their request only. Not signed up for tips.",
        tone: lead.opted_out_at ? "bad" : lead.email_consent ? "good" : "note",
      },
      ...opt("Consent recorded", lead.consent_at && centralTime(lead.consent_at)),
    ],
    qualifying: [
      { label: "Lead score", value: `${score.grade} (${score.reasons.join(", ") || "not enough to go on"})` },
      ...opt("Package picked", tier),
      ...opt("Quote total", subtotal ? `${usd(subtotal, 0)}${perGuest ? ` (${usd(perGuest, 0)} per guest)` : ""}` : undefined),
      ...opt("Our margin", subtotal ? `about ${usd((subtotal * MARKUP) / (1 + MARKUP), 0)} (${Math.round(MARKUP * 100)}% on items)` : undefined),
      ...opt("How soon", days !== undefined ? (days < 0 ? "Date has passed" : days <= 30 ? "This month" : days <= 120 ? "Within 4 months" : days <= 365 ? "This year" : "More than a year out") : "No date yet"),
      ...opt("Interested in", interestSummary(interests)),
    ],
    quote: lines.length ? { lines, subtotal, cost: lead.quote_cost ?? 0, perGuest } : undefined,
    vendors,
    source: [
      { label: "Form", value: `${kindLabel[lead.kind]}${lead.source ? ` (${lead.source})` : ""}` },
      ...opt("Sent from", lead.page_path, { href: lead.page_path ? `${siteUrl}${lead.page_path}` : undefined }),
      ...opt("Location", lead.ip_location && `${lead.ip_location} (from IP, approximate)`),
      ...opt("Device", j?.device),
      ...opt("Their time zone", lead.visitor_tz),
      { label: "Came from", value: sourceLabel(lead.utm_source, lead.utm_medium) },
      ...opt("First found us via", lead.first_utm_source && lead.first_utm_source !== lead.utm_source ? sourceLabel(lead.first_utm_source, lead.first_utm_medium) : undefined),
      ...opt("Referring site", lead.referrer),
      ...opt("Landing page", lead.landing_page),
      ...opt("Ad click", lead.gclid ? "Google Ads" : lead.fbclid ? "Facebook/Instagram" : lead.msclkid ? "Microsoft Ads" : undefined),
    ],
    journey: j
      ? {
          firstVisit: `${centralTime(j.first_seen ?? j.pages[0].at)} (${ago(created.getTime() - new Date(j.first_seen ?? j.pages[0].at).getTime())} before the form)`,
          cameFrom,
          visits: `${j.visits} visit${j.visits === 1 ? "" : "s"}, ${j.page_views} page${j.page_views === 1 ? "" : "s"}`,
          campaign: campaign || "none",
          steps: j.pages.map((p, i) => ({
            n: i + 1,
            title: p.title ?? p.path,
            path: p.path,
            at: centralTime(p.at),
            visit: p.visit,
            landed: i === 0,
            submitted: !!lead.page_path && p.path === lead.page_path && i === j.pages.map((x) => x.path).lastIndexOf(lead.page_path),
          })),
          clicks: (j.clicks ?? []).map((c) => ({ ...c, when: centralTime(c.at) })),
        }
      : undefined,
    interests,
    earlier,
    adminUrl: `${siteUrl}/admin/leads/${lead.id}`,
  };
}

// Plain-text version of the alert (the email's text part, and a fallback when HTML can't render).
export function leadAlertText(a: LeadAlert): string {
  const rows = (title: string, list: Row[]) => (list.length ? ["", title.toUpperCase(), ...list.map((r) => `${r.label}: ${r.value}`)] : []);
  return [
    `${a.badge} · ${a.grade} lead`,
    `${a.name} <${a.email}>${a.phone ? ` · ${a.phone}` : ""}`,
    a.summary,
    "",
    "OUTREACH",
    `Next step: ${a.outreach.nextStep}`,
    ...(a.outreach.warning ? [a.outreach.warning] : []),
    `Opener to adapt: ${a.outreach.opener}`,
    ...a.outreach.rows.map((r) => `${r.label}: ${r.value}`),
    ...rows("What they sent", a.sent),
    ...rows("Consent", a.consent),
    ...rows("Qualifying", a.qualifying),
    ...(a.quote ? ["", "QUOTE", ...a.quote.lines.map((l) => `  ${l.qty} x ${l.name} @ ${usd(l.unit_price)} = ${usd(l.line_total)}`), `  Total ${usd(a.quote.subtotal)} (vendor cost ${usd(a.quote.cost)})`] : []),
    ...(a.vendors.length ? ["", "WHO TO CALL", ...a.vendors.map((v) => `  ${v.name}${v.phone ? ` ${v.phone}` : ""}: ${v.items} item${v.items === 1 ? "" : "s"}, ${v.share}% of cost${v.status ? ` (${v.status})` : ""}`)] : []),
    ...rows("Where they came from", a.source),
    ...(a.journey
      ? [
          "",
          "PAGES THEY VISITED (US Central time)",
          `First visit ${a.journey.firstVisit} · ${a.journey.cameFrom} · ${a.journey.visits} · campaign: ${a.journey.campaign}`,
          ...a.journey.steps.map((s) => `  ${s.n}. ${s.title} (${s.path}) ${s.at}${s.landed ? " [landed]" : ""}${s.submitted ? " [sent the form]" : ""}`),
          ...(a.journey.clicks.length ? ["Clicked:", ...a.journey.clicks.map((c) => `  ${c.when} "${c.label}"${c.href ? ` -> ${c.href}` : ""} on ${c.path}`)] : []),
        ]
      : []),
    ...(a.earlier.length ? ["", "EARLIER ENQUIRIES", ...a.earlier.map((e) => `  ${e.when}: ${e.what}`)] : []),
    "",
    `Open the full record: ${a.adminUrl}`,
    `Call script and "ask what's missing" email: ${a.adminUrl}/script`,
  ].join("\n");
}
