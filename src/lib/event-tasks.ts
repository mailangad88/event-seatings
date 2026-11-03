import { vendors } from "@/data/catalog";
import { site } from "./site";
import type { Lead, VendorPartner } from "./store";
import { addDays, isConfirmed, prettyDay, stage } from "./admin-view";

// The to-do list behind /admin (Today and This week): every call, email and vendor check an event needs,
// worked out from each lead's stage and dates. Nothing here sends anything. Emails come as ready-to-send
// drafts (mailto links) until automatic sending is switched on.
//
// Ticking a task off stores its key in lead.tasks_done, so it never comes back.

export type TaskKind = "call" | "email" | "vendor" | "check";
export type EventTask = {
  key: string; // stable per lead, e.g. "t-7-call"
  lead: Lead;
  due: string; // YYYY-MM-DD
  kind: TaskKind;
  who: "customer" | "vendor" | "you";
  title: string;
  detail: string;
  // A draft the owner can open in their mail app.
  email?: { to?: string; subject: string; body: string };
  phone?: string;
};

export const kindLabel: Record<TaskKind, string> = { call: "Call", email: "Email", vendor: "Rental partner", check: "Check" };

const firstName = (l: Lead) => l.name?.trim().split(/\s+/)[0] ?? "";
const hi = (l: Lead) => (firstName(l) ? `Hi ${firstName(l)},` : "Hi,");
const what = (l: Lead) => (l.event_type ?? "event").toLowerCase();
const where = (l: Lead) => [l.venue, l.city].filter(Boolean).join(", ") || "the address on your order";
const sign = `Thanks,\n${site.name}\n${site.phone ?? ""}`.trim();

export const mailto = (e: NonNullable<EventTask["email"]>) =>
  `mailto:${e.to ?? ""}?subject=${encodeURIComponent(e.subject)}&body=${encodeURIComponent(e.body)}`;

// Booked = the customer paid the booking fee, or a rental partner has the order.
const isBooked = (l: Lead) => l.fee_status === "paid" || isConfirmed(l);

