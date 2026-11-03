import type { Lead, VendorPartner } from "./store";
import { isConfirmed } from "./admin-view";

// Rental partner commission (plans/business-model.md): 0% on enquiries sent in a partner's first 90 days,
// then 5% of the rental subtotal on booked orders, billed monthly (net 15) by the month of the event.
export const COMMISSION_RATE = 0.05;
export const FREE_DAYS = 90;

const cents = (n: number) => Math.round(n * 100) / 100;

// When the free window started: the day the deal was marked signed, else the partner's first booked order.
export function windowStart(partner: VendorPartner | undefined, orders: Lead[]): string | undefined {
  const signed = partner?.activity?.find((a) => a.type === "status" && /Referral deal signed$/.test(a.text))?.at;
  return signed ?? orders.map((o) => o.created_at).sort()[0];
}

export type Order = { lead: Lead; rentals: number; free: boolean; commission: number };
export type Statement = { vendorId: string; month: string; orders: Order[]; rentals: number; commission: number };

export function statements(leads: Lead[], partners: VendorPartner[]): Statement[] {
  const byVendor = new Map<string, Lead[]>();
  for (const l of leads) {
    if (!l.assigned_vendor || !l.event_date || !isConfirmed(l)) continue;
    byVendor.set(l.assigned_vendor, [...(byVendor.get(l.assigned_vendor) ?? []), l]);
  }
  const out: Statement[] = [];
  for (const [vendorId, orders] of byVendor) {
    const start = windowStart(partners.find((p) => p.vendor_id === vendorId), orders);
    const freeUntil = start ? new Date(Date.parse(start) + FREE_DAYS * 864e5).toISOString() : undefined;
    const months = new Map<string, Order[]>();
    for (const lead of orders) {
      const rentals = lead.quote_cost ?? 0;
      const free = !!freeUntil && lead.created_at < freeUntil;
      const o = { lead, rentals, free, commission: free ? 0 : cents(rentals * COMMISSION_RATE) };
      const m = lead.event_date!.slice(0, 7);
      months.set(m, [...(months.get(m) ?? []), o]);
    }
    for (const [month, os] of months) {
      out.push({
        vendorId,
        month,
        orders: os.sort((a, b) => a.lead.event_date!.localeCompare(b.lead.event_date!)),
        rentals: cents(os.reduce((s, o) => s + o.rentals, 0)),
        commission: cents(os.reduce((s, o) => s + o.commission, 0)),
      });
    }
  }
  return out.sort((a, b) => b.month.localeCompare(a.month) || b.commission - a.commission);
}
