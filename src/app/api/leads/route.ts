import { after } from "next/server";
import { getChair } from "@/data/chairs";
import { syncToCrm } from "@/lib/crm";
import { notifyOwner } from "@/lib/notify";
import { addLead, trackingFields, type LeadKind, type NewLead } from "@/lib/store";

const kinds: LeadKind[] = ["quote", "waitlist", "quiz", "call"];

const str = (v: unknown, max = 200) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  // Honeypot: real visitors never see or fill this field.
  if (body.website) return Response.json({ ok: true });

  const kind = body.kind as LeadKind;
  const email = str(body.email, 254);
  if (!kinds.includes(kind) || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const eventDate = str(body.event_date, 10);
  const guests = Number(body.guest_count);

  const lead: NewLead = {
    kind,
    email,
    name: str(body.name),
    phone: str(body.phone, 40),
    event_date: eventDate && /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? eventDate : undefined,
    event_type: str(body.event_type, 60),
    guest_count: Number.isFinite(guests) && guests > 0 ? Math.min(Math.round(guests), 5000) : undefined,
    city: str(body.city, 100),
    venue: str(body.venue, 150),
    chairs: Array.isArray(body.chairs) ? body.chairs.filter((s: unknown) => typeof s === "string" && getChair(s)) : undefined,
    message: str(body.message, 2000),
    quiz_styles: Array.isArray(body.quiz_styles)
      ? body.quiz_styles.filter((s: unknown) => typeof s === "string").slice(0, 8)
      : undefined,
    source: str(body.source, 100),
    sms_consent: body.sms_consent === "yes" && Boolean(str(body.phone, 40)) ? true : undefined,
  };
  for (const f of trackingFields) {
    const v = str(body[f], 300);
    if (v) lead[f] = v;
  }

  if (kind === "call" && !lead.phone) {
    return Response.json({ error: "Please add a phone number so we can call you." }, { status: 400 });
  }

  if (kind === "quote" && (!lead.event_date || !lead.chairs?.length)) {
    return Response.json({ error: "Please pick an event date and at least one chair." }, { status: 400 });
  }

  const saved = await addLead(lead);
  // CRM sync and the owner email run after the visitor gets their answer, so a slow or failing CRM
  // never loses a lead: it's already saved above, and both helpers log their own errors.
  after(() => Promise.allSettled([syncToCrm(saved), notifyOwner(saved)]));
  return Response.json({ ok: true });
}
