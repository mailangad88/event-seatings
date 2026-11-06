import { createElement } from "react";
import { render } from "@react-email/render";
import { FollowupEmail } from "@/emails/FollowupEmail";
import { safeEqual } from "@/lib/admin-auth";
import { nextStep } from "@/lib/followups";
import { log } from "@/lib/log";
import { sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import { listLeadsSince, updateLead } from "@/lib/store";
import { unsubscribeUrl } from "@/lib/unsubscribe";

// Daily follow-up run (vercel.json cron). Vercel calls it with "Authorization: Bearer $CRON_SECRET".
// Sends nothing unless FOLLOWUPS_ENABLED=true, RESEND_API_KEY and NOTIFY_FROM are set.
// ?dry=1 (with the same auth) lists what would go out without sending.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const enabled = process.env.FOLLOWUPS_ENABLED === "true" && !!process.env.RESEND_API_KEY && !!process.env.NOTIFY_FROM;

  const since = new Date(Date.now() - 16 * 864e5).toISOString();
  const leads = await listLeadsSince(since);
  const planned: { id: string; email: string; step: number; subject: string }[] = [];
  const skipped: Record<string, number> = {};

  for (const lead of leads) {
    const next = nextStep(lead, leads);
    if ("skip" in next) {
      skipped[next.skip] = (skipped[next.skip] ?? 0) + 1;
      continue;
    }
    const subject = next.step.subject(lead);
    planned.push({ id: lead.id, email: lead.email, step: next.index + 1, subject });
    if (dry || !enabled) continue;

    const unsub = unsubscribeUrl(lead.email);
    // Same visual treatment as the quote confirmation and unfinished-quote emails: hero image, one
    // card, one CTA button. The wording is the same lines used in the plain-text part below, minus
    // the greeting line (the component renders its own).
    const html = await render(
      createElement(FollowupEmail, {
        heading: next.step.heading(lead),
        preview: subject,
        lines: next.step.body(lead).slice(2),
        cta: next.step.cta(lead),
        unsubscribe: unsub,
      }),
    ).catch((err) => (log.warn("followup_html_failed", { leadId: lead.id, err }), undefined));
    const ok = await sendEmail({
      to: lead.email,
      subject,
      text: [
        ...next.step.body(lead),
        "",
        `The ${site.name} team`,
        "",
        `You're getting this because you contacted ${site.name}. Stop these emails: ${unsub}`,
      ].join("\n"),
      unsubscribe: unsub,
      html,
      // One email per lead per step, even if the job runs twice.
      idempotencyKey: `followup/${lead.id}/${next.index + 1}`,
    });
    if (ok) {
      await updateLead(
        lead.id,
        { followup_step: next.index + 1, followup_last_at: new Date().toISOString() },
        [{ type: "email", text: `Follow-up ${next.index + 1} sent: "${subject}"` }],
      ).catch((e) => console.error("followup update failed", lead.id, e));
    }
  }
  return Response.json({ enabled, dry, sent: dry || !enabled ? 0 : planned.length, planned, skipped });
}
