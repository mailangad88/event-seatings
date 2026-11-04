"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getVendor } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { usd } from "@/lib/catalog-types";
import { addLedgerEntry, deleteLedgerEntry, isLedgerKind, isLedgerMethod, LedgerTableMissing, listLedger, methodLabel, type LedgerMethod } from "@/lib/ledger";
import { refundCheckout, stripeEnabled } from "@/lib/payments";
import { markFeePaid } from "@/lib/proposals";
import { getLead, listPartners, savePartner, updateLead } from "@/lib/store";

async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function refresh(leadId?: string) {
  revalidatePath("/admin/payments");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/proposals");
  revalidatePath("/admin");
  if (leadId) revalidatePath(`/admin/leads/${leadId}`);
}

// A YYYY-MM-DD from the form becomes midday Chicago time on that day, so it never slips into the day before.
function whenFrom(day: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) return undefined;
  if (day === new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" })) return new Date().toISOString();
  return `${day}T18:00:00.000Z`;
}

// Marks a commission statement paid (same record /admin/invoices keeps), unless it already is.
async function markStatementPaid(vendorId: string, month: string, amount: number, method: LedgerMethod) {
  const current = (await listPartners()).find((p) => p.vendor_id === vendorId);
  const log = { ...(current?.commission_log ?? {}) };
  if (log[month]?.paid_at) return;
  log[month] = { ...log[month], amount: log[month]?.amount ?? amount, paid_at: new Date().toISOString() };
  await savePartner(vendorId, { commission_log: log }, [{ type: "note", text: `Commission statement ${month} marked paid (${usd(amount)} by ${methodLabel(method)}).` }]);
}

// "Record a payment": cash, Zelle, check or anything else that didn't go through Stripe.
export async function recordPayment(formData: FormData) {
  await requireAdmin();
  const kind = text(formData.get("kind"), 16);
  const method = text(formData.get("method"), 16);
  const amount = Math.round(Number(text(formData.get("amount"), 16).replace(/[$,\s]/g, "")) * 100) / 100;
  const leadId = text(formData.get("lead_id"), 64);
  const vendorId = text(formData.get("vendor_id"), 64);
  const month = text(formData.get("month"), 7);
  const note = text(formData.get("note"), 300);
  const created_at = whenFrom(text(formData.get("date"), 10)) ?? new Date().toISOString();
  const markPaid = formData.get("mark_paid") === "on";

  if (!isLedgerKind(kind) || kind === "refund" || !isLedgerMethod(method) || !(amount > 0 && amount < 1_000_000)) redirect("/admin/payments?error=form#record");
  const lead = leadId ? await getLead(leadId) : undefined;
  if (leadId && !lead) redirect("/admin/payments?error=lead#record");
  if (kind === "commission" && (!getVendor(vendorId) || !/^\d{4}-\d{2}$/.test(month))) redirect("/admin/payments?error=commission#record");
  if (vendorId && !getVendor(vendorId)) redirect("/admin/payments?error=form#record");

  try {
    await addLedgerEntry({
      kind,
      method,
      amount,
      created_at,
      lead_id: lead?.id,
      vendor_id: vendorId || undefined,
      month: kind === "commission" ? month : undefined,
      note: note || undefined,
    });
  } catch (e) {
    if (e instanceof LedgerTableMissing) redirect("/admin/payments?error=table#record");
    throw e;
  }

  if (kind === "fee" && lead) {
    if (markPaid && (lead.fee_status ?? "unpaid") === "unpaid") await markFeePaid(lead, `${methodLabel(method)} (recorded in admin)`, { amount });
    else await updateLead(lead.id, {}, [{ type: "note", text: `Payment recorded: ${usd(amount)} by ${methodLabel(method)}.` }]);
  }
  if (kind === "commission") await markStatementPaid(vendorId, month, amount, method);

  refresh(lead?.id);
  redirect("/admin/payments?done=recorded");
}

// Refunds a booking fee. The page only shows this button after a separate "Refund" click (?refund=<lead id>), and the
// form must carry confirm=yes. With Stripe and a card payment it refunds the card; otherwise it only records the refund.
export async function refundFee(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const how = text(formData.get("how"), 16);
  if (formData.get("confirm") !== "yes" || !isLedgerMethod(how)) redirect("/admin/payments?error=form");
  const lead = await getLead(id);
  if (!lead || lead.fee_status !== "paid") redirect("/admin/payments?error=refund");
  const amount = lead.fee_amount ?? 0;

  let note = "Marked refunded in admin";
  if (how === "stripe") {
    if (!stripeEnabled() || !lead.stripe_session_id) redirect("/admin/payments?error=nostripe");
    let refundId = "";
    try {
      refundId = (await refundCheckout(lead.stripe_session_id, lead.id)).id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("stripe refund failed", msg);
      await updateLead(lead.id, {}, [{ type: "note", text: `Stripe refund failed: ${msg.slice(0, 200)}` }]);
      redirect(`/admin/payments?error=stripe&refund=${lead.id}`);
    }
    note = `Stripe refund ${refundId}`;
  }

  // fee_paid_at stays, so the ledger keeps the date the fee came in.
  await updateLead(lead.id, { fee_status: "refunded" }, [
    { type: "note", text: `Booking fee refunded (${usd(amount)}, ${how === "stripe" ? "back to the card through Stripe" : `by ${methodLabel(how)}`}).` },
  ]);
  try {
    await addLedgerEntry({ kind: "refund", method: how, amount, lead_id: lead.id, note });
  } catch (e) {
    // The refund already happened; the lead's own refunded status still shows it in the ledger.
    if (!(e instanceof LedgerTableMissing)) throw e;
  }
  refresh(lead.id);
  redirect("/admin/payments?done=refunded");
}

// Deletes a row that was typed in by mistake. Only recorded rows; it does not change the lead or the statement.
export async function removeEntry(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  if (formData.get("confirm") !== "yes" || !(await listLedger()).some((r) => r.id === id)) redirect("/admin/payments?error=form");
  try {
    await deleteLedgerEntry(id);
  } catch (e) {
    if (e instanceof LedgerTableMissing) redirect("/admin/payments?error=table");
    throw e;
  }
  refresh();
  redirect("/admin/payments?done=removed");
}
