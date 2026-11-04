import "server-only";
import { randomBytes } from "crypto";
import { vendors } from "@/data/vendors";
import { sendAlert } from "./alerts";
import { money2, prettyDay } from "./admin-view";
import { sendEmail } from "./notify";
import { allPartsConfirmed, vendorName, vendorParts, type VendorOrder, type VendorPart } from "./orders";
import { site } from "./site";
import { listLeads, updateLead, type Lead, type LeadActivity, type LeadPatch } from "./store";

// Confirmation links for rental partners. Each part of an order (lib/orders.ts) gets its own link,
// /vendor/confirm/<token>, where that partner sees only their lines and answers yes (delivery and pickup
// windows and their final total) or no (with a reason). The random token in the link is the key.

export type { VendorOrder, VendorOrders, VendorOrderStatus, VendorPart, PartState } from "./orders";

export const vendorConfirmUrl = (token: string) => `${site.url}/vendor/confirm/${token}`;
const newToken = () => randomBytes(16).toString("hex");
const now = () => new Date().toISOString();

// Email to the owner (NOTIFY_EMAIL). Skipped quietly when email isn't set up.
const notify = (subject: string, text: string) => {
  const to = process.env.NOTIFY_EMAIL;
  return to ? sendEmail({ to, subject, text }) : Promise.resolve(false);
};

// Email draft to one rental partner with their link (or a plain order when there is no link yet).
export function partEmail(lead: Lead, part: VendorPart, to?: string) {
  const date = prettyDay(lead.event_date, { weekday: "long", month: "long", day: "numeric" }) || "a date to be set";
  const token = part.order?.token;
  const ask = token
    ? `You can see the full list and answer yes or no here:\n${vendorConfirmUrl(token)}\n\nIt takes a minute: add your delivery and pickup windows and your final total.`
    : "Please reply with delivery and pickup times and your final total.";
  const list = part.lines.map(({ line }) => `${line.qty} x ${line.name}${line.variant ? ` (${line.variant})` : ""}`).join("\n");
  return {
    to,
    subject: `Please confirm: order for ${prettyDay(lead.event_date) || "an upcoming event"}, ${lead.name ?? lead.email}`,
    body: `Hi,\n\nWe have an order for you on ${date}.\n\n${list ? `${list}\n\n` : ""}${ask}\n\nThanks,\n${site.name}\n${site.phone ?? ""}`.trim(),
  };
}

async function savePart(lead: Lead, vendorId: string, order: VendorOrder, log: Omit<LeadActivity, "at">[], extra: LeadPatch = {}) {
  const vendor_orders = { ...(lead.vendor_orders ?? {}), [vendorId]: { ...order, updated_at: now() } };
  await updateLead(lead.id, { vendor_orders, ...extra }, log);
  lead.vendor_orders = vendor_orders;
}

// Makes the link for one part, or returns the one it has. A part that said no, or was cancelled, gets a fresh link.
export async function ensurePartLink(lead: Lead, vendorId: string): Promise<VendorOrder | undefined> {
  if (!vendorId || !vendors.some((v) => v.id === vendorId)) return undefined;
  const existing = lead.vendor_orders?.[vendorId];
  if (existing?.token && existing.answer !== "no" && existing.status !== "cancelled") {
    if (existing.status !== "not_sent") return existing;
    const sent: VendorOrder = { ...existing, status: "sent", sent_at: now() };
    await savePart(lead, vendorId, sent, []);
    return sent;
  }
  const order: VendorOrder = { status: "sent", token: newToken(), sent_at: now(), paid_at: existing?.paid_at };
  await savePart(lead, vendorId, order, [{ type: "vendor", text: `Order confirmation link made for ${vendorName(vendorId)}` }]);
  return order;
}

// Looks up the part behind a confirmation link. Tokens are random 32-character strings.
export async function getPartByToken(token: string): Promise<{ lead: Lead; vendorId: string; order: VendorOrder; part?: VendorPart } | undefined> {
  if (!/^[a-f0-9]{32}$/.test(token)) return undefined;
  for (const lead of await listLeads()) {
    const hit = Object.entries(lead.vendor_orders ?? {}).find(([, o]) => o?.token === token);
    if (hit) return { lead, vendorId: hit[0], order: hit[1], part: vendorParts(lead).find((p) => p.vendorId === hit[0] && p.lines.length > 0) };
  }
  return undefined;
}

// First view of the link, noted once so /admin/orders shows "Opened".
export async function markPartOpened(lead: Lead, vendorId: string) {
  const o = lead.vendor_orders?.[vendorId];
  if (!o || o.opened_at || o.answer || o.status === "cancelled") return;
  await savePart(lead, vendorId, { ...o, opened_at: now() }, [{ type: "vendor", text: `${vendorName(vendorId)} opened the order confirmation link` }]);
}

export type PartAnswer =
  | { answer: "yes"; delivery_date?: string; delivery_window: string; pickup_date?: string; pickup_window: string; vendor_total?: number; note?: string }
  | { answer: "no"; reason: string };

