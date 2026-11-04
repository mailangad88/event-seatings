"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { vendors } from "@/data/catalog";
import { checkAdmin } from "@/lib/admin-auth";
import { amountDue, newProposalToken } from "@/lib/payments";
import { markFeePaid } from "@/lib/proposals";
import { getLead, isLeadStatus, statusLabel, updateLead, type LeadActivity, type LeadPatch } from "@/lib/store";

async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const noteTypes: LeadActivity["type"][] = ["note", "call", "email", "text", "vendor"];

// Saves the CRM panel on a lead page: stage, vendor, follow-up date, lost reason and an optional note.
// Every change is written to the lead's timeline so there's a full history of who did what, when.
export async function saveLead(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead) throw new Error("Lead not found");

  const patch: LeadPatch = {};
  const log: Omit<LeadActivity, "at">[] = [];

  const status = formData.get("status");
  if (isLeadStatus(status) && status !== (lead.status ?? "new")) {
    patch.status = status;
    log.push({ type: "status", text: `Stage: ${statusLabel(lead.status)} → ${statusLabel(status)}` });
  }

  const vendor = text(formData.get("assigned_vendor"), 64);
  if (vendor !== (lead.assigned_vendor ?? "") && (vendor === "" || vendors.some((v) => v.id === vendor))) {
    patch.assigned_vendor = vendor;
    const name = vendors.find((v) => v.id === vendor)?.name;
    log.push({ type: "vendor", text: name ? `Assigned to ${name}` : "Vendor unassigned" });
  }

  const followUp = text(formData.get("follow_up_at"), 10);
  if (followUp !== (lead.follow_up_at ?? "") && (followUp === "" || /^\d{4}-\d{2}-\d{2}$/.test(followUp))) {
    patch.follow_up_at = followUp;
    log.push({ type: "follow_up", text: followUp ? `Follow-up set for ${followUp}` : "Follow-up cleared" });
  }

  const lost = text(formData.get("lost_reason"), 300);
  if (lost !== (lead.lost_reason ?? "")) patch.lost_reason = lost;

  const note = text(formData.get("note"));
  if (note) {
    const t = formData.get("note_type") as LeadActivity["type"];
    log.push({ type: noteTypes.includes(t) ? t : "note", text: note });
  }

  if (Object.keys(patch).length || log.length) await updateLead(id, patch, log);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
}

// One-click "Mark contacted" from the pipeline list.
export async function markContacted(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead) return;
  if ((lead.status ?? "new") === "new") {
    await updateLead(id, { status: "contacted" }, [{ type: "status", text: "Stage: New lead → Contacted" }]);
  }
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

// Creates the customer proposal link (/proposal/<token>) for a lead. The link names the rental partner; contact details follow the fee.
export async function createProposal(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead || lead.proposal_token) return;
  // Stripe needs at least $0.50; leads without priced items (waitlist, call, chat) have no fee to charge.
  if (amountDue(lead) < 0.5) {
    await updateLead(id, {}, [{ type: "note", text: "Proposal not created: this lead has no priced items, so there is no fee to charge." }]);
    revalidatePath(`/admin/leads/${id}`);
    return;
  }
  await updateLead(
    id,
    { proposal_token: newProposalToken(), proposal_created_at: new Date().toISOString(), fee_status: "unpaid", fee_amount: amountDue(lead) },
    [{ type: "note", text: "Proposal link created." }],
  );
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/proposals");
}

// Manual override for fees paid outside Stripe (bank transfer, Zelle) or refunds.
export async function setFeeStatus(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const status = text(formData.get("fee_status"), 16);
  const lead = await getLead(id);
  if (!lead) return;
  if (status === "paid") await markFeePaid(lead, "manual (marked in admin)");
  else if (status === "unpaid" || status === "refunded") {
    await updateLead(id, { fee_status: status, fee_paid_at: "" }, [{ type: "note", text: `Booking fee marked ${status}.` }]);
  }
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/proposals");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}
