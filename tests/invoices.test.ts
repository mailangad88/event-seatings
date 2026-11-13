import { describe, expect, it } from "vitest";
import { allInEstimate } from "@/lib/fees";
import { buildInvoice, invoiceNumberFor, scheduleLines } from "@/lib/invoices";
import type { Lead } from "@/lib/store";

const baseLead: Lead = {
  id: "abc123def456",
  kind: "quote",
  created_at: "2026-11-01T12:00:00.000Z",
  email: "sam@example.com",
  name: "Sam Rivera",
  quote_subtotal: 2000,
  fee_status: "paid",
  items: [{ id: "chair", name: "Chair", category: "Chairs", unit: "each", qty: 100, unit_price: 20, line_total: 2000, vendor_id: "v", vendor_price: 17 }],
};

describe("invoice numbers", () => {
  it("is stable for the same lead", () => {
    expect(invoiceNumberFor(baseLead)).toBe(invoiceNumberFor(baseLead));
    expect(invoiceNumberFor(baseLead)).toMatch(/^BC-INV-20261101-ABC123$/);
  });
});

describe("buildInvoice", () => {
  it("adds up to the all-in total, with fees folded into the balance", () => {
    const lead: Lead = { ...baseLead, event_date: "2027-06-12" };
    const invoice = buildInvoice(lead, 0, "2026-11-06");
    const allIn = allInEstimate(2000);
    expect(invoice.total).toBe(allIn.total);
    expect(invoice.stages.reduce((s, st) => s + st.amount, 0)).toBeCloseTo(allIn.total, 2);
  });

  it("marks the first stage paid once the deposit is in, and leaves the rest due", () => {
    const lead: Lead = { ...baseLead, event_date: "2027-06-12" }; // far out: 20% deposit, 30% at 30 days, balance at 7 days
    const unpaid = buildInvoice(lead, 0, "2026-11-06");
    const [deposit, installment, balance] = unpaid.stages;
    expect(deposit.status).toBe("due");
    expect(installment.status).toBe("upcoming");
    expect(balance.status).toBe("upcoming");

    const paid = buildInvoice(lead, deposit.amount, "2026-11-06");
    expect(paid.stages[0].status).toBe("paid");
    expect(paid.stages[0].paidAmount).toBe(deposit.amount);
    expect(paid.stages[1].status).toBe("upcoming");
    expect(paid.paidTotal).toBe(deposit.amount);
    expect(paid.overdue).toBe(false);
  });

  it("never reports a stage overdue: the schedule re-derives from today, so a due date is always still ahead", () => {
    // paymentPlanFor always picks the schedule shape from how many days today is from the event, so a stage's
    // due date (itself calculated from that same cutoff) can never already be behind today — once today reaches
    // it, the plan collapses to a single "due now" stage instead. Both calls below use the SAME explicit `today`
    // for the schedule shape and the overdue check (see buildInvoice), which is what keeps this deterministic.
    const lead: Lead = { ...baseLead, event_date: "2026-11-20" };
    const farOut = buildInvoice(lead, 0, "2026-11-01"); // 19 days out: late-first-share, balance due 2026-11-13
    expect(farOut.overdue).toBe(false);
    expect(farOut.stages.some((s) => s.status === "overdue")).toBe(false);

    const pastThatDueDate = buildInvoice(lead, 0, "2026-11-19"); // 1 day out: past the 11-13 due date, but collapsed to full payment
    expect(pastThatDueDate.overdue).toBe(false);
    expect(pastThatDueDate.stages.some((s) => s.status === "overdue")).toBe(false);
  });

  it("still invoices fees even when the rentals are paid in full up front", () => {
    const lead: Lead = { ...baseLead, event_date: "2026-11-08" }; // inside 7 days: full rentals payment now
    const invoice = buildInvoice(lead, 0, "2026-11-06");
    expect(invoice.stages).toHaveLength(2); // full rentals payment, then the fees balance
    expect(invoice.stages[0].amount).toBe(2000);
    expect(invoice.stages[1].amount).toBeCloseTo(invoice.total - 2000, 2);
  });

  it("never reports more due than the order total, even overpaid", () => {
    const invoice = buildInvoice(baseLead, 1_000_000, "2026-11-06");
    expect(invoice.dueTotal).toBe(0);
    expect(invoice.stages.every((s) => s.status === "paid")).toBe(true);
  });
});

describe("scheduleLines", () => {
  it("has one line per stage", () => {
    const invoice = buildInvoice(baseLead, 0, "2026-11-06");
    expect(scheduleLines(invoice)).toHaveLength(invoice.stages.length);
  });
});
