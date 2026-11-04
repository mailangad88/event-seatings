"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { addDays, chicagoDay } from "@/lib/admin-view";
import { checkAdmin } from "@/lib/admin-auth";
import { callLogText, callTitles, isCallOutcome, type CallKind } from "@/lib/call-list";
import { getLead, statusLabel, updateLead, type LeadActivity, type LeadPatch } from "@/lib/store";

// Server Actions can be POSTed to from any URL, so each one checks the admin password itself.
async function requireAdmin() {
  if (checkAdmin((await headers()).get("authorization")) !== "ok") throw new Error("Unauthorized");
}

const text = (v: FormDataEntryValue | null, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const kinds: CallKind[] = ["new", "follow_up", "task", "vendor"];

// Logs the outcome of a call from /admin/calls on the lead's timeline.
// Reached: a new customer moves to Contacted, and an event call ticks its task off.
// No answer / Left voicemail: try the customer again in 2 days. Wrong number: clear the follow-up.
export async function logCall(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const outcome = formData.get("outcome");
  const kind = text(formData.get("kind"), 16) as CallKind;
  if (!isCallOutcome(outcome) || !kinds.includes(kind)) return;
  const lead = await getLead(id);
  if (!lead || lead.kind === "partner") return;

  const key = text(formData.get("task_key"), 40);
  const taskKey = (kind === "task" || kind === "vendor") && /^[a-z0-9+-]+$/.test(key) ? key : "";
  const title = taskKey ? text(formData.get("task_title"), 160) : callTitles[kind as "new" | "follow_up"];

  const patch: LeadPatch = {};
  const log: Omit<LeadActivity, "at">[] = [{ type: "call", text: callLogText(kind, outcome, title) }];
  const customer = kind !== "vendor";

  if (outcome === "reached") {
    if (customer && (lead.status ?? "new") === "new") {
      patch.status = "contacted";
      log.push({ type: "status", text: `Stage: ${statusLabel(lead.status)} → ${statusLabel("contacted")}` });
    }
    if (taskKey) {
      patch.tasks_done = { ...(lead.tasks_done ?? {}), [taskKey]: new Date().toISOString() };
      log.push({ type: "note", text: `Done: ${title || taskKey}` });
    }
  } else if (customer && (outcome === "no_answer" || outcome === "voicemail")) {
    patch.follow_up_at = addDays(chicagoDay(), 2);
    log.push({ type: "follow_up", text: `Follow-up set for ${patch.follow_up_at}` });
  } else if (customer && outcome === "wrong_number" && lead.follow_up_at) {
    patch.follow_up_at = "";
    log.push({ type: "follow_up", text: "Follow-up cleared" });
  }

  await updateLead(id, patch, log);
  revalidatePath("/admin/calls");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/week");
}
