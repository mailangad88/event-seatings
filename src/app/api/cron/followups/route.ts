import { safeEqual } from "@/lib/admin-auth";
import { nextStep } from "@/lib/followups";
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
