"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays, chicagoDay } from "@/lib/admin-view";
import { checkAdmin } from "@/lib/admin-auth";
import { callLogText, callTitles, isCallOutcome, type CallKind } from "@/lib/call-list";
import { changedAnswers, intakeText, parseIntakeForm, prefillIntake, splitAnswers, type Intake } from "@/lib/intake";
import { scoreLead } from "@/lib/lead-score";
import { log as logLine } from "@/lib/log";
import { sendEmail } from "@/lib/notify";
import { getLead, saveNewLead, statusLabel, updateLead, type Lead, type LeadActivity, type LeadPatch, type NewLead } from "@/lib/store";

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

function revalidateLead(id: string) {
  for (const p of ["/admin/calls", "/admin/pipeline", "/admin/leads", "/admin/customers", "/admin", "/admin/week", `/admin/leads/${id}`, `/admin/leads/${id}/script`]) revalidatePath(p);
}

// True when Supabase refused the write because supabase/schema.sql hasn't been re-run (no leads.intake yet).
const missingColumn = (e: unknown) => {
  const err = e as { code?: string; message?: string } | null;
  return !!err && (err.code === "PGRST204" || err.code === "42703" || /column/i.test(err.message ?? ""));
};

// Saves the call script on an existing lead. Answers with their own column (name, date, guests, town...) update
// that column; the rest go in leads.intake. The timeline gets a note listing what was added or changed.
export async function saveCallScript(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const lead = await getLead(id);
  if (!lead || lead.kind === "partner") throw new Error("Lead not found");

  const before = prefillIntake(lead);
  const answers = parseIntakeForm(formData);
  const { core, extra } = splitAnswers(answers);
  const changed = changedAnswers(before, answers);

  const patch: LeadPatch = {};
  for (const [k, v] of Object.entries(core) as [keyof typeof core, string | number][]) {
    const prev = lead[k] ?? "";
    // Email can't be blank in the database, so an emptied email box keeps the one we have.
    if (k === "email" && !v) continue;
    if (String(prev).slice(0, k === "event_date" || k === "follow_up_at" ? 10 : undefined) !== String(v)) {
      (patch as Record<string, unknown>)[k] = v;
    }
  }
  const intake: Intake = { answers: extra, saved_at: new Date().toISOString(), calls: (lead.intake?.calls ?? 0) + 1 };
  patch.intake = intake;

  const log: Omit<LeadActivity, "at">[] = [];
  const summary = intakeText(answers, changed);
  log.push({ type: "call", text: summary ? `Call script saved. New or changed:\n${summary}` : "Call script saved. Nothing new." });
  if (patch.follow_up_at !== undefined) log.push({ type: "follow_up", text: patch.follow_up_at ? `Follow-up set for ${patch.follow_up_at}` : "Follow-up cleared" });
  if ((lead.status ?? "new") === "new") {
    patch.status = "contacted";
    log.push({ type: "status", text: `Stage: ${statusLabel(lead.status)} → ${statusLabel("contacted")}` });
  }

  try {
    await updateLead(id, patch, log);
  } catch (e) {
    if (!missingColumn(e)) throw e;
    // Database without the intake column: keep every answer on the timeline instead, so nothing is lost.
    logLine.warn("call_script_no_intake_column", { leadId: id, fix: "re-run supabase/schema.sql" });
    delete patch.intake;
    await updateLead(id, patch, [...log, { type: "note", text: `Call script answers (saved here until the database is updated):\n${intakeText(extra)}` }]);
  }
  revalidateLead(id);
  redirect(`/admin/leads/${id}/script?saved=1`);
}

// Someone phoned in. Creates a lead from the call script so it shows in the pipeline like any form.
export async function createCallLead(formData: FormData) {
  await requireAdmin();
  const answers = parseIntakeForm(formData);
  const { core, extra } = splitAnswers(answers);
  const name = String(core.name ?? "");
  const phone = String(core.phone ?? "");
  const email = String(core.email ?? "");
  if (!name && !phone && !email) redirect("/admin/calls/new?error=contact");

  const now = new Date().toISOString();
  const notes = intakeText(answers);
  const lead: NewLead = {
    kind: "call",
    source: "phone:inbound",
    name: name || undefined,
    phone: phone || undefined,
    // The database needs an email. Phone-only callers get a blank one until they give it.
    email,
    event_type: String(core.event_type ?? "") || undefined,
    event_date: String(core.event_date ?? "") || undefined,
    guest_count: core.guest_count ? Number(core.guest_count) : undefined,
    city: String(core.city ?? "") || undefined,
    venue: String(core.venue ?? "") || undefined,
    follow_up_at: String(core.follow_up_at ?? "") || undefined,
    // They called us, so calling back is fine. Marketing email waits until they agree to it.
    call_consent: true,
    email_consent: false,
    consent_at: now,
    status: "contacted",
    message: notes ? `Taken by phone:\n${notes}` : "Taken by phone.",
    intake: { answers: extra, saved_at: now, calls: 1 },
    activity: [{ at: now, type: "call", text: "Phone call logged with the call script." }],
  };
  const score = scoreLead({ ...lead, id: "", created_at: now } as Lead);
  lead.lead_score = score.grade;
  lead.lead_score_reasons = score.reasons.join(", ");

  const { lead: saved } = await saveNewLead(lead, { id: text(formData.get("submission_id"), 64) });
  revalidateLead(saved.id);
  redirect(`/admin/leads/${saved.id}/script?saved=new`);
}

// Sends the "a few quick questions" email from the call script and logs it on the timeline.
export async function sendDetailsEmail(formData: FormData) {
  await requireAdmin();
  const id = text(formData.get("id"), 64);
  const subject = text(formData.get("subject"), 200);
  const body = typeof formData.get("body") === "string" ? String(formData.get("body")).trim().slice(0, 6000) : "";
  const lead = await getLead(id);
  if (!lead || !lead.email || !subject || !body) redirect(`/admin/leads/${id}/script?sent=no#ask`);
  const ok = await sendEmail({ to: lead.email, subject, text: body, idempotencyKey: `details-ask/${id}/${createHash("sha256").update(subject + body).digest("hex").slice(0, 16)}` });
  if (!ok) redirect(`/admin/leads/${id}/script?sent=no#ask`);
  const patch: LeadPatch = {};
  const log: Omit<LeadActivity, "at">[] = [{ type: "email", text: `Sent "${subject}":\n${body}` }];
  if ((lead.status ?? "new") === "new") {
    patch.status = "contacted";
    log.push({ type: "status", text: `Stage: ${statusLabel(lead.status)} → ${statusLabel("contacted")}` });
  }
  if (!lead.follow_up_at) {
    patch.follow_up_at = addDays(chicagoDay(), 2);
    log.push({ type: "follow_up", text: `Follow-up set for ${patch.follow_up_at}` });
  }
  await updateLead(id, patch, log);
  revalidateLead(id);
  redirect(`/admin/leads/${id}/script?sent=1`);
}
