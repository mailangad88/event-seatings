"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { leadFromDetailsToken } from "@/lib/details-link";
import { intakeText, missingForCustomer, parseIntakeForm, prefillIntake, splitAnswers, isAnswered, type IntakeAnswers } from "@/lib/intake";
import { log } from "@/lib/log";
import { sendEmail } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { getLead, updateLead, type LeadPatch } from "@/lib/store";

const missingColumn = (e: unknown) => {
  const err = e as { code?: string; message?: string } | null;
  return !!err && (err.code === "PGRST204" || err.code === "42703" || /column/i.test(err.message ?? ""));
};

// The customer fills in what we're missing from their own link. Only questions that were still open can be
// answered here, so the link can't overwrite anything they or we already settled.
export async function saveEventDetails(formData: FormData) {
  const token = typeof formData.get("token") === "string" ? String(formData.get("token")) : "";
  const id = leadFromDetailsToken(token);
  if (!id) redirect("/contact");
  const h = await headers();
  const limit = await rateLimit("event-details", clientIp(h), { limit: 10, windowMs: 10 * 60_000 });
  if (!limit.allowed) redirect(`/event-details/${token}?error=slow`);

  const lead = await getLead(id);
  if (!lead || lead.kind === "partner") redirect("/contact");

  const pre = prefillIntake(lead);
  const current = Object.fromEntries(Object.entries(pre).map(([k, v]) => [k, v.value]));
  const { key, more } = missingForCustomer(current);
  const open = new Set([...key, ...more].map((f) => f.id));

  const parsed = parseIntakeForm(formData);
  const given: IntakeAnswers = {};
  for (const [k, v] of Object.entries(parsed)) if (open.has(k) && isAnswered(v)) given[k] = v;
  if (!Object.keys(given).length) redirect(`/event-details/${token}?error=empty`);

  const { core, extra } = splitAnswers(given);
  const patch: LeadPatch = {};
  for (const [k, v] of Object.entries(core)) if (v !== "" && v !== undefined && k !== "follow_up_at") (patch as Record<string, unknown>)[k] = v;
  patch.intake = { answers: { ...(lead.intake?.answers ?? {}), ...extra }, saved_at: new Date().toISOString(), calls: lead.intake?.calls ?? 0 };
  const summary = intakeText(given);
  const note = { type: "note" as const, text: `They filled in their event details online:\n${summary}` };

  try {
    await updateLead(id, patch, [note]);
  } catch (e) {
    if (!missingColumn(e)) throw e;
    log.warn("event_details_no_intake_column", { leadId: id, fix: "re-run supabase/schema.sql" });
    delete patch.intake;
    await updateLead(id, patch, [note]);
  }

  const to = process.env.NOTIFY_EMAIL;
  if (to) {
    await sendEmail({
      to,
      subject: `${lead.name || "A customer"} filled in their event details`,
      text: [`${lead.name || lead.email} answered ${Object.keys(given).length} questions:`, "", summary, "", `Open the lead: ${site.url}/admin/leads/${id}/script`].join("\n"),
      idempotencyKey: `event-details/${id}/${Object.keys(given).sort().join(",")}`.slice(0, 200),
    }).catch((err) => log.warn("event_details_email_failed", { err, leadId: id }));
  }
  for (const p of [`/admin/leads/${id}`, `/admin/leads/${id}/script`, "/admin/leads", "/admin"]) revalidatePath(p);
  redirect(`/event-details/${token}?done=1`);
}
