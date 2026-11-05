import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { SAMPLE_EMAIL, getSession } from "./account-auth";
import { amountDue, chargeLabel } from "./payments";
import { vendorParts, type VendorOrderStatus } from "./orders";
import { getAccount, listLeadsByEmail, type CustomerAccount, type Lead, type LeadMessage } from "./store";
import { sampleAccount, sampleLeads } from "./account-sample";

// Everything the renter's account shows, built from their leads (same email). Only customer-safe fields
// leave this file: no supplier name, supplier cost, lead score, visitor journey or internal notes.
// An order may arrive in more than one delivery; the customer sees each delivery, never who fills it.

export type PartStatus = { label: string; tone: "amber" | "green" | "blue" | "rose" | "plain"; step: number };

const partStatus: Record<VendorOrderStatus, PartStatus> = {
  not_sent: { label: "Checking availability", tone: "amber", step: 0 },
  sent: { label: "Confirming your date", tone: "amber", step: 0 },
  confirmed: { label: "Confirmed", tone: "green", step: 1 },
  scheduled: { label: "Delivery booked", tone: "blue", step: 2 },
  delivered: { label: "Delivered", tone: "green", step: 3 },
  picked_up: { label: "Picked up", tone: "plain", step: 4 },
  cancelled: { label: "Cancelled", tone: "rose", step: -1 },
};

export type AccountPart = {
  key: string;
  name: string; // "Delivery 1", "Delivery 2"; the supplier is never shown
  revealed: boolean;
  phone?: string;
  website?: string;
  status: PartStatus;
  delivery?: { date?: string; window?: string };
  pickup?: { date?: string; window?: string };
  note?: string;
  lines: { name: string; qty: number; unit: string; each: number; total: number; variant?: string }[];
  total: number; // what the renter sees for this part (prices include our fee)
  rentalPrice: number; // this delivery's items at our prices
};

export const eventStages = ["Request received", "Quote ready", "Booking secured", "Rentals confirmed", "Delivered", "All done"] as const;

export type NeedsYou = { id: string; text: string; detail: string; href: string; action: string; tone: "wine" | "amber" | "blue" };

export type AccountEvent = {
  id: string;
  title: string;
  type?: string;
  date?: string;
  daysLeft?: number;
  guests?: number;
  place?: string;
  createdAt: string;
  stage: number; // index in eventStages
  stageNote: string;
  proposalUrl?: string;
  fee: { status: "unpaid" | "paid" | "refunded"; amount?: number; label: string; paidAt?: string; due?: number };
  parts: AccountPart[];
  subtotal: number;
  messages: LeadMessage[];
  unread: number;
  needs: NeedsYou[];
};

export type AccountData = { email: string; name?: string; phone?: string; sample: boolean; account?: CustomerAccount; events: AccountEvent[] };

const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/[-_]/g, " ") : undefined);
const today = () => new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime();
const daysTo = (d?: string) => (d ? Math.round((new Date(`${d.slice(0, 10)}T00:00:00`).getTime() - today()) / 864e5) : undefined);

// Leads that are about an event (a quote, call or chat), not a newsletter or vendor sign-up.
const isEventLead = (l: Lead) => l.kind !== "partner" && (l.kind === "quote" || l.kind === "call" || l.kind === "chat" || Boolean(l.items?.length || l.event_date));

function partFor(lead: Lead, paid: boolean, index: number, p: ReturnType<typeof vendorParts>[number]): AccountPart {
  const fallback: VendorOrderStatus = ["vendor_confirmed", "booked"].includes(lead.status ?? "")
    ? "confirmed"
    : lead.status === "completed"
      ? "picked_up"
      : "not_sent";
  const o = p.order;
  return {
    key: `${lead.id}-${index}`,
    name: `Delivery ${index + 1}`,
    revealed: false,
    phone: undefined,
    website: undefined,
    status: partStatus[o?.status ?? fallback] ?? partStatus.not_sent,
    delivery: o?.delivery_date || o?.delivery_window ? { date: o.delivery_date, window: o.delivery_window } : undefined,
    pickup: o?.pickup_date || o?.pickup_window ? { date: o.pickup_date, window: o.pickup_window } : undefined,
    note: o?.note,
    lines: p.lines.map(({ line: l }) => ({ name: l.name, qty: l.qty, unit: l.unit, each: l.unit_price, total: l.line_total, variant: l.variant })),
    total: p.total,
    rentalPrice: p.total,
  };
}

function stageOf(lead: Lead, parts: AccountPart[], paid: boolean) {
  const steps = parts.filter((p) => p.status.step >= 0).map((p) => p.status.step);
  const all = (n: number) => steps.length > 0 && steps.every((s) => s >= n);
  if (lead.status === "completed" || all(4)) return 5;
  if (steps.some((s) => s >= 3)) return 4;
  if (paid && (steps.length ? all(1) : ["vendor_confirmed", "booked"].includes(lead.status ?? ""))) return 3;
  if (paid) return 2;
  if (lead.proposal_token || lead.status === "quote_sent") return 1;
  return 0;
}

