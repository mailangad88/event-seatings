"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getVendor } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { customerPrice, paymentPlanFor, usd, type QuoteLine } from "@/lib/catalog-types";
import { feeLinesFor, sumFeeLines, type FeeLine } from "@/lib/fees";
import { proposalEmail } from "@/lib/intake";
import { QUOTE_BCC, renderEmailHtml, sendEmail, sendQuoteUpdateEmail, type SentEmail } from "@/lib/notify";
import { discountFor } from "@/lib/offers";
import { amountDue, newProposalToken } from "@/lib/payments";
import { site } from "@/lib/site";
import { getLead, updateLead, type LeadPatch } from "@/lib/store";

// Sender for "Send quote to customer" below. Hardcoded (not NOTIFY_FROM) so this always goes out as
// Beyond Chiavari's own address, whatever NOTIFY_FROM is set to for other visitor emails (Angad, 2026-11-09).
const QUOTE_FROM = "Beyond Chiavari <hello@beyondchiavari.com>";

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

// Emails the customer their quote: the first proposal link if this lead hasn't had one yet (creating it
// first, same as the "Create proposal link" button on /admin/leads/<id>), or the updated-quote email if
// it already has one. One button covers both, so there's always a way to send a quote right after editing
// it here — Angad reported the button missing when a lead reached this page before a proposal existed
// (2026-11-17). Needs RESEND_API_KEY + NOTIFY_FROM like every other visitor email.
export async function sendQuote(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead || !lead.email) redirect(`/admin/leads/${id}/quote?email=failed`);

  let sent: SentEmail | undefined;
  if (!lead.proposal_token) {
    if (amountDue(lead) < 0.5) {
      await updateLead(id, {}, [{ type: "note", text: "Couldn't send the quote: this lead has no priced items, so there is no fee to charge." }]);
      revalidatePath(`/admin/leads/${id}/quote`);
      redirect(`/admin/leads/${id}/quote?email=failed`);
    }
    const proposal_token = newProposalToken();
    await updateLead(
      id,
      { proposal_token, proposal_created_at: new Date().toISOString(), fee_status: "unpaid", fee_amount: amountDue(lead) },
      [{ type: "note", text: "Proposal link created." }],
    );
    const { subject, body } = proposalEmail(lead, `${site.url}/proposal/${proposal_token}`, process.env.OWNER_NAME || "Angad");
    const html = await renderEmailHtml(subject, body);
    const ok = await sendEmail({ to: lead.email, subject, text: body, from: QUOTE_FROM, bcc: QUOTE_BCC, html, idempotencyKey: `proposal-email/${lead.id}/${Date.now()}` });
    sent = ok ? { subject, text: body, html } : undefined;
  } else {
    sent = await sendQuoteUpdateEmail(lead);
  }

  if (!sent) {
    await updateLead(id, {}, [{ type: "note", text: "Couldn't email the quote: Resend isn't configured or refused the send. Check RESEND_API_KEY in Vercel and that beyondchiavari.com is a verified sending domain in Resend." }]);
    revalidatePath(`/admin/leads/${id}/quote`);
    redirect(`/admin/leads/${id}/quote?email=failed`);
  }

  await updateLead(id, {}, [{ type: "email", text: `To: ${lead.email}\nSubject: ${sent.subject}\n\n${sent.text}`, html: sent.html }]);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath(`/admin/leads/${id}/quote`);
  redirect(`/admin/leads/${id}/quote?email=sent`);
}

// Opens the customer-facing proposal page for this lead, creating the proposal link first if it doesn't
// have one yet (no email sent — just so there's always a way to see what the customer would see, even
// before the first "Send quote to customer"). Same gating as sendQuote and createProposal: a lead needs
// at least $0.50 due to get a link.
export async function previewQuote(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead) redirect(`/admin/leads/${id}/quote`);

  let proposal_token = lead.proposal_token;
  if (!proposal_token) {
    if (amountDue(lead) < 0.5) {
      await updateLead(id, {}, [{ type: "note", text: "Couldn't create a preview link: this lead has no priced items, so there is no fee to charge." }]);
      revalidatePath(`/admin/leads/${id}/quote`);
      redirect(`/admin/leads/${id}/quote?preview=failed`);
    }
    proposal_token = newProposalToken();
    await updateLead(
      id,
      { proposal_token, proposal_created_at: new Date().toISOString(), fee_status: "unpaid", fee_amount: amountDue(lead) },
      [{ type: "note", text: "Proposal link created." }],
    );
    revalidatePath(`/admin/leads/${id}`);
    revalidatePath(`/admin/leads/${id}/quote`);
  }
  redirect(`/proposal/${proposal_token}`);
}
