"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { vendors } from "@/data/catalog";
import { checkAdmin } from "@/lib/admin-auth";
import { callLogText, isCallOutcome } from "@/lib/call-list";
import { proposalEmail } from "@/lib/intake";
import { QUOTE_BCC, renderEmailHtml, sendEmail } from "@/lib/notify";
import { amountDue, newProposalToken } from "@/lib/payments";
import { markFeePaid } from "@/lib/proposals";
import { site } from "@/lib/site";
import { getLead, isLeadStatus, statusLabel, updateLead, type LeadActivity, type LeadPatch } from "@/lib/store";

// Sender for the "Email the quote" button below. Hardcoded (not NOTIFY_FROM) so this always goes out
// as Beyond Chiavari's own address, whatever NOTIFY_FROM is set to for other visitor emails (Angad, 2026-11-09).
const QUOTE_FROM = "Beyond Chiavari <hello@beyondchiavari.com>";

// A real calendar day (2026-02-31 passes a pattern check but the database date column refuses it).
const realDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d);

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
  const log: (Omit<LeadActivity, "at"> & { at?: string })[] = [];

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
  if (followUp !== (lead.follow_up_at ?? "") && (followUp === "" || realDate(followUp))) {
    patch.follow_up_at = followUp;
    log.push({ type: "follow_up", text: followUp ? `Follow-up set for ${followUp}` : "Follow-up cleared" });
  }

  const lost = text(formData.get("lost_reason"), 300);
  if (lost !== (lead.lost_reason ?? "")) patch.lost_reason = lost;

  const note = text(formData.get("note"));
  const t = formData.get("note_type") as LeadActivity["type"];
  const outcome = formData.get("outcome");
  // Logging a call that already happened (e.g. caught up on paperwork before writing it down) —
  // leave blank and it's stamped now like every other entry.
  const loggedAt = text(formData.get("logged_at"), 25);
  const at = loggedAt && !Number.isNaN(Date.parse(loggedAt)) ? new Date(loggedAt).toISOString() : undefined;

  if (t === "call" && isCallOutcome(outcome)) {
    log.push({ type: "call", text: note ? `${callLogText("new", outcome)}\n${note}` : callLogText("new", outcome), at });
  } else if (note) {
    log.push({ type: noteTypes.includes(t) ? t : "note", text: note, at });
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

// Emails the customer their quote/proposal link, through Resend — never opens the admin's own mail app.
// Was a plain mailto: link, which only works if the admin's computer has a mail account configured
// (Angad hit this: clicking it opened macOS Mail's "Add Account" screen instead of sending anything).
export async function sendProposalEmail(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead || !lead.proposal_token || !lead.email) redirect(`/admin/leads/${id}`);

  const { subject, body } = proposalEmail(lead, `${site.url}/proposal/${lead.proposal_token}`, process.env.OWNER_NAME || "Angad");
  const html = await renderEmailHtml(subject, body);
  const ok = await sendEmail({ to: lead.email, subject, text: body, from: QUOTE_FROM, bcc: QUOTE_BCC, html, idempotencyKey: `proposal-email/${lead.id}/${Date.now()}` });

  if (!ok) {
    await updateLead(id, {}, [{ type: "note", text: "Couldn't email the quote: Resend isn't configured or refused the send. Check RESEND_API_KEY in Vercel and that beyondchiavari.com is a verified sending domain in Resend." }]);
    revalidatePath(`/admin/leads/${id}`);
    redirect(`/admin/leads/${id}?email=failed`);
  }

  // Logged in full (not just "sent") so the timeline doubles as a record of what the customer was told,
  // without the admin having to dig through Resend's own dashboard (Angad, 2026-11-09). The rendered
  // HTML is kept too, so the admin can preview exactly what the email looked like.
  await updateLead(id, {}, [{ type: "email", text: `To: ${lead.email}\nSubject: ${subject}\n\n${body}`, html }]);
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}?email=sent`);
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
    await updateLead(id, { fee_status: status, fee_paid_at: "" }, [{ type: "note", text: `Deposit marked ${status}.` }]);
  }
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/proposals");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}
