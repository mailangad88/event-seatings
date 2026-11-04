import { backupConfigured, backupDeleteLead, backupListLeads } from "@/lib/lead-backup";
import { notifyOwner } from "@/lib/notify";
import { databaseConfigured, importLead, listLeadsSince, updateLead, type Lead } from "@/lib/store";

// Daily safety net for leads (vercel.json cron, "Authorization: Bearer $CRON_SECRET"):
// 1. Moves leads that only made it to the Blob backup (database down, or added before Supabase was set up)
//    into the database, then removes the backup copy.
// 2. Sends any owner alert that didn't go out in the last 3 days (Resend down, or keys added later), at most
//    25 per run. Each alert has a fixed Resend idempotency key, so nobody gets the same alert twice.
// ?dry=1 lists what it would do without changing anything.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const alerted = (l: Lead) => (l.activity ?? []).some((a) => a.type === "email" && a.text.startsWith("Lead alert emailed"));
const isSpam = (l: Lead) => (l.lost_reason ?? "").startsWith("Spam check");

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const report = { dry, moved: 0, moveFailed: 0, waitingInBackup: 0, alertsSent: 0, alertsFailed: 0, alertsDue: 0 };

  if (backupConfigured()) {
    const backup = await backupListLeads();
    report.waitingInBackup = backup.length;
    if (databaseConfigured() && !dry) {
      for (const lead of backup) {
        try {
          await importLead(lead);
          await backupDeleteLead(lead.id);
          report.moved++;
        } catch (e) {
          report.moveFailed++;
          console.error("LEAD_RECOVERY_MOVE_FAILED", lead.id, e);
        }
      }
      report.waitingInBackup -= report.moved;
    }
  }

  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
    const since = new Date(Date.now() - 3 * 864e5).toISOString();
    // Leave the last 10 minutes alone: those alerts may still be on their way.
    const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
    const due = (await listLeadsSince(since)).filter((l) => l.created_at < cutoff && !alerted(l) && !isSpam(l)).slice(0, 25);
    report.alertsDue = due.length;
    if (!dry) {
      for (const lead of due) {
        if (await notifyOwner(lead)) {
          report.alertsSent++;
          await updateLead(lead.id, {}, [{ type: "email", text: "Lead alert emailed to you (sent by the daily check)" }]).catch((e) =>
            console.error("recovery alert log not saved", lead.id, e),
          );
        } else report.alertsFailed++;
      }
    }
  }

  return Response.json(report);
}