// Saves a rental partner's answer. When every part has said yes, the order moves to Vendor confirmed.
// A no alerts the owner. Returns false when the link was already answered, cancelled, or has no lines.
export async function recordPartAnswer(token: string, a: PartAnswer): Promise<boolean> {
  const found = await getPartByToken(token);
  if (!found?.part) return false;
  const { lead, vendorId, order: o } = found;
  if (o.answer || o.status === "cancelled") return false;
  const at = now();
  const who = vendorName(vendorId);
  const customer = lead.name || lead.email;
  const when = prettyDay(lead.event_date) || "no date yet";
  const orderUrl = `${site.url}/admin/orders/${lead.id}`;

  if (a.answer === "yes") {
    const next: VendorOrder = {
      ...o,
      status: "confirmed",
      opened_at: o.opened_at ?? at,
      answered_at: at,
      answer: "yes",
      delivery_date: a.delivery_date,
      delivery_window: a.delivery_window,
      pickup_date: a.pickup_date,
      pickup_window: a.pickup_window,
      vendor_total: a.vendor_total,
      note: a.note,
    };
    const everyone = allPartsConfirmed({ ...lead, vendor_orders: { ...(lead.vendor_orders ?? {}), [vendorId]: next } });
    const moveStage = everyone && !["vendor_confirmed", "booked", "completed"].includes(lead.status ?? "new");
    const day = (d?: string) => (d ? `${prettyDay(d)} ` : "");
    const details = [
      `delivery ${day(a.delivery_date)}${a.delivery_window}`,
      `pickup ${day(a.pickup_date)}${a.pickup_window}`,
      a.vendor_total !== undefined && `total ${money2(a.vendor_total)}`,
      a.note && `note: ${a.note}`,
    ].filter(Boolean).join(", ");
    const log: Omit<LeadActivity, "at">[] = [{ type: "vendor", text: `${who} confirmed their part: ${details}` }];
    if (moveStage) log.push({ type: "status", text: "Stage: every rental partner said yes, moved to Vendor confirmed" });
    await savePart(lead, vendorId, next, log, {
      tasks_done: { ...(lead.tasks_done ?? {}), [`vendor-confirm:${vendorId}`]: at },
      ...(moveStage ? { status: "vendor_confirmed" as const } : {}),
    });
    await notify(
      `${who} confirmed: ${customer}, ${when}`,
      `${who} said yes to their part of the order for ${customer} (${when}).\n\n${details}\n\n${everyone ? "Every rental partner on this order has now said yes." : "Still waiting on the other rental partners on this order."}\n\n${orderUrl}`,
    );
    return true;
  }

  await savePart(lead, vendorId, { ...o, status: "sent", opened_at: o.opened_at ?? at, answered_at: at, answer: "no", decline_reason: a.reason }, [
    { type: "vendor", text: `${who} can't do their part: ${a.reason}` },
  ]);
  await Promise.all([
    notify(
      `Action needed: ${who} can't do ${customer}, ${when}`,
      `${who} can't do their part of the order for ${customer} (${when}).\n\nReason: ${a.reason}\n\nMove their items to another rental partner: ${orderUrl}`,
    ),
    sendAlert("Rental partner said no to an order", { customer, event: when, vendor: who, reason: a.reason, order: orderUrl }),
  ]);
  return true;
}

export type PartMark = "delivered" | "picked_up" | "paid";

// Admin marks on one part: delivered and picked up set the status; paid sets paid_at. `on` false undoes it.
export async function markPart(lead: Lead, vendorId: string, mark: PartMark, on: boolean) {
  const o: VendorOrder = lead.vendor_orders?.[vendorId] ?? { status: "not_sent" };
  let next: VendorOrder;
  if (mark === "paid") next = { ...o, paid_at: on ? now() : undefined };
  else if (on) next = { ...o, status: mark };
  else next = { ...o, status: mark === "picked_up" ? "delivered" : o.answer === "yes" ? "confirmed" : o.token ? "sent" : "not_sent" };
  const label = mark === "picked_up" ? "picked up" : mark;
  await savePart(lead, vendorId, next, [{ type: "vendor", text: `${vendorName(vendorId)}: ${on ? "marked" : "unmarked"} ${label}` }]);
}

// Moves one item line to another rental partner. The price stays as it was, so the log asks to recheck it.
// A partner that already said yes has a different list now, so their part goes back to "not sent".
// A partner left with no lines is cancelled.
export async function moveLine(lead: Lead, index: number, lineId: string, toVendor: string) {
  const items = [...(lead.items ?? [])];
  const line = items[index];
  if (!line || line.id !== lineId || !vendors.some((v) => v.id === toVendor)) return false;
  const from = line.vendor_id || lead.assigned_vendor || "";
  if (from === toVendor) return false;
  items[index] = { ...line, vendor_id: toVendor };
  const log: Omit<LeadActivity, "at">[] = [
    { type: "vendor", text: `Moved ${line.qty} x ${line.name} from ${vendorName(from)} to ${vendorName(toVendor)}. Price kept at ${money2(line.vendor_price)} each: check it with ${vendorName(toVendor)}.` },
  ];
  const orders = { ...(lead.vendor_orders ?? {}) };
  const after = vendorParts({ ...lead, items });
  const at = now();
  for (const id of [from, toVendor]) {
    const o = orders[id];
    if (!id || !o) continue;
    if (!after.some((p) => p.vendorId === id)) {
      orders[id] = { ...o, status: "cancelled", updated_at: at };
      log.push({ type: "vendor", text: `${vendorName(id)} has nothing left on this order: their part is cancelled` });
    } else if (o.answer) {
      orders[id] = { status: "not_sent", token: newToken(), paid_at: o.paid_at, updated_at: at };
      log.push({ type: "vendor", text: `${vendorName(id)}'s list changed: send them the new confirmation link` });
    }
  }
  const patch: LeadPatch = { items, vendor_orders: orders };
  if (lead.status === "vendor_confirmed") {
    patch.status = "booked";
    log.push({ type: "status", text: "Stage: Vendor confirmed → Booked until the changed lists are confirmed again" });
  }
  await updateLead(lead.id, patch, log);
  return true;
}
