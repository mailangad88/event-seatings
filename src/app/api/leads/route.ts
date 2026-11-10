import { after } from "next/server";
import { getChair } from "@/data/chairs";
import { catalogItems } from "@/data/catalog";
import { imagesFor } from "@/data/rental-images";
import { priceQuote } from "@/lib/catalog-types";
import { syncToCrm } from "@/lib/crm";
import { getDownload } from "@/data/downloads";
import { isDisposableEmail } from "@/lib/disposable-email";
import { scoreLead } from "@/lib/lead-score";
import { notifyOwner, sendConfirmation, sendDownloadEmail, sendSavedList } from "@/lib/notify";
import { cleanCode } from "@/lib/referrals";
import { sequenceLabel } from "@/lib/followups";
import { interestsFor, interestSummary } from "@/lib/interests";
import { deviceFromUserAgent, locationFromHeaders, parseJourney } from "@/lib/journey";
import { isVisitorId } from "@/lib/activity";
import { spamReason } from "@/lib/lead-spam";
import { bodyTooLarge, limitRequest } from "@/lib/rate-limit";
import { linkVisitor, saveNewLead, trackingFields, updateLead, type Lead, type LeadKind, type NewLead } from "@/lib/store";
import { TERMS_VERSION } from "@/lib/terms";

const kinds: LeadKind[] = ["quote", "waitlist", "quiz", "call", "chat", "partner"];

