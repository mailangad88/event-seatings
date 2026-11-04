import { vendors } from "@/data/vendors";
import { addDays } from "./admin-view";
import type { QuoteLine } from "./catalog-types";
import type { Lead } from "./store";

// One customer's order can be split across several rental partners (chairs from one, linens from another).
// Each partner's share is a "part": the item lines with that vendor_id (lines without one fall back to
// lead.assigned_vendor). What we know about each part is stored on the lead as vendor_orders[vendor_id].
// Pure helpers only, so any page can read them. Links and answers are in lib/vendor-confirm.ts.

export type VendorOrderStatus = "not_sent" | "sent" | "confirmed" | "scheduled" | "delivered" | "picked_up" | "cancelled";

export type VendorOrder = {
  status: VendorOrderStatus;
  delivery_date?: string; // YYYY-MM-DD
  delivery_window?: string;
  pickup_date?: string;
  pickup_window?: string;
  note?: string;
  updated_at?: string;
  // Confirmation link /vendor/confirm/<token> and the partner's answer. A "no" keeps status "sent".
  token?: string;
  sent_at?: string;
  opened_at?: string;
  answered_at?: string;
  answer?: "yes" | "no";
  decline_reason?: string;
  vendor_total?: number; // the partner's final total
  paid_at?: string; // when we paid the partner (or they confirmed the customer paid them)
};
export type VendorOrders = Record<string, VendorOrder>;

// What the admin pages show for a part, worked out from its status, link and answer.
export type PartState = "no_link" | "sent" | "opened" | "declined" | "confirmed" | "delivered" | "picked_up" | "cancelled";

export const partStateLabel: Record<PartState, string> = {
  no_link: "No link yet",
  sent: "Sent, not opened",
  opened: "Opened, no answer",
  declined: "Said no",
  confirmed: "Confirmed",
  delivered: "Delivered",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};

export const partStateBadge: Record<PartState, string> = {
  no_link: "badge",
  sent: "badge-blue",
  opened: "badge-amber",
  declined: "badge-rose",
  confirmed: "badge-green",
  delivered: "badge-green",
  picked_up: "badge-green",
  cancelled: "badge",
};

export function partState(order?: VendorOrder): PartState {
  if (!order) return "no_link";
  switch (order.status) {
    case "cancelled":
      return "cancelled";
    case "picked_up":
      return "picked_up";
    case "delivered":
      return "delivered";
    case "confirmed":
    case "scheduled":
      return "confirmed";
  }
  if (order.answer === "no") return "declined";
  if (!order.token || order.status === "not_sent") return "no_link";
  return order.opened_at ? "opened" : "sent";
}

export const isPartConfirmed = (s: PartState) => s === "confirmed" || s === "delivered" || s === "picked_up";

export type VendorPart = {
  vendorId: string; // "" = lines with no rental partner yet
  vendorName: string;
  lines: { line: QuoteLine; index: number }[]; // index = position in lead.items
  subtotal: number; // what the customer pays for these lines
  cost: number; // what the rental partner charges us at their list price
  order?: VendorOrder;
  state: PartState;
};

export const vendorName = (id?: string) => (id ? vendors.find((v) => v.id === id)?.name ?? id : "No rental partner yet");

// The rental partners on an order, in the order their first line appears. With no items, the assigned partner.
export function vendorParts(lead: Lead): VendorPart[] {
  const orders = lead.vendor_orders ?? {};
  const groups = new Map<string, VendorPart["lines"]>();
  (lead.items ?? []).forEach((line, index) => {
    const id = line.vendor_id || lead.assigned_vendor || "";
    groups.set(id, [...(groups.get(id) ?? []), { line, index }]);
  });
  if (!groups.size && lead.assigned_vendor) groups.set(lead.assigned_vendor, []);
  return [...groups].map(([vendorId, lines]) => {
    const order = vendorId ? orders[vendorId] : undefined;
    // A part that was cancelled and later got lines again starts over.
    const live = order?.status === "cancelled" ? undefined : order;
    return {
      vendorId,
      vendorName: vendorName(vendorId),
      lines,
      subtotal: lines.reduce((s, { line }) => s + line.line_total, 0),
      cost: lines.reduce((s, { line }) => s + line.vendor_price * line.qty, 0),
      order: live,
      state: partState(live),
    };
  });
}

// Every part has a rental partner and every one said yes.
export function allPartsConfirmed(lead: Lead) {
  const parts = vendorParts(lead);
  return parts.length > 0 && parts.every((p) => p.vendorId && isPartConfirmed(p.state));
}

// Orders that need rental partners to confirm: the booking fee is paid, or the order is with a rental partner.
// Past events and lost or completed orders drop off.
export function needsConfirmation(l: Lead, today: string) {
  if (l.kind === "partner" || ["lost", "completed"].includes(l.status ?? "new")) return false;
  if (l.event_date && l.event_date < addDays(today, -1)) return false;
  return l.fee_status === "paid" || (!!(l.assigned_vendor || l.items?.length) && ["booked", "vendor_confirmed", "quote_sent"].includes(l.status ?? "new"));
}

// The part isn't confirmed yet and the event is a week away or closer.
export function partUrgent(l: Lead, part: VendorPart, today: string) {
  if (isPartConfirmed(part.state)) return false;
  return !!l.event_date && l.event_date >= today && l.event_date <= addDays(today, 7);
}
