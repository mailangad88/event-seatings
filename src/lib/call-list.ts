import { vendors } from "@/data/catalog";
import { site } from "./site";
import type { Lead, VendorPartner } from "./store";
import { chicagoDay, prettyDay, stage } from "./admin-view";
import { allTasks } from "./event-tasks";

// Today's call list behind /admin/calls: who to phone, why, and what to say. Pure, so the Today page can show a count.
//
// Order: new customers who left a number and haven't heard from us, then follow-ups due today or overdue, then
// event calls from lib/event-tasks.ts (customer calls first, rental partner calls last).
// Anyone with a call logged today drops off until tomorrow, so the list gets shorter as you work through it.

export type CallKind = "new" | "follow_up" | "task" | "vendor";
// yes = ticked "OK to call"; asked = didn't tick it but asked for a call or a quote; no = neither; business = a rental partner.
export type CallConsent = "yes" | "asked" | "no" | "business";

export type CallRow = {
  id: string; // stable per row: `${lead.id}:${kind}[:${taskKey}]`
  lead: Lead;
  kind: CallKind;
  who: string; // the person or company to ask for
  reason: string; // why the call is due, one line
  script: string[]; // 2-3 short lines to say
  phone?: string;
  priority: number; // 1 = call first
  consent: CallConsent;
  taskKey?: string; // event task this call ticks off when you reach them
  taskTitle?: string;
  overdueSince?: string; // YYYY-MM-DD, when the call was due before today
};

export const callOutcomes = [
  { id: "reached", label: "Reached" },
  { id: "voicemail", label: "Left voicemail" },
  { id: "no_answer", label: "No answer" },
  { id: "wrong_number", label: "Wrong number" },
] as const;
export type CallOutcome = (typeof callOutcomes)[number]["id"];
export const isCallOutcome = (s: unknown): s is CallOutcome => callOutcomes.some((o) => o.id === s);

// Text written to the lead's timeline for a logged call. Rental partner calls start with "Rental partner call" so
// they don't take the customer off the list.
export function callLogText(kind: CallKind, outcome: CallOutcome, title = "") {
  const label = callOutcomes.find((o) => o.id === outcome)?.label ?? outcome;
  return kind === "vendor" ? `Rental partner call (${title}): ${label}` : `Call${title ? ` (${title})` : ""}: ${label}`;
}

export const callTitles: Record<"new" | "follow_up", string> = { new: "First call", follow_up: "Follow-up call" };

const firstName = (l: Lead) => l.name?.trim().split(/\s+/)[0] ?? "";
const what = (l: Lead) => (l.event_type ?? "event").toLowerCase();
const on = (l: Lead) => (l.event_date ? ` on ${prettyDay(l.event_date, { weekday: "long", month: "long", day: "numeric" })}` : "");
const hello = (l: Lead) => `Hi${firstName(l) ? ` ${firstName(l)}` : ""}, this is ${site.name}.`;

function consentFor(l: Lead): CallConsent {
  if (l.call_consent) return "yes";
  return l.kind === "call" || l.kind === "quote" ? "asked" : "no";
}

const callsToday = (l: Lead, today: string) =>
  (l.activity ?? []).filter((a) => a.type === "call" && chicagoDay(a.at) === today);

// Last customer call said the number was wrong: don't keep offering it.
function wrongNumber(l: Lead) {
  const last = [...(l.activity ?? [])].reverse().find((a) => a.type === "call" && !a.text.startsWith("Rental partner call"));
  return !!last?.text.endsWith("Wrong number");
}

function newScript(l: Lead) {
  const asked = l.kind === "call" ? "asked us to call" : l.kind === "quote" ? "sent us a quote request" : "got in touch";
  return [
    `${hello(l)} You ${asked} about your ${what(l)}${on(l)}.`,
    "I'd like to check a few details: how many guests, where it is, and what you still need.",
    "If now is a bad time, when is a good time to call back?",
  ];
}

function followUpScript(l: Lead) {
  const sent = l.proposal_token ? "the proposal we sent" : l.quote_subtotal ? "the quote" : "what we talked about";
  return [
    `${hello(l)} I'm following up about your ${what(l)}${on(l)}.`,
    `Did you get a chance to look at ${sent}? Is there anything you want to change?`,
    "If you're ready, I can check the date with the rental company today.",
  ];
}