// Abuse limits: 8 submissions per IP per 10 minutes (src/lib/rate-limit.ts, shared through Upstash when set),
// and one automated visitor email per address per day (per server instance). A Vercel Firewall rate-limit rule
// on /api/leads is the durable version.
const emailed = new Map<string, number>();
// Submission ids seen recently on this server instance. The database and backup catch repeats across
// instances; this also catches them when every store is down, so a double click never sends two alerts.
// Only ids that were saved (or handled) go in, so a form turned down for a typo can be fixed and sent again.
const recentIds = new Map<string, number>();
const seenRecently = (id: string) => (recentIds.get(id) ?? 0) > Date.now() - 24 * 3600_000;
function remember(id?: string) {
  if (!id) return;
  if (recentIds.size > 5000) recentIds.clear();
  recentIds.set(id, Date.now());
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Largest body a real form sends (the planner with its page history is about 30 KB).
const MAX_BODY = 256 * 1024;

function firstEmailToday(email: string) {
  const key = email.toLowerCase();
  const last = emailed.get(key);
  if (last && Date.now() - last < 24 * 3600_000) return false;
  if (emailed.size > 5000) emailed.clear();
  emailed.set(key, Date.now());
  return true;
}

// Real calendar date check (the regex alone lets 2026-02-31 through, which the database then rejects).
const validDate = (d: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const dt = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === d;
};

const str = (v: unknown, max = 200) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

// Page paths from the browser are shown as links in /admin, so only keep same-site paths ("/x", never "//host").
const pathFields = new Set<string>(["page_path", "landing_page", "first_landing_page"]);
const sitePath = (v: string) => /^\/(?![/\\])[\w\-./%~+]{0,200}$/.test(v.split(/[?#]/)[0]);

export async function POST(request: Request) {
  const tooBig = bodyTooLarge(request, MAX_BODY);
  if (tooBig) return tooBig;
  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY) return Response.json({ error: "That form was too large to send." }, { status: 413 });
  // Same loose shape request.json() gave before; every field is checked one by one below.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  // Honeypot: real visitors never see or fill this field.
  if (body.website) return Response.json({ ok: true });
  const limited = await limitRequest(request, "leads", { limit: 8, windowMs: 10 * 60_000, message: "Too many requests. Please try again in a few minutes." });
  if (limited) return limited;

  // The browser's id for this submission (lib/lead-client.ts). The same form sent twice carries the same id.
  const submissionId = [body.submission_id, request.headers.get("idempotency-key")].find(
    (v): v is string => typeof v === "string" && uuid.test(v),
  )?.toLowerCase();
  if (submissionId && seenRecently(submissionId)) return Response.json({ ok: true, duplicate: true });

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
    event_date: eventDate && validDate(eventDate) ? eventDate : undefined,
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
    ip_location: locationFromHeaders(request.headers),
    // The browser's random visitor id: links this lead to what they look at afterwards (reminder emails).
    visitor_id: isVisitorId(body.visitor_id) ? body.visitor_id : undefined,
  };
  // Pages, clicks and visits from the visitor's browser (empty if they turned it off), plus device and rough
  // location worked out here from the request.
  const journey = parseJourney(body.journey);
  if (journey) lead.journey = { ...journey, device: deviceFromUserAgent(request.headers.get("user-agent")), location: lead.ip_location };
  if (lead.email_consent || lead.call_consent || lead.sms_consent) lead.consent_at = new Date().toISOString();
  // "I agree to the Terms and Conditions" on the quote form: keep when and which version.
  if (body.terms_agree === "yes") {
    lead.terms_accepted_at = new Date().toISOString();
    lead.terms_version = TERMS_VERSION;
  }
  for (const f of trackingFields) {
    const v = str(body[f], 300);
    if (v && (!pathFields.has(f) || sitePath(v))) lead[f] = v;
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
  if (lead.phone && (lead.phone.replace(/\D/g, "").length < 7 || lead.phone.replace(/\D/g, "").length > 15)) {
    return Response.json({ error: "Please check your phone number. It should have 10 digits, like 312-555-0123." }, { status: 400 });
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
  lead.interests = interestSummary(interestsFor(lead)).slice(0, 300) || undefined;
  lead.sequence = sequenceLabel({ ...lead, id: "", created_at: new Date().toISOString() });
  lead.activity = [{ at: new Date().toISOString(), type: "status", text: `Lead received from ${lead.source ?? kind}` }];

  if (kind === "quote" && (!lead.event_date || !(lead.chairs?.length || lead.items?.length))) {
    return Response.json({ error: "Please pick an event date and at least one item." }, { status: 400 });
  }

  // Spam is saved (so a real person caught by mistake can be found in /admin) but gets no alert, CRM or email.
  const formMs = Number(body.form_ms);
  const spam = spamReason({ ...lead, form_ms: body.form_ms === undefined ? undefined : formMs });
  if (spam) {
    lead.status = "lost";
    lead.lost_reason = `Spam check: ${spam}`;
    lead.activity = [...(lead.activity ?? []), { at: new Date().toISOString(), type: "status", text: `Held as spam (${spam}). No emails sent.` }];
    await saveNewLead(lead, { id: submissionId }).catch((e) => console.error("spam lead not saved", e));
    remember(submissionId);
    console.warn("LEAD_HELD_AS_SPAM", spam, lead.email);
    return Response.json({ ok: true });
  }

  let saved: Lead;
  try {
    const result = await saveNewLead(lead, { id: submissionId });
    // Already saved from an earlier send of the same form: thank them again but send nothing twice.
    if (result.duplicate) return Response.json({ ok: true, duplicate: true });
    saved = result.lead;
  } catch (error) {
    // Storage is down or not configured (for example Supabase env vars missing on Vercel, where the
    // local JSON fallback can't write). Never lose the lead: log it in full so it can be recovered from
    // the function logs, still email the owner and sync the CRM, and thank the visitor as normal.
    saved = { ...lead, id: submissionId ?? crypto.randomUUID(), created_at: new Date().toISOString() };
    console.error("LEAD_SAVE_FAILED", error, JSON.stringify(saved));
  }
  remember(submissionId);
  if (saved.visitor_id) await linkVisitor(saved.visitor_id).catch((e) => console.error("visitor link not saved", e));
  // CRM sync and the owner email run after the visitor gets their answer, so a slow or failing CRM
  // never loses a lead: it's already saved above, and both helpers log their own errors.
  const download = lead.source?.startsWith("download:") ? getDownload(lead.source.slice(9).split("@")[0]) : undefined;
  after(async () => {
    const [, alert, visitor] = await Promise.allSettled([
      syncToCrm(saved),
      notifyOwner(saved),
      // At most one automated visitor email per address per day (download links win over a confirmation).
      firstEmailToday(saved.email)
        ? download
          ? sendDownloadEmail(saved, download.title, download.files)
          : saved.source?.startsWith("saved-list")
            ? sendSavedList(saved)
            : sendConfirmation(saved)
        : Promise.resolve(undefined),
    ]);
    // Log every email in full on the lead's timeline, so the record in /admin shows exactly what went
    // out, not just that something was sent.
    const log: { type: "email"; text: string; html?: string }[] = [];
    if (alert.status === "fulfilled" && alert.value) log.push({ type: "email", text: "Lead alert emailed to you" });
    if (visitor.status === "fulfilled" && visitor.value) {
      const sent = visitor.value;
      log.push({ type: "email", text: `To: ${saved.email}\nSubject: ${sent.subject}\n\n${sent.text}`, html: sent.html });
    }
    if (log.length) await updateLead(saved.id, {}, log).catch((e) => console.error("email log not saved", saved.id, e));
  });
  return Response.json({ ok: true });
}
