"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getVendor } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { customerPrice, usd, type QuoteLine } from "@/lib/catalog-types";
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

// Saves edits to a lead's quote after talking to the rental partner: quantities, the vendor's real price,
// removed lines and extra lines (delivery, setup, a custom piece). Customer prices are the vendor price; our fee is a flat amount per event.
// Locked once the deposit is paid, so the customer's paid proposal never changes under them.
export async function saveQuote(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead || lead.fee_status === "paid") return;

  const old = lead.items ?? [];
  const lines: QuoteLine[] = [];
  const changes: string[] = [];
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
  if (!changes.length) return;

  const quote_subtotal = cents(lines.reduce((s, l) => s + l.line_total, 0));
  const quote_cost = cents(lines.reduce((s, l) => s + l.vendor_price * l.qty, 0));
  const patch: LeadPatch = { items: lines, quote_subtotal, quote_cost };
  if (lead.proposal_token) patch.fee_amount = amountDue(lead);
  await updateLead(id, patch, [{ type: "note", text: `Quote edited: ${changes.join("; ")}. New total ${usd(quote_subtotal)}.` }]);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath(`/admin/leads/${id}/quote`);
}
