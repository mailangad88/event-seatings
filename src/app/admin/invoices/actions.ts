"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getVendor } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { usd } from "@/lib/catalog-types";
import { addLedgerEntry, isLedgerMethod, LedgerTableMissing, methodLabel } from "@/lib/ledger";
import { listPartners, savePartner } from "@/lib/store";

async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 64) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Marks a monthly commission statement as sent to the rental partner, or as paid by them.
export async function markStatement(formData: FormData) {
  await requireAdmin();
  const vendorId = text(formData.get("vendor_id"));
  const month = text(formData.get("month"), 7);
  const what = text(formData.get("what"), 8);
  const amount = Number(text(formData.get("amount"), 16));
  if (!getVendor(vendorId) || !/^\d{4}-\d{2}$/.test(month) || !["sent", "paid", "undo"].includes(what)) return;
  const current = (await listPartners()).find((p) => p.vendor_id === vendorId);
  const log = { ...(current?.commission_log ?? {}) };
  const now = new Date().toISOString();
  const row = { ...log[month], amount: Number.isFinite(amount) ? amount : log[month]?.amount };
  if (what === "sent") row.sent_at = now;
  if (what === "paid") row.paid_at = now;
  if (what === "undo") {
    delete row.paid_at;
    delete row.sent_at;
  }
  log[month] = row;
  const method = text(formData.get("method"), 16);
  const how = isLedgerMethod(method) ? method : "other";
  const paidNow = what === "paid" && !current?.commission_log?.[month]?.paid_at;
  const label = what === "undo" ? "reset" : what === "paid" ? `marked paid${row.amount ? ` (${usd(row.amount)} by ${methodLabel(how)})` : ""}` : `marked ${what}`;
  await savePartner(vendorId, { commission_log: log }, [{ type: "note", text: `Commission statement ${month} ${label}.` }]);
  // The payments ledger keeps one row per commission payment (undo leaves an earlier row for you to remove on /admin/payments).
  if (paidNow && row.amount && row.amount > 0) {
    try {
      await addLedgerEntry({ kind: "commission", method: how, amount: row.amount, vendor_id: vendorId, month, note: "Marked paid on the Invoices page" });
    } catch (e) {
      if (!(e instanceof LedgerTableMissing)) throw e;
      console.warn("payments_ledger missing: re-run supabase/schema.sql");
    }
  }
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/payments");
}
