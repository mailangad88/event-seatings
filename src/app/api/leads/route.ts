import { after } from "next/server";
import { getChair } from "@/data/chairs";
import { catalogItems } from "@/data/catalog";
import { imagesFor } from "@/data/rental-images";
import { priceQuote } from "@/lib/catalog-types";
import { syncToCrm } from "@/lib/crm";
import { getDownload } from "@/data/downloads";
import { isDisposableEmail } from "@/lib/disposable-email";
import { scoreLead } from "@/lib/lead-score";
import { notifyOwner, sendConfirmation, sendDownloadEmail } from "@/lib/notify";
import { cleanCode } from "@/lib/referrals";
import { addLead, trackingFields, type Lead, type LeadKind, type NewLead } from "@/lib/store";

const kinds: LeadKind[] = ["quote", "waitlist", "quiz", "call", "chat", "partner"];

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
  if (isDisposableEmail(email)) {
    return Response.json(
      { error: "That looks like a temporary inbox. Please use an email you check, so your quote and files reach you." },
      { status: 400 },
    );
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
    referral_code: cleanCode(body.referral_code),
    sms_consent: body.sms_consent === "yes" && Boolean(str(body.phone, 40)) ? true : undefined,
    // Consent per channel, each from its own tick box. Asking for a call is consent to be called about it.
    email_consent: body.email_consent === "yes" ? true : undefined,
    call_consent: (body.call_consent === "yes" || kind === "call") && Boolean(str(body.phone, 40)) ? true : undefined,
    visitor_tz: str(body.visitor_tz, 60),
    pages_viewed: str(body.pages_viewed, 1500),
  };
  if (lead.email_consent || lead.call_consent || lead.sms_consent) lead.consent_at = new Date().toISOString();
  for (const f of trackingFields) {
    const v = str(body[f], 300);
    if (v) lead[f] = v;
  }

  if (kind === "chat" && !lead.message) {
    return Response.json({ error: "Please type your question." }, { status: 400 });
  }

  // Listing correction/removal requests from /vendor-listings don't need a phone number.
  if (kind === "partner" && (!lead.name || !lead.venue || (!lead.phone && lead.source !== "vendor-listings"))) {
    return Response.json({ error: "Please add your name, company and phone number." }, { status: 400 });
  }

  if (kind === "call" && !lead.phone) {
    return Response.json({ error: "Please add a phone number so we can call you." }, { status: 400 });
  }

  // Quote builder picks: re-priced here from the catalog, never from numbers the browser sent.
  if (Array.isArray(body.items)) {
    const picks = body.items
      .slice(0, 200)
      .filter((p: unknown): p is { id: string; qty: number } => !!p && typeof (p as { id?: unknown }).id === "string")
      .map((p: { id: string; qty: unknown }) => ({ id: p.id, qty: Number(p.qty) }));
    const quote = priceQuote(picks, catalogItems);
    // Colour choices: only keys that exist as a rendered variant of that item are kept.
    const colours = new Map<string, string>(
      body.items
        .slice(0, 200)
        .filter((p: { id?: unknown; variant?: unknown }) => typeof p?.id === "string" && typeof p?.variant === "string")
        .map((p: { id: string; variant: string }) => [p.id, p.variant]),
    );
    for (const line of quote.lines) {
      const v = colours.get(line.id);
      if (v && imagesFor(line.id).some((img) => img.kind === "variant" && img.variant === v)) {
        line.variant = v;
        line.name = `${line.name} (${v.replace(/-/g, " ")})`;
      }
    }
    if (quote.lines.length) {
      lead.items = quote.lines;
      lead.quote_subtotal = quote.subtotal;
      lead.quote_cost = quote.cost;
      // Keep the chair list in step so chair demand stats and the CRM's "chairs wanted" still work.
      const slugs = quote.lines
        .map((l) => catalogItems.find((i) => i.id === l.id)?.chairSlug)
        .filter((s): s is string => !!s && !!getChair(s));
      lead.chairs = [...new Set([...(lead.chairs ?? []), ...slugs])];
    }
  }
  const score = scoreLead({ ...lead, id: "", created_at: new Date().toISOString() });
  lead.lead_score = score.grade;
  lead.lead_score_reasons = score.reasons.join("; ");
  lead.status = "new";
  lead.activity = [{ at: new Date().toISOString(), type: "status", text: `Lead received from ${lead.source ?? kind}` }];

  if (kind === "quote" && (!lead.event_date || !(lead.chairs?.length || lead.items?.length))) {
    return Response.json({ error: "Please pick an event date and at least one item." }, { status: 400 });
  }

  let saved: Lead;
  try {
    saved = await addLead(lead);
  } catch (error) {
    // Storage is down or not configured (for example Supabase env vars missing on Vercel, where the
    // local JSON fallback can't write). Never lose the lead: log it in full so it can be recovered from
    // the function logs, still email the owner and sync the CRM, and thank the visitor as normal.
    saved = { ...lead, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    console.error("LEAD_SAVE_FAILED", error, JSON.stringify(saved));
  }
  // CRM sync and the owner email run after the visitor gets their answer, so a slow or failing CRM
  // never loses a lead: it's already saved above, and both helpers log their own errors.
  const download = lead.source?.startsWith("download:") ? getDownload(lead.source.slice(9).split("@")[0]) : undefined;
  after(() =>
    Promise.allSettled([
      syncToCrm(saved),
      notifyOwner(saved),
      sendConfirmation(saved),
      ...(download ? [sendDownloadEmail(saved, download.title, download.files)] : []),
    ]),
  );
  return Response.json({ ok: true });
}
