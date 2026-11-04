import type { Lead, VendorPartner } from "./store";
import { addDays, chicagoDay, isConfirmed } from "./admin-view";
import { PARTNER_TERMS } from "./partner-terms";

// Rental partner commission: free on enquiries sent in a partner's first FREE_DAYS days, then COMMISSION_RATE
// of the rental subtotal on booked orders, billed monthly by the month of the event. Numbers live in partner-terms.ts.
export const COMMISSION_RATE = PARTNER_TERMS.rate;
export const FREE_DAYS = PARTNER_TERMS.freeDays;

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

// Statement number printed on the statement and used in emails. Stable: the same month and partner always give the same number.
export const invoiceNumber = (vendorId: string, month: string) => `BC-C-${month.replace("-", "")}-${vendorId.slice(0, 6).toUpperCase()}`;

// Statements are due 15 days after we send them.
export const NET_DAYS = PARTNER_TERMS.netDays;

export type AgingBucket = "not_sent" | "0-30" | "31-60" | "60+";
export const agingBuckets: { id: AgingBucket; label: string }[] = [
  { id: "not_sent", label: "Not sent yet" },
  { id: "0-30", label: "0 to 30 days" },
  { id: "31-60", label: "31 to 60 days" },
  { id: "60+", label: "Over 60 days" },
];

export type OwedStatement = Statement & {
  number: string;
  sentAt?: string;
  dueDay?: string; // YYYY-MM-DD
  daysOut?: number; // days since the statement was sent
  bucket: AgingBucket;
  overdue: boolean; // sent more than NET_DAYS days ago and still not paid
};

// Unpaid statements for finished months, with how long each has been out since it was sent.
export function owedStatements(stmts: Statement[], partners: VendorPartner[], today = chicagoDay()): OwedStatement[] {
  const thisMonth = today.slice(0, 7);
  const out: OwedStatement[] = [];
  for (const s of stmts) {
    if (s.month >= thisMonth || s.commission <= 0) continue;
    const log = partners.find((p) => p.vendor_id === s.vendorId)?.commission_log?.[s.month];
    if (log?.paid_at) continue;
    const number = invoiceNumber(s.vendorId, s.month);
    if (!log?.sent_at) {
      out.push({ ...s, number, bucket: "not_sent", overdue: false });
      continue;
    }
    const sentDay = chicagoDay(log.sent_at);
    const daysOut = Math.max(0, Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${sentDay}T12:00:00Z`)) / 864e5));
    const bucket: AgingBucket = daysOut <= 30 ? "0-30" : daysOut <= 60 ? "31-60" : "60+";
    out.push({ ...s, number, sentAt: log.sent_at, dueDay: addDays(sentDay, NET_DAYS), daysOut, bucket, overdue: daysOut > NET_DAYS });
  }
  return out.sort((a, b) => (b.daysOut ?? -1) - (a.daysOut ?? -1) || a.month.localeCompare(b.month));
}
