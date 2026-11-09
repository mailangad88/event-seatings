import { createElement } from "react";
import { render } from "@react-email/render";
import { safeEqual } from "@/lib/admin-auth";
import { chicagoDay, addDays } from "@/lib/admin-view";
import { allTasks, tasksFor } from "@/lib/event-tasks";
import { GoogleReviewEmail } from "@/emails/templates";
import { sendEmail } from "@/lib/notify";
import { site } from "@/lib/site";
import { listLeads, listPartners, updateLead } from "@/lib/store";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { ensurePartLink } from "@/lib/vendor-confirm";

// Daily run (vercel.json cron) that sends the event emails from lib/event-tasks.ts: the two-weeks-out and
// day-before emails and the thank-you to customers, and order / final-details emails to rental partners
// (only when the partner has a contact email on /admin/vendors).
//
// OFF until EVENT_EMAILS_ENABLED=true (plus RESEND_API_KEY and NOTIFY_FROM). Until then the same emails show
// as drafts on /admin and /admin/followups. Only emails due today or yesterday go out, so turning it on never
// sends a backlog. Each sent email is ticked off on the lead, so it goes once.
// Vercel calls it with "Authorization: Bearer $CRON_SECRET". ?dry=1 lists what would go out.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const enabled = process.env.EVENT_EMAILS_ENABLED === "true" && !!process.env.RESEND_API_KEY && !!process.env.NOTIFY_FROM;
  const today = chicagoDay();
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const optedOut = new Set(leads.filter((l) => l.opted_out_at).map((l) => l.email.toLowerCase()));

  const due = allTasks(leads, partners, today).filter(
    (t) => t.email?.to && t.due <= today && t.due >= addDays(today, -1) && (t.who === "vendor" || !optedOut.has(t.email.to.toLowerCase())),
  );
  const planned = due.map((t) => ({ lead: t.lead.id, key: t.key, to: t.email!.to, subject: t.email!.subject }));
  let sent = 0;
  if (enabled && !dry) {
    const partnerMap = new Map(partners.map((p) => [p.vendor_id, p]));
    for (const t of due) {
      let e = t.email!;
      // Order emails to a rental partner carry their confirmation link, so make it first if the part has none.
      if (t.key.startsWith("vendor-confirm:") && t.vendor_id && !t.lead.vendor_orders?.[t.vendor_id]?.token) {
        const target = leads.find((l) => l.id === t.lead.id)!;
        const link = await ensurePartLink(target, t.vendor_id).catch((err) => console.error("confirm link failed", t.lead.id, err));
        if (link) e = tasksFor(target, partnerMap, today).find((x) => x.key === t.key)?.email ?? e;
      }
      const unsub = t.who === "customer" ? unsubscribeUrl(e.to!) : undefined;
      // The Google review ask gets its own visual layout (CTA button to the review link) instead of the
      // generic branded-text wrapper every other event email falls back to.
      const html =
        t.key === "t+5-google-review" && site.googleReviewUrl
          ? await render(createElement(GoogleReviewEmail, { name: t.lead.name, link: site.googleReviewUrl })).catch((err) => (console.error("google review html failed", t.lead.id, err), undefined))
          : undefined;
      const ok = await sendEmail({
        to: e.to!,
        subject: e.subject,
        text: unsub ? `${e.body}\n\nStop these emails: ${unsub}` : e.body,
        idempotencyKey: `event-email/${t.lead.id}/${t.key}`,
        unsubscribe: unsub,
        html,
      });
      if (!ok) continue;
      sent += 1;
      const fresh = leads.find((l) => l.id === t.lead.id)!;
      fresh.tasks_done = { ...(fresh.tasks_done ?? {}), [t.key]: new Date().toISOString() };
      await updateLead(t.lead.id, { tasks_done: fresh.tasks_done }, [{ type: "email", text: `Sent automatically.\nTo: ${e.to}\nSubject: ${e.subject}\n\n${e.body}` }]).catch((err) =>
        console.error("event email update failed", t.lead.id, err),
      );
    }
  }
  return Response.json({ enabled, dry, sent, planned });
}
