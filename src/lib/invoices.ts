import "server-only";
import { chicagoDay } from "./admin-view";
import { PAYMENT_SCHEDULE, paymentPlanFor, usd } from "./catalog-types";
import { allInEstimate, type FeeLine } from "./fees";
import { listLedger, mergeLedger } from "./ledger";
import { listLeads, type Lead } from "./store";

// A customer invoice is a view of one booked order's payment plan (PAYMENT_SCHEDULE in catalog-types),
// with fees folded into the final balance exactly as shown on /proposal/<token>, and matched up against
// what has actually come in through /admin/payments. Nothing new is stored: the plan is computed from the
// lead's items and event date, and "paid so far" comes from the payments ledger (which already covers
// both Stripe and payments recorded by hand).

export type StageStatus = "paid" | "due" | "overdue" | "upcoming";

export type InvoiceStage = {
  label: string;
  amount: number;
  dueDate?: string; // undefined = due now (the first stage)
  paidAmount: number;
  status: StageStatus;
};

export type Invoice = {
  lead: Lead;
  number: string;
  rentals: number;
  fees: FeeLine[];
  total: number;
  stages: InvoiceStage[];
  paidTotal: number;
  dueTotal: number;
  overdue: boolean;
};

export const invoiceNumberFor = (lead: Lead) => `BC-INV-${chicagoDay(lead.created_at).replaceAll("-", "")}-${lead.id.slice(0, 6).toUpperCase()}`;

const cents = (n: number) => Math.round(n * 100) / 100;

/** The orders an invoice applies to: a quote that booked, with its first payment made. */
export function invoiceable(leads: Lead[]): Lead[] {
  return leads.filter((l) => l.fee_status === "paid" && (l.items?.length ?? 0) > 0);
}

/** Total paid toward this lead's order so far: every ledger "fee" row, less any refund, for this lead. */
export function paidToDate(leadId: string, rows: ReturnType<typeof mergeLedger>): number {
  return cents(rows.filter((r) => r.lead_id === leadId && (r.kind === "fee" || r.kind === "refund")).reduce((s, r) => s + r.signed, 0));
}

/** The payment plan for one order, with fees folded into the balance, matching the customer's proposal page. */
export function buildInvoice(lead: Lead, paid: number, today: string = chicagoDay()): Invoice {
  const rentals = lead.quote_subtotal ?? (lead.items ?? []).reduce((s, l) => s + l.line_total, 0);
  const allIn = allInEstimate(rentals);
  const plan = paymentPlanFor(rentals, lead.event_date);
  const [first, ...rest] = plan;
  const installment = plan.length === 3 ? rest[0] : undefined;
  const lastRentalStage = plan.at(-1);
  // The balance is whatever is left once the rentals stages are in: the fee lines, plus any rentals share
  // that still hasn't come due (there is none once installment/first cover the full rentals amount).
  const rentalsCovered = cents((first?.amount ?? 0) + (installment?.amount ?? 0));
  const balance = cents(Math.max(0, allIn.total - rentalsCovered));

  const stages: Omit<InvoiceStage, "paidAmount" | "status">[] = [{ label: first?.label ?? "Deposit", amount: first?.amount ?? 0, dueDate: undefined }];
  if (installment) stages.push({ label: installment.label, amount: installment.amount, dueDate: installment.dueDate });
  if (balance > 0 || stages.length === 1) {
    stages.push({
      label: plan.length > 1 ? "Balance (delivery, setup, waiver & tax)" : "Balance",
      amount: balance,
      dueDate: lastRentalStage?.dueDate,
    });
  }

  let remaining = Math.max(0, paid);
  const withStatus: InvoiceStage[] = stages.map((s) => {
    const paidAmount = Math.min(s.amount, remaining);
    remaining = cents(Math.max(0, remaining - paidAmount));
    const isPaid = s.amount <= 0 || paidAmount >= s.amount - 0.01;
    const status: StageStatus = isPaid ? "paid" : s.dueDate ? (s.dueDate < today ? "overdue" : "upcoming") : "due";
    return { ...s, paidAmount, status };
  });

  const dueTotal = cents(withStatus.reduce((s, st) => s + Math.max(0, st.amount - st.paidAmount), 0));
  return {
    lead,
    number: invoiceNumberFor(lead),
    rentals,
    fees: allIn.lines,
    total: allIn.total,
    stages: withStatus,
    paidTotal: cents(paid),
    dueTotal,
    overdue: withStatus.some((s) => s.status === "overdue"),
  };
}

/** Every invoiceable order, each matched up with what it has been paid so far. */
export async function listInvoices(): Promise<Invoice[]> {
  const [leads, recorded] = await Promise.all([listLeads(), listLedger()]);
  const rows = mergeLedger(recorded, leads);
  const today = chicagoDay();
  return invoiceable(leads)
    .map((lead) => buildInvoice(lead, paidToDate(lead.id, rows), today))
    .sort((a, b) => (a.lead.event_date ?? "9999").localeCompare(b.lead.event_date ?? "9999"));
}

export async function getInvoice(leadId: string): Promise<Invoice | undefined> {
  const [leads, recorded] = await Promise.all([listLeads(), listLedger()]);
  const lead = leads.find((l) => l.id === leadId);
  if (!lead || lead.fee_status !== "paid" || !lead.items?.length) return undefined;
  const rows = mergeLedger(recorded, leads);
  return buildInvoice(lead, paidToDate(lead.id, rows));
}

export const stageStatusLabel: Record<StageStatus, string> = { paid: "Paid", due: "Due now", overdue: "Overdue", upcoming: "Upcoming" };

/** Plain-text payment schedule lines, used in the invoice email and admin notes. */
export function scheduleLines(invoice: Invoice): string[] {
  return invoice.stages.map((s) => {
    const when = s.status === "paid" ? "paid" : s.dueDate ? `due ${s.dueDate}` : s.status === "due" ? "due now" : "due";
    return `${s.label}: ${usd(s.amount)} (${when})`;
  });
}

// Re-exported for callers that only need the schedule shape, not a full invoice.
export { PAYMENT_SCHEDULE };