const stageNotes = [
  "We have your request and are checking your date.",
  "Your quote is ready. Secure the booking when you're happy with it.",
  "Booking secured. We're confirming every item now.",
  "Every item is confirmed. Delivery times come next.",
  "Your rentals have arrived. Pickup is after the event.",
  "All done. We hope it was a great day.",
];

export function toAccountEvent(lead: Lead): AccountEvent {
  const paid = lead.fee_status === "paid";
  const parts = vendorParts(lead).map((p, i) => partFor(lead, paid, i, p));
  const stage = stageOf(lead, parts, paid);
  const messages = lead.messages ?? [];
  const unread = messages.filter((m) => m.from === "team" && !m.read_at).length;
  const type = cap(lead.event_type);
  const days = daysTo(lead.event_date);
  const proposalUrl = lead.proposal_token ? `/proposal/${lead.proposal_token}` : undefined;
  const due = paid ? undefined : lead.fee_amount ?? (lead.items?.length ? amountDue(lead) : undefined);

  const needs: NeedsYou[] = [];
  if (proposalUrl && !paid && lead.fee_status !== "refunded")
    needs.push({ id: "pay", text: "Secure your booking", detail: "Your quote is ready. Paying the deposit holds your date.", href: proposalUrl, action: "Review quote", tone: "wine" });
  if (unread)
    needs.push({ id: "msg", text: unread === 1 ? "New message from us" : `${unread} new messages from us`, detail: "Read and reply in your event.", href: `/account/events/${lead.id}#messages`, action: "Read", tone: "blue" });
  if (!lead.event_date)
    needs.push({ id: "date", text: "Add your event date", detail: "We can't check availability without it.", href: `/account/events/${lead.id}#messages`, action: "Send date", tone: "amber" });
  else if (!lead.venue && (days ?? 99) <= 30 && stage < 5)
    needs.push({ id: "address", text: "Send the delivery address", detail: "We need it to plan the truck.", href: `/account/events/${lead.id}#messages`, action: "Send address", tone: "amber" });

  return {
    id: lead.id,
    title: type ?? "Your event",
    type,
    date: lead.event_date?.slice(0, 10),
    daysLeft: days,
    guests: lead.guest_count,
    place: lead.venue ?? lead.city,
    createdAt: lead.created_at,
    stage,
    stageNote: stageNotes[stage],
    proposalUrl,
    fee: { status: lead.fee_status ?? "unpaid", amount: lead.fee_amount, label: chargeLabel(), paidAt: lead.fee_paid_at, due },
    parts,
    subtotal: lead.quote_subtotal ?? parts.reduce((s, p) => s + p.total, 0),
    messages,
    unread,
    needs,
  };
}

// Upcoming events first (soonest first), then undated, then past ones (most recent first).
function byWhen(a: AccountEvent, b: AccountEvent) {
  const rank = (e: AccountEvent) => (e.daysLeft === undefined ? 1 : e.daysLeft >= 0 ? 0 : 2);
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  if (ra === 0) return (a.daysLeft ?? 0) - (b.daysLeft ?? 0);
  if (ra === 2) return (b.daysLeft ?? 0) - (a.daysLeft ?? 0);
  return b.createdAt.localeCompare(a.createdAt);
}

// The sample has no real proposal page, so its quote links point at the event page.
const sampleLinks = (e: AccountEvent): AccountEvent => {
  const url = `/account/events/${e.id}`;
  return { ...e, proposalUrl: e.proposalUrl && url, needs: e.needs.map((n) => (n.id === "pay" ? { ...n, href: url } : n)) };
};

export async function loadAccount(email: string): Promise<AccountData> {
  if (email === SAMPLE_EMAIL) {
    const account = sampleAccount();
    return { email, name: account.name, phone: account.phone, sample: true, account, events: sampleLeads().map(toAccountEvent).map(sampleLinks).sort(byWhen) };
  }
  const [leads, account] = await Promise.all([listLeadsByEmail(email), getAccount(email).catch(() => undefined)]);
  const named = leads.find((l) => l.name);
  return {
    email,
    name: account?.name ?? named?.name,
    phone: account?.phone ?? leads.find((l) => l.phone)?.phone,
    sample: false,
    account,
    events: leads.filter(isEventLead).map(toAccountEvent).sort(byWhen),
  };
}

export const firstName = (name?: string) => name?.trim().split(/\s+/)[0];

export const fmtDay = (d?: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", opts) : undefined;

// The signed-in renter's data, loaded once per request (the layout and the page both use it).
export const currentAccount = cache(async (): Promise<AccountData | null> => {
  const s = await getSession();
  return s ? loadAccount(s.email) : null;
});

export const nextEvent = (events: AccountEvent[]) => events.find((e) => (e.daysLeft ?? -1) >= 0 && e.stage < 5);

// Same session check as the layout, but every page calls it too: Next.js can render a page
// before its layout's redirect takes effect, so a page can't just trust the layout ran first.
export async function requireAccount(): Promise<AccountData> {
  const data = await currentAccount();
  if (!data) redirect("/account/sign-in");
  return data;
}
