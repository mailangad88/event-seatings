"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getVendor } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { customerPrice, paymentPlanFor, usd, type QuoteLine } from "@/lib/catalog-types";
import { feeLinesFor, sumFeeLines, type FeeLine } from "@/lib/fees";
import { sendQuoteUpdateEmail } from "@/lib/notify";
import { discountFor } from "@/lib/offers";
import { amountDue } from "@/lib/payments";
import { getLead, updateLead, type LeadPatch } from "@/lib/store";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: FormDataEntryValue | null) => {
  const n = Number(text(v, 20));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const cents = (n: number) => Math.round(n * 100) / 100;

// The full quote as it stood right after a save, not just what changed — so the timeline shows the whole
// thing at a glance instead of making Angad add up a chain of diffs (Angad, 2026-11-10).
function snapshotText(lines: QuoteLine[], feeLines: FeeLine[], discount_amount: number, quote_notes: string) {
  const subtotal = cents(lines.reduce((s, l) => s + l.line_total, 0));
  const feeTotal = sumFeeLines(feeLines);
  const total = cents(subtotal + feeTotal - discount_amount);
  return [
    "Full quote:",
    ...lines.map((l) => `- ${l.qty.toLocaleString()} × ${l.name}: ${usd(l.unit_price)} ea = ${usd(l.line_total)}`),
    `Rentals: ${usd(subtotal)}`,
    ...feeLines.map((f) => `- ${f.label}: ${usd(f.amount)}`),
    ...(discount_amount ? [`- Discount: -${usd(discount_amount)}`] : []),
    ...(quote_notes ? [`Notes: ${quote_notes}`] : []),
    `Total: ${usd(total)}`,
  ].join("\n");
}

// Saves edits to a lead's quote after talking to the rental partner: item quantities and vendor prices,
// added/removed items, the delivery/setup/teardown/waiver/tax lines, the discount, and a note for the
// customer. Fee lines and the discount are only stored once an admin saves this page; until then the
// proposal keeps using the computed estimate (lib/fees.ts) and the automatic first-booking offer. Items
// are locked once the deposit is paid, so the customer's paid proposal never changes under them, but the
// fees/discount/note stay editable — the proposal itself says delivery and setup are confirmed once we
// know the venue, so those are meant to be corrected after booking (they only change the balance still due).
export async function saveQuote(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead) return;
  const locked = lead.fee_status === "paid";

  const old = lead.items ?? [];
  let lines: QuoteLine[] = old;
  const changes: string[] = [];

  if (!locked) {
    lines = [];
    old.forEach((l, i) => {
      if (formData.get(`remove_${i}`) === "on") {
        changes.push(`removed ${l.name}`);
        return;
      }
      const qty = Math.min(10_000, Math.floor(num(formData.get(`qty_${i}`)) ?? l.qty));
      const vendor_price = cents(num(formData.get(`vendor_price_${i}`)) ?? l.vendor_price);
      if (qty <= 0) {
        changes.push(`removed ${l.name}`);
        return;
      }
      if (qty !== l.qty) changes.push(`${l.name}: qty ${l.qty} → ${qty}`);
      if (vendor_price !== l.vendor_price) changes.push(`${l.name}: vendor price ${usd(l.vendor_price)} → ${usd(vendor_price)}`);
      const unit_price = customerPrice({ vendorPrice: vendor_price });
      lines.push({ ...l, qty, vendor_price, unit_price, line_total: cents(unit_price * qty) });
    });

    const name = text(formData.get("new_name"), 120);
    const newQty = Math.floor(num(formData.get("new_qty")) ?? 0);
    const newPrice = num(formData.get("new_vendor_price"));
    const newVendor = text(formData.get("new_vendor_id"), 64) || lead.assigned_vendor || old[0]?.vendor_id || "";
    if (name && newQty > 0 && newPrice !== undefined && getVendor(newVendor)) {
      const unit_price = customerPrice({ vendorPrice: cents(newPrice) });
      lines.push({
        id: `custom-${Date.now().toString(36)}`,
        name,
        category: "other",
        unit: text(formData.get("new_unit"), 30) || "each",
        qty: newQty,
        unit_price,
        line_total: cents(unit_price * newQty),
        vendor_id: newVendor,
        vendor_price: cents(newPrice),
      });
      changes.push(`added ${newQty} × ${name}`);
    }
  }

  // Delivery, setup, teardown, damage waiver, tax: whatever the quote page showed (the admin's own
  // edits, or the computed estimate the first time), re-read by the same row order the page rendered.
  const oldFees = feeLinesFor(lead, lead.quote_subtotal ?? 0);
  const feeCount = Math.min(50, Math.max(0, Math.floor(num(formData.get("fee_count")) ?? oldFees.length)));
  const feeLines: FeeLine[] = [];
  for (let i = 0; i < feeCount; i++) {
    if (formData.get(`fee_remove_${i}`) === "on") continue;
    const label = text(formData.get(`fee_label_${i}`), 80) || oldFees[i]?.label;
    const amount = cents(num(formData.get(`fee_amount_${i}`)) ?? oldFees[i]?.amount ?? 0);
    if (!label) continue;
    feeLines.push({ id: oldFees[i]?.id, label, amount, note: oldFees[i]?.note });
  }
  const newFeeLabel = text(formData.get("new_fee_label"), 80);
  const newFeeAmount = num(formData.get("new_fee_amount"));
  if (newFeeLabel && newFeeAmount !== undefined) feeLines.push({ label: newFeeLabel, amount: cents(newFeeAmount) });

  const sameFees = JSON.stringify(oldFees.map((f) => [f.label, f.amount])) === JSON.stringify(feeLines.map((f) => [f.label, f.amount]));
  if (!sameFees) changes.push(`fees: ${usd(sumFeeLines(oldFees))} → ${usd(sumFeeLines(feeLines))}`);

  const discount_amount = cents(num(formData.get("discount_amount")) ?? 0);
  const oldDepositBeforeDiscount = paymentPlanFor(lead.quote_subtotal ?? 0, lead.event_date)[0]?.amount ?? 0;
  const oldDiscount = discountFor(lead, oldDepositBeforeDiscount, lead.quote_subtotal ?? 0);
  if (discount_amount !== oldDiscount) changes.push(`discount ${usd(oldDiscount)} → ${usd(discount_amount)}`);

  const quote_notes = text(formData.get("quote_notes"), 2000);
  if (quote_notes !== (lead.quote_notes ?? "")) changes.push(quote_notes ? `notes updated` : "notes cleared");

  if (!changes.length) return;

  const quote_subtotal = cents(lines.reduce((s, l) => s + l.line_total, 0));
  const quote_cost = cents(lines.reduce((s, l) => s + l.vendor_price * l.qty, 0));
  const patch: LeadPatch = { items: lines, quote_subtotal, quote_cost, fee_lines: feeLines, discount_amount, quote_notes };
  // The deposit already charged is history once paid; only recompute what's due at checkout before that.
  if (!locked && lead.proposal_token) patch.fee_amount = amountDue({ ...lead, ...patch });
  await updateLead(id, patch, [
    {
      type: "note",
      text: `Quote edited: ${changes.join("; ")}. New total ${usd(cents(quote_subtotal + sumFeeLines(feeLines)))}.\n\n${snapshotText(lines, feeLines, discount_amount, quote_notes)}`,
    },
  ]);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath(`/admin/leads/${id}/quote`);
  if (lead.proposal_token) revalidatePath(`/proposal/${lead.proposal_token}`);
}

// Emails the customer that their quote changed, with a link to see the new total and pay. Needs
// RESEND_API_KEY + NOTIFY_FROM like every other visitor email. Allowed even once the deposit is paid —
// that's exactly when a corrected delivery/setup fee changes the balance they still owe.
export async function sendQuoteUpdate(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead || !lead.proposal_token) return;

  const sent = await sendQuoteUpdateEmail(lead);
  if (sent) {
    await updateLead(id, {}, [{ type: "email", text: `To: ${lead.email}\nSubject: ${sent.subject}\n\n${sent.text}`, html: sent.html }]);
    revalidatePath(`/admin/leads/${id}`);
  }
}
