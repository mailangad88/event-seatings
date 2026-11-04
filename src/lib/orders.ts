// One customer order can go to several rental companies (chairs from one, tents from another).
// Each company's part is the lines in lead.items with its vendor_id; its progress lives in
// leads.vendor_orders, keyed by vendor_id. Shared by the admin (routing) and the renter account.
import type { QuoteLine } from "./catalog-types";

export const vendorOrderStatuses = ["not_sent", "sent", "confirmed", "scheduled", "delivered", "picked_up", "cancelled"] as const;
export type VendorOrderStatus = (typeof vendorOrderStatuses)[number];
export const isVendorOrderStatus = (s: unknown): s is VendorOrderStatus => vendorOrderStatuses.includes(s as VendorOrderStatus);

export type VendorOrder = {
  status: VendorOrderStatus;
  delivery_date?: string; // YYYY-MM-DD
  delivery_window?: string; // "8–10am"
  pickup_date?: string;
  pickup_window?: string;
  note?: string; // shown to the customer
  updated_at?: string;
  // Vendor confirmation link (admin side).
  token?: string;
  sent_at?: string;
  opened_at?: string;
  answered_at?: string;
  answer?: "yes" | "no";
  decline_reason?: string;
  vendor_total?: number; // what this company charges for its part, USD
  paid_at?: string;
};

type OrderLead = { items?: QuoteLine[]; assigned_vendor?: string; vendor_orders?: Record<string, VendorOrder> };

export type VendorPart = { vendorId: string; lines: QuoteLine[]; total: number; cost: number; order?: VendorOrder };

// Groups the lead's lines by rental company, in the order each company first appears.
// Lines with no vendor_id fall back to the lead's assigned_vendor (or "unassigned").
export function vendorParts(lead: OrderLead): VendorPart[] {
  const parts = new Map<string, VendorPart>();
  for (const l of lead.items ?? []) {
    const vendorId = l.vendor_id || lead.assigned_vendor || "unassigned";
    const p = parts.get(vendorId) ?? { vendorId, lines: [], total: 0, cost: 0, order: lead.vendor_orders?.[vendorId] };
    p.lines.push(l);
    p.total += l.line_total;
    p.cost += l.vendor_price * l.qty;
    parts.set(vendorId, p);
  }
  return [...parts.values()].map((p) => ({ ...p, total: Math.round(p.total * 100) / 100, cost: Math.round(p.cost * 100) / 100 }));
}
