"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getVendor } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { isPartnerStatus, listPartners, partnerStatusLabel, savePartner, type LeadActivity, type PartnerPatch } from "@/lib/store";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Saves the referral relationship for one vendor: status, the person to ask for, terms and notes.
export async function saveVendorPartner(formData: FormData) {
  await requireAdmin();
  const vendorId = text(formData.get("vendor_id"), 64);
  if (!getVendor(vendorId)) throw new Error("Unknown vendor");
  const current = (await listPartners()).find((p) => p.vendor_id === vendorId);

  const patch: PartnerPatch = {};
  const log: Omit<LeadActivity, "at">[] = [];
  const status = text(formData.get("status"), 32);
  if (isPartnerStatus(status) && status !== (current?.status ?? "not_contacted")) {
    patch.status = status;
    log.push({ type: "status", text: `Status: ${partnerStatusLabel(current?.status)} → ${partnerStatusLabel(status)}` });
  }
  for (const key of ["contact_name", "contact_role", "contact_phone", "contact_email", "referral_terms", "notes"] as const) {
    const v = text(formData.get(key), key === "notes" ? 4000 : 200);
    if (v !== (current?.[key] ?? "")) patch[key] = v;
  }
  const last = text(formData.get("last_contacted_at"), 10);
  if (last !== (current?.last_contacted_at ?? "") && (last === "" || /^\d{4}-\d{2}-\d{2}$/.test(last))) patch.last_contacted_at = last;

  const note = text(formData.get("note"), 2000);
  if (note) {
    const t = text(formData.get("note_type"), 16);
    log.push({ type: (["note", "call", "email"] as const).find((x) => x === t) ?? "note", text: note });
    if (!patch.last_contacted_at && t !== "note") patch.last_contacted_at = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
  }

  if (Object.keys(patch).length || log.length) await savePartner(vendorId, patch, log);
  revalidatePath("/admin/vendors");
}
