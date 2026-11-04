import { vendors } from "@/data/vendors";
import type { Review } from "./reviews";
import { statements } from "./commissions";
import type { Lead, VendorPartner } from "./store";
import { vendorParts } from "./orders";
import { buildStops } from "./deliveries";
import { eventsPerDay } from "./capacity";
import type { VendorApplication } from "./vendor-applications";
import { addDays, eventLine, isConfirmed, money0, prettyDay, stage } from "./admin-view";

// Everything the back office should tell the owner, worked out from the data on every page load:
// problems to fix now (urgent), things only the owner can decide (decision), heads-ups (info) and
// things that happened on their own (done). Feeds the Today briefing, the bell and /admin/alerts.
// Nothing is stored: an alert goes away once the data behind it changes.

export type AlertLevel = "urgent" | "decision" | "info" | "done";
export type AdminAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  href: string;
  at: string; // ISO time, for sorting and "2 h ago"
  action?: string; // button label for decisions: Review, Approve, Call…
  area: "customers" | "vendors" | "money" | "events" | "site";
};

export const levelLabel: Record<AlertLevel, string> = { urgent: "Fix now", decision: "Your call", info: "Heads-up", done: "Handled" };
export const levelBadge: Record<AlertLevel, string> = { urgent: "badge-rose", decision: "badge-amber", info: "badge-blue", done: "badge-green" };

// One order can go to several rental companies (each line in lead.items has its own vendor_id); each
// company's part is confirmed on its own link (lib/orders.ts, lib/vendor-confirm.ts).
const partsOf = (l: Lead) =>
  vendorParts(l)
    .filter((p) => p.vendorId && p.state !== "cancelled")
    .map((p) => ({ id: p.vendorId, status: p.order?.status, answer: p.order?.answer, answered_at: p.order?.answered_at, decline_reason: p.order?.decline_reason }));

const who = (l: Lead) => l.name || l.email;
const vendorName = (id?: string) => vendors.find((v) => v.id === id)?.name ?? "the rental partner";
const hoursSince = (iso: string, now: number) => (now - Date.parse(iso)) / 36e5;
const leadHref = (l: Lead) => `/admin/leads/${l.id}`;
const isBooked = (l: Lead) => l.fee_status === "paid" || isConfirmed(l);

export type AlertInput = {
  leads: Lead[];
  partners: VendorPartner[];
  applications?: VendorApplication[];
  reviews?: Review[];
  today: string; // Chicago day
  now?: number;
};

