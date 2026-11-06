import { createElement } from "react";
import { render } from "@react-email/render";
import { safeEqual } from "@/lib/admin-auth";
import { UnfinishedQuoteEmail } from "@/emails/UnfinishedQuoteEmail";
import { log } from "@/lib/log";
import { sendEmail } from "@/lib/notify";
import { planTodaysReminders, remindersSwitchedOn } from "@/lib/reminder-run";
import { reminderLogText } from "@/lib/reminders";
import { site } from "@/lib/site";
import { updateLead } from "@/lib/store";
import { unsubscribeUrl } from "@/lib/unsubscribe";

// Daily reminder emails (vercel.json cron, "Authorization: Bearer $CRON_SECRET"): unfinished quote lists, items
// someone keeps looking at, and event dates coming up with nothing booked. Rules in lib/reminders.ts.
// OFF until REMINDERS_ENABLED=true (plus RESEND_API_KEY and NOTIFY_FROM). ?dry=1 lists what would go out.
// Each reminder and any offer in it is logged on the lead, so it goes once and the offer can be honoured.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const enabled = remindersSwitchedOn();
  const plan = await planTodaysReminders();
  const planned = plan.send.slice(0, 50);
  let sent = 0;
  if (enabled && !dry) {
    for (const r of planned) {
      const unsub = unsubscribeUrl(r.lead.email);
      // The unfinished-quote reminder gets the same visual treatment as the quote confirmation
      // email (hero image, item thumbnails, one CTA); the other two kinds keep the branded plain-text wrapper.
      const html =
        r.kind === "unfinished_quote" && r.quoteItems?.length
          ? await render(
              createElement(UnfinishedQuoteEmail, {
                name: r.lead.name,
                items: r.quoteItems,
                link: r.quoteLink ?? `${site.url}/quote`,
                offerLine: r.offer ? r.body.at(-1) : undefined,
                unsubscribe: unsub,
              }),
            ).catch((e) => (log.warn("unfinished_quote_html_failed", { leadId: r.lead.id, e }), undefined))
          : undefined;
      const ok = await sendEmail({
        to: r.lead.email,
        subject: r.subject,
        text: [...r.body, "", `The ${site.name} team`, "", `You're getting this because you contacted ${site.name}. Stop these emails: ${unsub}`].join("\n"),
        unsubscribe: unsub,
        html,
        idempotencyKey: `reminder/${r.lead.id}/${r.kind}`,
      });
      if (!ok) continue;
      sent++;
      await updateLead(r.lead.id, {}, [{ type: "email", text: reminderLogText(r) }]).catch((e) => console.error("reminder log not saved", r.lead.id, e));
    }
  }
  return Response.json({
    enabled,
    dry,
    sent,
    planned: planned.map((r) => ({ lead: r.lead.id, email: r.lead.email, kind: r.kind, subject: r.subject, offer: r.offer ?? null })),
    skipped: plan.skipped,
  });
}
