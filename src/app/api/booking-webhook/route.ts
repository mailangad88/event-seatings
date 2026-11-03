import { scoreLead } from "@/lib/lead-score";
import { notifyOwner } from "@/lib/notify";
import { addLead, listLeads, updateLead, type Lead } from "@/lib/store";

// Booking calendar webhook: when someone books a call (Calendly, Cal.com, HubSpot Meetings via a workflow, or
// Zapier), their lead moves to "Consult booked", which stops the follow-up emails. If they booked without
// sending a form first, a new call lead is created so nobody is missed.
// Set the webhook URL to /api/booking-webhook?key=$BOOKING_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const secret = process.env.BOOKING_WEBHOOK_SECRET;
  if (!secret || new URL(request.url).searchParams.get("key") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "bad request" }, { status: 400 });

  // Calendly: payload.email/name/scheduled_event.start_time. Cal.com: payload.attendees[0], payload.startTime.
  // Zapier or anything else: email, name, start_time at the top level.
  const p = (body.payload ?? body) as Record<string, unknown>;
  const attendee = (Array.isArray(p.attendees) ? p.attendees[0] : undefined) as Record<string, unknown> | undefined;
  const pick = (...v: unknown[]) => v.find((x): x is string => typeof x === "string" && x.trim() !== "")?.trim();
  const email = pick(p.email, attendee?.email, body.email)?.toLowerCase();
  const name = pick(p.name, attendee?.name, body.name);
  const scheduled = (p.scheduled_event ?? {}) as Record<string, unknown>;
  const start = pick(scheduled.start_time, p.startTime, p.start_time, body.start_time);
  const event = String(body.event ?? body.triggerEvent ?? "").toLowerCase();
  if (!email) return Response.json({ error: "no email in payload" }, { status: 400 });
  if (/cancel/.test(event)) return Response.json({ ok: true, ignored: "cancellation" });

  const when = start ? new Date(start).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) : "time not sent";
  const leads = (await listLeads()).filter((l) => l.email.toLowerCase() === email);
  const open = leads.filter((l) => !l.status || l.status === "new" || l.status === "contacted");
  for (const lead of open) {
    await updateLead(lead.id, { status: "consult_booked" }, [{ type: "call", text: `Call booked for ${when} (Chicago time)` }]);
  }
  if (!leads.length) {
    const lead: Omit<Lead, "id" | "created_at"> = {
      kind: "call",
      email,
      name,
      source: "booking-calendar",
      status: "consult_booked",
      message: `Booked a call directly on the calendar for ${when} (Chicago time).`,
      activity: [{ at: new Date().toISOString(), type: "call", text: `Call booked for ${when} (Chicago time)` }],
    };
    const score = scoreLead({ ...lead, id: "", created_at: new Date().toISOString() });
    lead.lead_score = score.grade;
    lead.lead_score_reasons = score.reasons.join("; ");
    const saved = await addLead(lead);
    await notifyOwner(saved);
  }
  return Response.json({ ok: true, updated: open.length, created: leads.length ? 0 : 1 });
}