export function buildCallList(leads: Lead[], partners: VendorPartner[], today: string): CallRow[] {
  const rows: CallRow[] = [];
  const customers = leads.filter((l) => l.kind !== "partner");
  const open = (l: Lead) => !["completed", "lost", "future_season"].includes(stage(l));
  const free = (l: Lead) => callsToday(l, today).every((a) => a.text.startsWith("Rental partner call"));

  // Event calls first (they carry a task to tick off), so a follow-up on the same customer can fold into them.
  const taskRows = new Map<string, CallRow>();
  for (const t of allTasks(customers, partners, today)) {
    if (t.due > today) continue;
    const l = t.lead;
    const base = { lead: l, taskKey: t.key, taskTitle: t.title, overdueSince: t.due < today ? t.due : undefined };
    if (t.kind === "call" && t.who === "customer" && l.phone && free(l) && !wrongNumber(l)) {
      // One customer call per lead: keep the earliest due task.
      if (taskRows.has(l.id)) continue;
      taskRows.set(l.id, {
        ...base,
        id: `${l.id}:task:${t.key}`,
        kind: "task",
        who: l.name || l.email,
        reason: t.title,
        script: [`${hello(l)} I'm calling about your ${what(l)}${on(l)}.`, t.detail, "Is there anything else you need from us before then?"],
        phone: l.phone,
        priority: 3,
        consent: consentFor(l),
      });
    } else if (t.kind === "vendor" && t.who === "vendor" && t.phone) {
      const already = callsToday(l, today).some((a) => a.text.startsWith(`Rental partner call (${t.title})`));
      if (already) continue;
      const vendor = vendors.find((v) => v.id === l.assigned_vendor);
      const contact = partners.find((p) => p.vendor_id === l.assigned_vendor)?.contact_name;
      rows.push({
        ...base,
        id: `${l.id}:vendor:${t.key}`,
        kind: "vendor",
        who: [contact, vendor?.name ?? "Rental partner"].filter(Boolean).join(" at "),
        reason: `Rental partner call: ${t.title}`,
        script: [
          `Hi, this is ${site.name} calling about the order for ${l.name || "our customer"}${on(l)}.`,
          t.detail,
          "Can you send that to us by email too, so we have it in writing?",
        ],
        phone: t.phone,
        priority: 4,
        consent: "business",
      });
    }
  }

  for (const l of customers) {
    if (!open(l) || !l.phone || !free(l) || wrongNumber(l)) continue;
    const isNew = stage(l) === "new";
    const followUpDue = !!l.follow_up_at && l.follow_up_at <= today;
    const task = taskRows.get(l.id);
    if (task) {
      if (followUpDue) task.reason += " (follow-up also due)";
      continue;
    }
    // A new customer we already tried waits for their follow-up date.
    if (isNew && (!l.follow_up_at || followUpDue)) {
      rows.push({
        id: `${l.id}:new`,
        lead: l,
        kind: "new",
        who: l.name || l.email,
        reason: l.kind === "call" ? "Asked for a call and hasn't heard from us" : "New, not contacted yet",
        script: newScript(l),
        phone: l.phone,
        priority: 1,
        consent: consentFor(l),
        overdueSince: chicagoDay(l.created_at) < today ? chicagoDay(l.created_at) : undefined,
      });
    } else if (followUpDue) {
      rows.push({
        id: `${l.id}:follow_up`,
        lead: l,
        kind: "follow_up",
        who: l.name || l.email,
        reason: l.follow_up_at! < today ? `Follow-up was due ${prettyDay(l.follow_up_at)}` : "Follow-up due today",
        script: followUpScript(l),
        phone: l.phone,
        priority: 2,
        consent: consentFor(l),
        overdueSince: l.follow_up_at! < today ? l.follow_up_at : undefined,
      });
    }
  }
  rows.push(...taskRows.values());

  // Priority, then the longest wait first, then whoever wrote in first.
  return rows.sort(
    (a, b) =>
      a.priority - b.priority ||
      (a.overdueSince ?? today).localeCompare(b.overdueSince ?? today) ||
      a.lead.created_at.localeCompare(b.lead.created_at),
  );
}
