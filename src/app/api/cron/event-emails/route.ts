import { safeEqual } from "@/lib/admin-auth";
import { chicagoDay, addDays } from "@/lib/admin-view";
import { allTasks } from "@/lib/event-tasks";
import { sendEmail } from "@/lib/notify";
import { listLeads, listPartners, updateLead } from "@/lib/store";
import { unsubscribeUrl } from "@/lib/unsubscribe";

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
    for (const t of due) {
      const e = t.email!;
      const unsub = t.who === "customer" ? unsubscribeUrl(e.to!) : undefined;
      const ok = await sendEmail({
        to: e.to!,
        subject: e.subject,
        text: unsub ? `${e.body}\n\nStop these emails: ${unsub}` : e.body,
        unsubscribe: unsub,
      });
      if (!ok) continue;
      sent += 1;
      const fresh = leads.find((l) => l.id === t.lead.id)!;
      fresh.tasks_done = { ...(fresh.tasks_done ?? {}), [t.key]: new Date().toISOString() };
      await updateLead(t.lead.id, { tasks_done: fresh.tasks_done }, [{ type: "email", text: `Sent automatically: "${e.subject}" to ${e.to}` }]).catch((err) =>
        console.error("event email update failed", t.lead.id, err),
      );
    }
  }
  return Response.json({ enabled, dry, sent, planned });
}