export function buildAlerts({ leads, partners, applications = [], reviews = [], today, now = Date.now() }: AlertInput): AdminAlert[] {
  const out: AdminAlert[] = [];
  const nowIso = new Date(now).toISOString();
  const people = leads.filter((l) => l.kind !== "partner");

  for (const l of people) {
    const s = stage(l);
    if (s === "lost" || s === "completed" || s === "future_season") continue;
    const ev = l.event_date;
    const parts = partsOf(l);

    // New people waiting on a first reply.
    if (s === "new") {
      const h = hoursSince(l.created_at, now);
      if (h >= 2) {
        out.push({
          id: `new-${l.id}`,
          level: "urgent",
          area: "customers",
          title: `${who(l)} is still waiting on a reply`,
          detail: `${[eventLine(l), ev && prettyDay(ev)].filter(Boolean).join(" · ") || "New request"}. Came in ${Math.round(h)} hours ago.`,
          href: leadHref(l),
          at: l.created_at,
          action: "Call",
        });
      } else {
        out.push({ id: `fresh-${l.id}`, level: "info", area: "customers", title: `New request from ${who(l)}`, detail: eventLine(l) || "Check the lead for details.", href: leadHref(l), at: l.created_at });
      }
    }

    if (l.follow_up_at && l.follow_up_at < today) {
      out.push({ id: `fu-${l.id}`, level: "urgent", area: "customers", title: `Follow-up with ${who(l)} is overdue`, detail: `It was due ${prettyDay(l.follow_up_at)}.`, href: leadHref(l), at: `${l.follow_up_at}T14:00:00Z`, action: "Follow up" });
    }

    // Booked orders that a rental partner hasn't said yes to.
    if (isBooked(l) && ev && ev >= today) {
      if (!parts.length) {
        out.push({ id: `novendor-${l.id}`, level: ev <= addDays(today, 7) ? "urgent" : "decision", area: "vendors", title: `Pick a rental partner for ${who(l)}`, detail: `Booked for ${prettyDay(ev)} with no rental company assigned.`, href: leadHref(l), at: l.fee_paid_at ?? l.created_at, action: "Assign" });
      }
      const allYes = ["vendor_confirmed", "booked"].includes(s);
      for (const p of parts) {
        if (p.answer === "no") {
          out.push({ id: `vno-${l.id}-${p.id}`, level: "urgent", area: "vendors", title: `${vendorName(p.id)} can't do their part of ${who(l)}'s order`, detail: `${prettyDay(ev)}${p.decline_reason ? `. They said: "${p.decline_reason}"` : ""}. Move those items to another rental partner.`, href: `/admin/orders/${l.id}`, at: p.answered_at ?? nowIso, action: "Reassign" });
        } else if (!allYes && p.answer !== "yes" && p.status !== "cancelled" && ev <= addDays(today, 7)) {
          out.push({ id: `vwait-${l.id}-${p.id}`, level: "urgent", area: "vendors", title: `${vendorName(p.id)} hasn't confirmed ${who(l)}'s order`, detail: `The event is ${prettyDay(ev)}. Call them for a written yes.`, href: `/admin/orders/${l.id}`, at: l.fee_paid_at ?? l.created_at, action: "Call" });
        }
      }
    }

    // Close dates that aren't booked yet.
    if (!isBooked(l) && ev && ev >= today && ev <= addDays(today, 10) && s !== "new") {
      out.push({ id: `close-${l.id}`, level: "decision", area: "customers", title: `${who(l)}'s event is ${prettyDay(ev)} and not booked`, detail: "Call to lock it in, or mark it lost.", href: leadHref(l), at: `${addDays(ev, -10)}T14:00:00Z`, action: "Call" });
    }

    // A priced quote with no proposal yet.
    if ((l.quote_subtotal ?? 0) > 0 && !l.proposal_token && ["contacted", "consult_booked"].includes(s)) {
      out.push({ id: `prop-${l.id}`, level: "decision", area: "customers", title: `Send ${who(l)} a proposal`, detail: `They have a ${money0(l.quote_subtotal)} quote and no proposal yet.`, href: `/admin/leads/${l.id}/quote`, at: l.updated_at ?? l.created_at, action: "Review" });
    }

    // Proposals that sit unpaid.
    if (l.proposal_token && (l.fee_status ?? "unpaid") === "unpaid" && l.proposal_created_at && hoursSince(l.proposal_created_at, now) > 24 * 5) {
      out.push({ id: `unpaid-${l.id}`, level: "decision", area: "money", title: `${who(l)} hasn't paid the deposit`, detail: `Proposal sent ${prettyDay(l.proposal_created_at.slice(0, 10))}${l.fee_amount ? `, ${money0(l.fee_amount)}` : ""}. Follow up or mark it lost.`, href: "/admin/proposals", at: l.proposal_created_at, action: "Review" });
    }

    // Heads-ups and things that went through on their own.
    if (ev === addDays(today, 1)) {
      out.push({ id: `tmrw-${l.id}`, level: "info", area: "events", title: `${who(l)}'s ${(l.event_type ?? "event").toLowerCase()} is tomorrow`, detail: [l.venue, l.city, l.assigned_vendor && vendorName(l.assigned_vendor)].filter(Boolean).join(" · ") || eventLine(l), href: leadHref(l), at: `${today}T12:00:00Z` });
    }
    if (l.fee_status === "paid" && l.fee_paid_at && hoursSince(l.fee_paid_at, now) < 48) {
      out.push({ id: `paid-${l.id}`, level: "done", area: "money", title: `${who(l)} paid the ${money0(l.fee_amount)} deposit`, detail: ev ? `Event ${prettyDay(ev)}.` : "Booked.", href: leadHref(l), at: l.fee_paid_at });
    }
    for (const p of parts) {
      if (p.answer === "yes" && p.answered_at && hoursSince(p.answered_at, now) < 48) {
        out.push({ id: `vyes-${l.id}-${p.id}`, level: "done", area: "vendors", title: `${vendorName(p.id)} confirmed their part of ${who(l)}'s order`, detail: ev ? prettyDay(ev) : "", href: `/admin/orders/${l.id}`, at: p.answered_at });
      }
    }
  }

  // Emails the site sent by itself in the last day (logged on the lead by the cron jobs).
  for (const l of people) {
    for (const a of l.activity ?? []) {
      if (a.type === "email" && a.text.startsWith("Sent automatically") && hoursSince(a.at, now) < 24) {
        out.push({ id: `auto-${l.id}-${a.at}`, level: "done", area: "customers", title: `Email sent to ${who(l)}`, detail: a.text.replace(/^Sent automatically:\s*/, ""), href: leadHref(l), at: a.at });
      }
    }
  }

  // Trucks in the next two days: stops with no time window, and days over the daily limit.
  const soon = buildStops(people).filter((x) => x.day >= today && x.day <= addDays(today, 2));
  for (const x of soon) {
    if (!x.window && x.vendorId) {
      out.push({ id: `nowin-${x.id}`, level: "decision", area: "events", title: `Get a ${x.kind === "delivery" ? "drop-off" : "pickup"} time from ${x.vendorName}`, detail: `${who(x.lead)} · ${prettyDay(x.day)} · ${x.address || "no address yet"}. Tell the customer the window.`, href: `/admin/deliveries?day=${x.day}`, at: x.lead.fee_paid_at ?? x.lead.created_at, action: "Call" });
    }
  }
  const limit = eventsPerDay();
  for (const day of new Set(soon.map((x) => x.day))) {
    const n = soon.filter((x) => x.day === day && x.kind === "delivery").length;
    if (n > limit) {
      out.push({ id: `busy-${day}`, level: "info", area: "events", title: `${n} drop-offs on ${prettyDay(day)}`, detail: `More than your ${limit}-a-day limit. Check every rental partner has the truck time.`, href: `/admin/deliveries?day=${day}`, at: nowIso });
    }
  }

  // Rental companies asking to join.
  for (const a of applications) {
    if (a.status === "submitted") {
      out.push({ id: `app-${a.id}`, level: "decision", area: "vendors", title: `Approve or decline ${a.company}`, detail: "A rental company filled in the partner sign-up.", href: `/admin/applications/${a.id}`, at: a.created_at, action: "Approve" });
    }
  }
  for (const l of leads.filter((x) => x.kind === "partner" && stage(x) === "new")) {
    out.push({ id: `papp-${l.id}`, level: "decision", area: "vendors", title: `Reply to ${who(l)} about partnering`, detail: "Short partner form from the website.", href: leadHref(l), at: l.created_at, action: "Review" });
  }

  // Reviews waiting to go live.
  for (const r of reviews.filter((x) => x.status === "pending")) {
    out.push({ id: `rev-${r.id}`, level: "decision", area: "site", title: `Approve a new review`, detail: "A customer left a review. Approve it to show it on the site.", href: "/admin/reviews", at: r.created_at, action: "Approve" });
  }

  // Commission statements ready to send (month is over, nothing sent yet).
  const month = today.slice(0, 7);
  for (const st of statements(leads, partners)) {
    if (st.month >= month || st.commission <= 0) continue;
    const log = partners.find((p) => p.vendor_id === st.vendorId)?.commission_log?.[st.month];
    if (!log?.sent_at && !log?.paid_at) {
      out.push({ id: `stmt-${st.vendorId}-${st.month}`, level: "decision", area: "money", title: `Send ${vendorName(st.vendorId)} their ${st.month} statement`, detail: `${money0(st.commission)} commission on ${st.orders.length} order${st.orders.length === 1 ? "" : "s"}.`, href: "/admin/invoices", at: `${st.month}-28T12:00:00Z`, action: "Review" });
    }
  }

  const rank: Record<AlertLevel, number> = { urgent: 0, decision: 1, info: 2, done: 3 };
  return out.sort((a, b) => rank[a.level] - rank[b.level] || b.at.localeCompare(a.at));
}

export function countAlerts(alerts: AdminAlert[]) {
  const c = { urgent: 0, decision: 0, info: 0, done: 0 } as Record<AlertLevel, number>;
  for (const a of alerts) c[a.level] += 1;
  return { ...c, needYou: c.urgent + c.decision };
}
