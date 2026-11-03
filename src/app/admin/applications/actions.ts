"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getVendor } from "@/data/vendors";
import { checkAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import { listPartners, savePartner } from "@/lib/store";
import {
  applicationStatusLabel,
  getVendorApplication,
  isApplicationStatus,
  updateVendorApplication,
  vendorFacingStatus,
  type ApplicationActivity,
  type ApplicationPatch,
} from "@/lib/vendor-applications";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Review one vendor application: change its status (optionally emailing the vendor), link it to a vendor in the
// catalog, keep private notes, and log calls or emails.
export async function saveApplication(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const app = await getVendorApplication(id);
  if (!app) throw new Error("Unknown application");

  const patch: ApplicationPatch = {};
  const log: Omit<ApplicationActivity, "at">[] = [];

  const status = text(formData.get("status"), 32);
  const statusChanged = isApplicationStatus(status) && status !== app.status;
  if (statusChanged) {
    patch.status = status;
    log.push({ type: "status", text: `Status: ${applicationStatusLabel(app.status)} → ${applicationStatusLabel(status)}` });
  }

  const linked = text(formData.get("linked_vendor_id"), 64);
  if (linked !== (app.linked_vendor_id ?? "") && (linked === "" || getVendor(linked))) {
    patch.linked_vendor_id = linked;
    log.push({ type: "note", text: linked ? `Linked to catalog vendor ${getVendor(linked)?.name}` : "Unlinked from catalog vendor" });
  }

  const notes = text(formData.get("admin_notes"), 4000);
  if (notes !== (app.admin_notes ?? "")) patch.admin_notes = notes;

  const note = text(formData.get("note"), 2000);
  if (note) {
    const t = text(formData.get("note_type"), 16);
    log.push({ type: (["note", "call", "email"] as const).find((x) => x === t) ?? "note", text: note });
  }

  // Email the vendor about a status change, with the owner's own message on top of the standard text.
  const message = text(formData.get("vendor_message"), 3000);
  if (statusChanged && formData.get("email_vendor") === "on" && process.env.NOTIFY_FROM) {
    const s = vendorFacingStatus[status];
    const sent = await sendEmail({
      to: app.email,
      subject: `${site.name} partner application: ${s.title.toLowerCase()}`,
      text: [
        `Hi ${app.contact_name.split(" ")[0]},`,
        "",
        ...(message ? [message, ""] : []),
        s.text,
        "",
        `Your application page: ${site.url}/partners/status/${app.status_token}`,
        "",
        `The ${site.name} team`,
      ].join("\n"),
    });
    log.push({ type: "email", text: sent ? `Emailed vendor: ${s.title}${message ? ` (${message.slice(0, 200)})` : ""}` : "Status email to vendor failed to send" });
  }

  if (Object.keys(patch).length || log.length) await updateVendorApplication(id, patch, log);

  // Approving an application for a vendor already in the catalog moves that vendor's partner record forward.
  const vendorId = patch.linked_vendor_id ?? app.linked_vendor_id;
  if (statusChanged && status === "approved" && vendorId && getVendor(vendorId)) {
    const current = (await listPartners()).find((p) => p.vendor_id === vendorId);
    if (!current || ["not_contacted", "contacted"].includes(current.status)) {
      await savePartner(
        vendorId,
        {
          status: "talking",
          contact_name: current?.contact_name || app.contact_name,
          contact_role: current?.contact_role || app.contact_role,
          contact_phone: current?.contact_phone || app.phone,
          contact_email: current?.contact_email || app.email,
        },
        [{ type: "vendor", text: `Partner application approved (${site.url}/admin/applications/${app.id})` }],
      );
    }
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}