export function tasksFor(l: Lead, partners: Map<string, VendorPartner>, today: string): EventTask[] {
  if (l.kind === "partner" || ["lost", "future_season", "completed"].includes(stage(l))) return [];
  // Old events drop off the list two weeks after the date.
  if (l.event_date && l.event_date < addDays(today, -14)) return [];
  const out: EventTask[] = [];
  const done = l.tasks_done ?? {};
  const add = (t: Omit<EventTask, "lead">) => {
    if (!done[t.key]) out.push({ ...t, lead: l });
  };
  const vendor = vendors.find((v) => v.id === l.assigned_vendor);
  const partner = l.assigned_vendor ? partners.get(l.assigned_vendor) : undefined;
  const vendorName = vendor?.name ?? "the rental partner";
  const vendorEmail = partner?.contact_email;
  const vendorPhone = partner?.contact_phone ?? vendor?.phone;
  const ev = l.event_date;
  const date = prettyDay(ev, { weekday: "long", month: "long", day: "numeric" });

  // Before booking: nudge proposals that sit unpaid, and dates that are close with nothing booked.
  if (!isBooked(l)) {
    if (l.proposal_token && (l.fee_status ?? "unpaid") === "unpaid" && l.proposal_created_at) {
      add({
        key: "proposal-check-in",
        due: addDays(l.proposal_created_at.slice(0, 10), 2),
        kind: "call",
        who: "customer",
        title: "Check in about the proposal",
        detail: "They have the proposal but haven't paid. Ask if anything on the list should change.",
        phone: l.phone,
        email: { to: l.email, subject: `Your ${what(l)} rental proposal`, body: `${hi(l)}\n\nJust checking you got the proposal for your ${what(l)}${ev ? ` on ${date}` : ""}. Happy to change anything on the list, or hold the date for you.\n\n${sign}` },
      });
    }
    if (ev && ev >= today && ev <= addDays(today, 14) && stage(l) !== "new") {
      add({
        key: "close-date-unbooked",
        due: addDays(ev, -14) < today ? today : addDays(ev, -14),
        kind: "call",
        who: "customer",
        title: "Event is close and not booked",
        detail: `The ${what(l)} is ${date}. Rental stock runs out close to the date, so call and ask if they want to lock it in.`,
        phone: l.phone,
      });
    }
    return out;
  }

  // Booked: confirm with the vendor first, then the run-up to the event and the wrap-up after.
  const paidDay = l.fee_paid_at?.slice(0, 10) ?? today;
  if (!l.assigned_vendor) {
    add({ key: "assign-vendor", due: paidDay, kind: "vendor", who: "you", title: "Pick a rental partner", detail: "The fee is paid but no rental partner is assigned. Assign one on the lead so the customer sees who is delivering." });
  }
  if (!["vendor_confirmed", "booked", "completed"].includes(stage(l))) {
    add({
      key: "vendor-confirm",
      due: paidDay,
      kind: "vendor",
      who: "vendor",
      title: `Get ${vendorName} to confirm the order`,
      detail: "Send the order, get a written yes with delivery and pickup times, then move the lead to Vendor confirmed.",
      phone: vendorPhone,
      email: { to: vendorEmail, subject: `Order for ${ev ? prettyDay(ev) : "an upcoming event"}: ${l.name ?? l.email}`, body: `Hi,\n\nCan you confirm this order?\n\nEvent: ${l.event_type ?? "Event"} on ${date || "TBD"}\nLocation: ${where(l)}\nGuests: ${l.guest_count ?? "TBD"}\n\n${(l.items ?? []).map((i) => `${i.qty} x ${i.name}`).join("\n")}\n\nPlease reply with delivery and pickup times and your final total.\n\n${sign}` },
    });
  }
  if (!ev) return out;

  if (addDays(ev, -14) > paidDay) {
    add({
      key: "t-14-email",
      due: addDays(ev, -14),
      kind: "email",
      who: "customer",
      title: "Two weeks out: check the details",
      detail: "Ask for the final guest count, the delivery address and where things should be set up.",
      email: { to: l.email, subject: `Two weeks to your ${what(l)}: a few quick details`, body: `${hi(l)}\n\nYour ${what(l)} is two weeks away (${date}). To keep the delivery on track, can you reply with:\n\n1. Your final guest count\n2. The delivery address and any gate or parking notes\n3. Where you want things set up, and who will be there to meet the truck\n\n${sign}` },
    });
  }
  add({
    key: "t-7-call",
    due: addDays(ev, -7),
    kind: "call",
    who: "customer",
    title: "One week out: reminder call",
    detail: "Confirm the headcount, the delivery window and the setup spot. Note any changes for the rental partner.",
    phone: l.phone,
  });
  add({
    key: "t-3-vendor",
    due: addDays(ev, -3),
    kind: "vendor",
    who: "vendor",
    title: `Send final details to ${vendorName}`,
    detail: "Final count, address, delivery window and an on-site contact. Ask them to reply to confirm.",
    phone: vendorPhone,
    email: { to: vendorEmail, subject: `Final details: ${l.name ?? l.email}, ${prettyDay(ev)}`, body: `Hi,\n\nFinal details for ${date}:\n\nLocation: ${where(l)}\nGuests: ${l.guest_count ?? "TBD"}\nOn-site contact: ${l.name ?? ""} ${l.phone ?? ""}\n\nPlease reply to confirm the delivery window.\n\n${sign}` },
  });
  add({
    key: "t-1-email",
    due: addDays(ev, -1),
    kind: "email",
    who: "customer",
    title: "Day before: what to expect",
    detail: "Delivery window, who to call if the truck is late, and what to do with everything after.",
    email: { to: l.email, subject: `Tomorrow: your ${what(l)} delivery`, body: `${hi(l)}\n\nEverything is set for ${date}. ${vendorName} will deliver to ${where(l)}. If the truck is running late or anything is missing, call us at ${site.phone || "the number on your proposal"}.\n\nAfter the event, stack chairs and tables where they were dropped off and the crew will pick them up.\n\n${sign}` },
  });
  add({
    key: "t0-check",
    due: ev,
    kind: "check",
    who: "you",
    title: "Event day",
    detail: "Keep your phone on. If delivery hasn't shown up by the start of the window, call the rental partner.",
    phone: vendorPhone,
  });
  add({
    key: "t+1-thanks",
    due: addDays(ev, 1),
    kind: "email",
    who: "customer",
    title: "Thank you and review request",
    detail: "Thank them and ask for a short review. Then move the lead to Completed.",
    email: { to: l.email, subject: `Thanks for booking with ${site.name}`, body: `${hi(l)}\n\nThanks for letting us help with your ${what(l)}. If you have a minute, a short review helps other Chicago hosts find us: ${site.url}/reviews/write\n\nIf anything went wrong with the rentals, reply here and we'll sort it out with the rental company.\n\n${sign}` },
  });
  add({
    key: "t+2-vendor",
    due: addDays(ev, 2),
    kind: "vendor",
    who: "vendor",
    title: `Check pickup with ${vendorName}`,
    detail: "Make sure everything came back and ask about any damage or missing pieces before they bill the customer.",
    phone: vendorPhone,
  });
  return out;
}

export function allTasks(leads: Lead[], partners: VendorPartner[], today: string) {
  const map = new Map(partners.map((p) => [p.vendor_id, p]));
  return leads.flatMap((l) => tasksFor(l, map, today)).sort((a, b) => a.due.localeCompare(b.due) || a.key.localeCompare(b.key));
}
