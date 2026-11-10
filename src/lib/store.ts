import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { attributionKeys } from "./attribution";
import { mergeActivity, type ActivityEvent } from "./activity";
import { backupConfigured, backupDeleteLead, backupGetJson, backupGetLead, backupListLeads, backupPutJson, backupPutLead } from "./lead-backup";
import { isTransient, withRetry } from "./retry";
import type { QuoteLine } from "./catalog-types";
import type { FeeLine } from "./fees";
import type { Journey } from "./journey";
import type { VendorOrders } from "./orders";
import type { Intake } from "./intake";

// Storage for votes and leads.
// - With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set, data goes to Supabase (use this in production).
// - Without them, data goes to a local JSON file (.data/db.json) so you can develop with no setup.

// "chat" = a message sent from the chat dock when HubSpot live chat is not switched on.
// "partner" = a rental company applying on /partners to receive leads.
export type LeadKind = "quote" | "waitlist" | "quiz" | "call" | "chat" | "partner";

export type Lead = {
  id: string;
  kind: LeadKind;
  created_at: string;
  name?: string;
  email: string;
  phone?: string;
  event_date?: string;
  event_type?: string;
  guest_count?: number;
  city?: string;
  venue?: string;
  chairs?: string[];
  message?: string;
  quiz_styles?: string[];
  source?: string;
  // Only true when the visitor ticked "Text me about my quote" (needed before any automated SMS).
  sms_consent?: boolean;
  // Consent is recorded per channel. email_consent = OK to send planning tips and follow-ups beyond the reply to
  // their own request; call_consent = OK to phone them. consent_at = when they gave it, with the form it came from.
  email_consent?: boolean;
  call_consent?: boolean;
  consent_at?: string;
  // When the customer ticked "I agree to the Terms and Conditions" (quote form or proposal) and which version of
  // /terms that was (TERMS_VERSION in lib/terms.ts).
  terms_accepted_at?: string;
  terms_version?: string;
  // Set by the unsubscribe link: no more automated email of any kind to this address.
  opted_out_at?: string;
  // A/B/C from lib/lead-score.ts, with the reasons, set when the lead arrives.
  lead_score?: string;
  lead_score_reasons?: string;
  // Browser time zone and the pages the visitor viewed before sending (oldest first).
  visitor_tz?: string;
  pages_viewed?: string;
  // Pages (with titles and times), clicks, visits, device and approximate location before the form (lib/journey.ts).
  journey?: Journey;
  ip_location?: string;
  // Top interests when the lead arrived (lib/interests.ts), e.g. "Tents, Lighting · Weddings", and the follow-up
  // email set picked from them (lib/followups.ts), e.g. "request:tents".
  interests?: string;
  sequence?: string;
  // Follow-up sequence progress (lib/followups.ts): how many emails went out and when the last one did.
  followup_step?: number;
  followup_last_at?: string;
  // Quote builder: the priced line items (customer price + our vendor cost per line) and totals.
  items?: QuoteLine[];
  quote_subtotal?: number; // what the customer saw, at our prices (supplier rate + MARKUP)
  quote_cost?: number; // what the vendors charge us
  // Delivery/setup/teardown/waiver/tax, edited in /admin/leads/<id>/quote. Unset = not yet touched by
  // an admin, so the proposal and payment link fall back to the computed estimate (lib/fees.ts).
  fee_lines?: FeeLine[];
  // Override of the automatic first-booking $50 offer (lib/offers.ts), set the same way. 0 removes it;
  // unset falls back to the automatic rule.
  discount_amount?: number;
  // Free text from /admin/leads/<id>/quote, shown to the customer on their proposal page and in the
  // "Send updated quote" email (e.g. "pickup is the Monday after, not the Sunday" or a delivery window).
  quote_notes?: string;
  // CRM fields, edited in /admin/leads.
  status?: LeadStatus;
  assigned_vendor?: string;
  follow_up_at?: string; // YYYY-MM-DD
  lost_reason?: string;
  activity?: LeadActivity[];
  updated_at?: string;
  // Customer proposal (/proposal/<token>). The rental partner's name stays hidden on it until fee_status is "paid",
  // so the deposit (or a refundable hold) is collected before we place the order.
  proposal_token?: string;
  proposal_created_at?: string;
  fee_status?: FeeStatus;
  fee_amount?: number; // USD charged at checkout (deposit or hold)
  fee_paid_at?: string;
  stripe_session_id?: string;
  // Event to-dos ticked off in /admin (lib/event-tasks.ts): task key -> when it was done.
  tasks_done?: Record<string, string>;
  // Referral link code (/refer, ?ref=<code>) that brought this visitor in, kept 90 days in their browser.
  referral_code?: string;
  // One part per rental partner on the order (vendor_id of the item lines): its confirmation link
  // /vendor/confirm/<token>, the partner's answer, and delivery / pickup / payment marks (lib/orders.ts).
  vendor_orders?: VendorOrders;
  // Messages between the renter (in /account) and our team (in /admin/messages), oldest first.
  messages?: LeadMessage[];
  // Random id from the visitor's browser (es_visitor). Links the lead to what they do after sending the form
  // (visitor_activity), which the reminder emails use. Unset on old leads.
  visitor_id?: string;
  // Answers from the call script (/admin/leads/<id>/script, lib/intake.ts) that have no column of their own.
  intake?: Intake;
} & Partial<Record<TrackingField, string>>;

export type LeadMessage = { at: string; from: "customer" | "team"; text: string; read_at?: string };

export type FeeStatus = "unpaid" | "paid" | "refunded";

// Pipeline stages, in order. Follows the customer success playbook, with a vendor step for the
// referral model (we book the event with a partner rental company).
export const leadStatuses = [
  { id: "new", label: "New lead" },
  { id: "contacted", label: "Contacted" },
  { id: "consult_booked", label: "Consult booked" },
  { id: "quote_sent", label: "Quote sent" },
  { id: "vendor_confirmed", label: "Vendor confirmed" },
  { id: "booked", label: "Booked" },
  { id: "completed", label: "Completed" },
  { id: "future_season", label: "Future season" },
  { id: "lost", label: "Lost" },
] as const;
export type LeadStatus = (typeof leadStatuses)[number]["id"];
export const statusLabel = (s?: string) => leadStatuses.find((x) => x.id === s)?.label ?? "New lead";
export const isLeadStatus = (s: unknown): s is LeadStatus => leadStatuses.some((x) => x.id === s);

export type LeadActivity = {
  at: string;
  type: "note" | "status" | "call" | "email" | "text" | "vendor" | "follow_up";
  text: string;
  // "email" entries only: the exact HTML that was sent, so the admin can preview it as the customer
  // saw it, not just read the plain text. Unset on entries logged before this existed, and on emails
  // RESEND_API_KEY wasn't configured for (no HTML was ever rendered).
  html?: string;
};

// Marketing attribution saved with every lead: last touch (the visit that converted), first touch
// (prefixed first_, the visit that discovered us) and the page the form was on.
export const trackingFields = [
  ...attributionKeys,
  ...attributionKeys.map((k) => `first_${k}` as const),
  "page_path",
] as const;
export type TrackingField = (typeof trackingFields)[number];

export type NewLead = Omit<Lead, "id" | "created_at">;

type Vote = { chair_slug: string; visitor_id: string; created_at: string };

// One row per page view, sent by PageViewTracker. Powers visits and conversion rates in /admin.
export type PageView = { path: string; visitor_id: string; source?: string; created_at: string };

// Our relationship with each rental vendor (the vendor list itself is in src/data/vendors.ts). Edited in /admin/vendors.
export const partnerStatuses = [
  { id: "not_contacted", label: "Not contacted" },
  { id: "contacted", label: "Contacted" },
  { id: "talking", label: "In talks" },
  { id: "signed", label: "Referral deal signed" },
  { id: "declined", label: "Declined" },
] as const;
export type PartnerStatus = (typeof partnerStatuses)[number]["id"];
export const partnerStatusLabel = (s?: string) => partnerStatuses.find((x) => x.id === s)?.label ?? "Not contacted";
export const isPartnerStatus = (s: unknown): s is PartnerStatus => partnerStatuses.some((x) => x.id === s);

export type VendorPartner = {
  vendor_id: string;
  status: PartnerStatus;
  contact_name?: string; // the person to ask for
  contact_role?: string;
  contact_phone?: string; // direct line, if different from the main number
  contact_email?: string;
  referral_terms?: string; // e.g. "10% referral fee on rental subtotal"
  notes?: string;
  last_contacted_at?: string; // YYYY-MM-DD
  // Commission statements (/admin/invoices): month YYYY-MM -> when the statement was sent and when they paid.
  commission_log?: Record<string, { sent_at?: string; paid_at?: string; amount?: number }>;
  activity?: LeadActivity[];
  updated_at?: string;
};

// A renter's sign-in record (/account). Keyed by lower-case email; their events are the leads with that email.
// saved_events / saved_ideas mirror the browser's My events plans and idea board so they follow the renter
// to any device. last_login_at makes each emailed sign-in link work once.
export type CustomerAccount = {
  email: string;
  created_at: string;
  name?: string;
  phone?: string;
  last_login_at?: string;
  saved_events?: unknown[];
  saved_ideas?: unknown[];
  updated_at?: string;
};
export type AccountPatch = Partial<Omit<CustomerAccount, "email" | "created_at">>;

type LocalDb = {
  votes: Vote[];
  leads: Lead[];
  views?: PageView[];
  partners?: VendorPartner[];
  accounts?: CustomerAccount[];
  activity?: Record<string, ActivityEvent[]>;
  settings?: Record<string, unknown>;
};

let supabase: SupabaseClient | null | undefined;
function sb() {
  if (supabase === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return supabase;
}

// True when leads go to Supabase (production). False means the Blob backup or the local file.
export const databaseConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const dbFile = path.join(process.cwd(), ".data", "db.json");

async function readLocal(): Promise<LocalDb> {
  try {
    return JSON.parse(await fs.readFile(dbFile, "utf8"));
  } catch {
    return { votes: [], leads: [], views: [] };
  }
}

// Write to a temp file and rename, so two saves at once can never leave a half-written (broken) file.
async function writeLocal(db: LocalDb) {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  const tmp = `${dbFile}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, dbFile);
}

export async function setVote(chairSlug: string, visitorId: string, on: boolean) {
  voteCountsCache = undefined;
  const client = sb();
  if (client) {
    const { error } = on
      ? await client
          .from("votes")
          .upsert({ chair_slug: chairSlug, visitor_id: visitorId }, { onConflict: "chair_slug,visitor_id" })
      : await client.from("votes").delete().match({ chair_slug: chairSlug, visitor_id: visitorId });
    if (error) throw error;
    return;
  }
  const db = await readLocal();
  db.votes = db.votes.filter((v) => !(v.chair_slug === chairSlug && v.visitor_id === visitorId));
  if (on) db.votes.push({ chair_slug: chairSlug, visitor_id: visitorId, created_at: new Date().toISOString() });
  await writeLocal(db);
}

async function allVotes(): Promise<Vote[]> {
  const client = sb();
  if (client) {
    const rows: Vote[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client.from("votes").select("chair_slug, visitor_id, created_at").range(from, from + 999);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) return rows;
    }
  }
  return (await readLocal()).votes;
}

// Vote totals change slowly and every vote button asks for them, so keep them for a minute per server
// instance instead of reading the whole votes table on each request. A vote on this instance clears it.
let voteCountsCache: { at: number; counts: Record<string, number> } | undefined;
const VOTE_COUNTS_TTL = 60_000;

export async function getVoteCounts(): Promise<Record<string, number>> {
  if (voteCountsCache && Date.now() - voteCountsCache.at < VOTE_COUNTS_TTL) return { ...voteCountsCache.counts };
  const counts: Record<string, number> = {};
  for (const v of await allVotes()) counts[v.chair_slug] = (counts[v.chair_slug] ?? 0) + 1;
  voteCountsCache = { at: Date.now(), counts };
  return { ...counts };
}

export async function getVisitorVotes(visitorId: string): Promise<string[]> {
  const client = sb();
  if (client) {
    // Just this visitor's rows, so it stays right past the 1,000-row page limit.
    const { data, error } = await client.from("votes").select("chair_slug").eq("visitor_id", visitorId).limit(1000);
    if (error) throw error;
    return (data ?? []).map((v: { chair_slug: string }) => v.chair_slug);
  }
  return (await allVotes()).filter((v) => v.visitor_id === visitorId).map((v) => v.chair_slug);
}

// Columns added after the first launch. Kept here so a not-yet-migrated database can still take leads.
const newerLeadColumns = [
  "email_consent", "call_consent", "consent_at", "opted_out_at", "lead_score", "lead_score_reasons",
  "visitor_tz", "pages_viewed", "followup_step", "followup_last_at", "referral_code",
  "journey", "ip_location", "interests", "sequence", "visitor_id",
  "vendor_orders", "intake", "terms_accepted_at", "terms_version",
] as const;

// Where leads live when Supabase isn't set up: the private Blob backup on Vercel (lib/lead-backup.ts), or
// .data/db.json on a developer's computer. With Supabase set up, the backup only holds leads the database
// refused, and those are shown alongside database leads until the recovery job moves them in.
async function fallbackLeads(): Promise<Lead[]> {
  if (backupConfigured()) return backupListLeads();
  return (await readLocal()).leads;
}

async function fallbackGet(id: string): Promise<Lead | undefined> {
  if (backupConfigured()) return backupGetLead(id);
  return (await readLocal()).leads.find((l) => l.id === id);
}

async function fallbackSave(lead: Lead): Promise<"backup" | "local"> {
  if (backupConfigured()) {
    await backupPutLead(lead);
    return "backup";
  }
  const db = await readLocal();
  const i = db.leads.findIndex((l) => l.id === lead.id);
  if (i >= 0) db.leads[i] = lead;
  else db.leads.push(lead);
  await writeLocal(db);
  return "local";
}

// Backup leads waiting to move into the database. Never throws: a backup hiccup must not break /admin.
async function orphanLeads(): Promise<Lead[]> {
  if (!backupConfigured()) return [];
  return backupListLeads().catch((e) => {
    console.error("lead backup list failed", e);
    return [];
  });
}

// First copy of each id wins (a before b), so a lead is never listed twice.
const mergeById = (a: Lead[], b: Lead[]) => {
  const seen = new Set<string>();
  return [...a, ...b].filter((l) => !seen.has(l.id) && Boolean(seen.add(l.id)));
};

const isUuid = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

type DbError = { code?: string; message: string };

// Writes one lead row with a short retry for network blips. Falls back to the original columns when
// supabase/schema.sql hasn't been re-run yet. `upsert` leaves an existing row with the same id untouched.
async function insertLeadRow(client: SupabaseClient, full: Lead, mode: "insert" | "upsert"): Promise<DbError | null> {
  const write = async (row: Record<string, unknown>) => {
    const res = await withRetry(
      async () => {
        const r =
          mode === "insert"
            ? await client.from("leads").insert(row)
            : await client.from("leads").upsert(row, { onConflict: "id", ignoreDuplicates: true });
        // Throw temporary errors so withRetry tries again; hand back everything else.
        if (r.error && isTransient(r.error)) throw r.error;
        return r;
      },
      { attempts: 3, baseMs: 250, shouldRetry: isTransient },
    );
    return res.error as DbError | null;
  };
  const error = await write(full as unknown as Record<string, unknown>);
  if (!error) return null;
  if (error.code === "PGRST204" || (/column/i.test(error.message) && error.code !== "23505")) {
    const legacy: Record<string, unknown> = { ...full };
    for (const k of newerLeadColumns) delete legacy[k];
    const retryError = await write(legacy);
    if (!retryError) {
      console.warn("LEAD_SAVED_WITHOUT_NEW_COLUMNS: re-run supabase/schema.sql", error.message);
      return null;
    }
    return retryError;
  }
  return error;
}

export type SaveResult = {
  lead: Lead;
  // True when this submission was already saved (double click, browser retry): send nothing again.
  duplicate: boolean;
  storedIn: "database" | "backup" | "local";
};

/**
 * Saves a new lead. `id` is the browser's submission id (lib/lead-client.ts): sending the same form twice
 * gives the same id, so the second save is spotted and reported as a duplicate instead of a second lead.
 * Order: Supabase (with retries), then the Blob backup, then the local file. Throws only when every
 * store failed; the route then logs the lead in full (LEAD_SAVE_FAILED) and still emails it.
 */
export async function saveNewLead(lead: NewLead, opts: { id?: string } = {}): Promise<SaveResult> {
  const full: Lead = { ...lead, id: isUuid(opts.id) ? opts.id.toLowerCase() : crypto.randomUUID(), created_at: new Date().toISOString() };
  const client = sb();
  if (client) {
    let error: DbError | null;
    try {
      error = await insertLeadRow(client, full, "insert");
    } catch (e) {
      error = e && typeof e === "object" && "message" in e ? (e as DbError) : { message: String(e) };
    }
    if (!error) return { lead: full, duplicate: false, storedIn: "database" };
    if (error.code === "23505") {
      const existing = await getLead(full.id).catch(() => undefined);
      return { lead: existing ?? full, duplicate: true, storedIn: "database" };
    }
    if (!backupConfigured()) throw error;
    console.error("LEAD_DB_SAVE_FAILED, saving to backup", error);
  }
  const existing = await fallbackGet(full.id).catch(() => undefined);
  if (existing) return { lead: existing, duplicate: true, storedIn: backupConfigured() ? "backup" : "local" };
  return { lead: full, duplicate: false, storedIn: await fallbackSave(full) };
}

export async function addLead(lead: NewLead): Promise<Lead> {
  return (await saveNewLead(lead)).lead;
}

/**
 * Copies a lead into the database, keeping any row that already has its id. Used by the recovery job to
 * move backup leads (and leads recovered from logs) in. Returns false when there is no database.
 */
export async function importLead(lead: Lead): Promise<boolean> {
  const client = sb();
  if (!client) return false;
  const error = await insertLeadRow(client, lead, "upsert");
  if (error) throw error;
  return true;
}

// Reads every row of a table 1,000 at a time. The first page also returns the total, so the rest are fetched
// four at a time instead of one after another (a few thousand leads load in a couple of round trips).
async function readAllPages<T>(
  page: (from: number, to: number, withCount: boolean) => PromiseLike<{ data: T[] | null; error: DbError | null; count?: number | null }>,
  cap = 200_000,
): Promise<T[]> {
  const size = 1000;
  const first = await page(0, size - 1, true);
  if (first.error) throw first.error;
  const rows = [...(first.data ?? [])];
  const total = Math.min(first.count ?? rows.length, cap);
  if (rows.length < size || total <= size) return rows;
  const starts: number[] = [];
  for (let from = size; from < total; from += size) starts.push(from);
  for (let i = 0; i < starts.length; i += 4) {
    const pages = await Promise.all(starts.slice(i, i + 4).map((from) => page(from, from + size - 1, false)));
    for (const p of pages) {
      if (p.error) throw p.error;
      rows.push(...(p.data ?? []));
    }
  }
  return rows;
}

// Every lead, newest first. Wrapped in React cache(), so the admin layout, its sidebar counts and the page
// share one read per request instead of each loading every lead again.
const loadLeads = cache(async (): Promise<Lead[]> => {
  const client = sb();
  if (client) {
    const rows = await readAllPages<Lead>((from, to, withCount) =>
      client
        .from("leads")
        .select("*", withCount ? { count: "exact" } : undefined)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    );
    // mergeById also drops a row seen twice when a lead arrived between two page reads.
    return mergeById(rows, await orphanLeads()).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  return (await fallbackLeads()).sort((a, b) => b.created_at.localeCompare(a.created_at));
});

export async function listLeads(): Promise<Lead[]> {
  return [...(await loadLeads())];
}

// Leads that have at least one rental-partner order part, with just the fields needed to find a confirmation
// link's token. Much lighter than listLeads() when the link page is opened.
export async function findLeadIdByVendorToken(token: string): Promise<string | undefined> {
  const has = (v?: VendorOrders | null) => Object.values(v ?? {}).some((o) => o?.token === token);
  const client = sb();
  if (client) {
    const rows = await readAllPages<{ id: string; vendor_orders: VendorOrders | null }>((from, to, withCount) =>
      client
        .from("leads")
        .select("id, vendor_orders", withCount ? { count: "exact" } : undefined)
        .not("vendor_orders", "is", null)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    );
    const hit = rows.find((r) => has(r.vendor_orders));
    if (hit) return hit.id;
    return (await orphanLeads()).find((l) => has(l.vendor_orders))?.id;
  }
  return (await fallbackLeads()).find((l) => has(l.vendor_orders))?.id;
}

export async function getLead(id: string): Promise<Lead | undefined> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("*").eq("id", id).maybeSingle();
    if (error && !/uuid/i.test(error.message)) throw error;
    if (data) return data;
    return backupConfigured() ? backupGetLead(id).catch(() => undefined) : undefined;
  }
  return fallbackGet(id);
}

export type LeadPatch = Partial<
  Pick<
    Lead,
    | "status"
    | "assigned_vendor"
    | "follow_up_at"
    | "lost_reason"
    | "activity"
    | "proposal_token"
    | "proposal_created_at"
    | "fee_status"
    | "fee_amount"
    | "fee_paid_at"
    | "stripe_session_id"
    | "followup_step"
    | "followup_last_at"
    | "opted_out_at"
    | "tasks_done"
    | "items"
    | "quote_subtotal"
    | "quote_cost"
    | "fee_lines"
    | "discount_amount"
    | "quote_notes"
    | "vendor_orders"
    | "messages"
    | "intake"
    | "terms_accepted_at"
    | "terms_version"
    // Edited from the call script when the customer corrects or adds them on the phone.
    | "name"
    | "phone"
    | "email"
    | "event_type"
    | "event_date"
    | "guest_count"
    | "city"
    | "venue"
  >
>;

// Looks up the lead behind a customer proposal link. Tokens are random 32-character strings, so the link is the key.
export async function getLeadByProposalToken(token: string): Promise<Lead | undefined> {
  if (!/^[a-f0-9]{32}$/.test(token)) return undefined;
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("*").eq("proposal_token", token).maybeSingle();
    if (error) throw error;
    return data ?? undefined;
  }
  return (await fallbackLeads()).find((l) => l.proposal_token === token);
}

// Applies CRM edits and appends `log` to the lead's activity timeline in one write. An entry can carry its
// own `at` (e.g. logging a call that happened earlier today) — most callers leave it unset and get `now`.
export async function updateLead(id: string, patch: LeadPatch, log: (Omit<LeadActivity, "at"> & { at?: string })[] = []) {
  const lead = await getLead(id);
  if (!lead) throw new Error(`Lead ${id} not found`);
  const now = new Date().toISOString();
  const activity = [...(lead.activity ?? []), ...log.map((a) => ({ ...a, at: a.at ?? now }))].sort((a, b) => a.at.localeCompare(b.at));
  // Supabase needs explicit nulls to clear a column; undefined would be skipped.
  const changes: Record<string, unknown> = { updated_at: now, activity };
  for (const [k, v] of Object.entries(patch)) changes[k] = v === undefined || v === "" ? null : v;
  const merged = () => {
    const next = { ...lead, ...changes } as Record<string, unknown>;
    for (const k of Object.keys(next)) if (next[k] === null) delete next[k];
    return next as Lead;
  };

  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").update(changes).eq("id", id).select("id");
    if (error) throw error;
    if (data?.length) return;
    // Only in the backup so far: move it into the database with the change, or update the backup copy.
    if (backupConfigured()) {
      const next = merged();
      if (await importLead(next).then(() => true, () => false)) {
        await backupDeleteLead(id).catch((e) => console.error("backup delete failed", id, e));
      } else {
        await backupPutLead(next);
      }
    }
    return;
  }
  await fallbackSave(merged());
}

// Marks every lead with this email as opted out (unsubscribe link). Returns how many rows changed.
export async function optOutEmail(email: string) {
  const now = new Date().toISOString();
  const target = email.trim().toLowerCase();
  const client = sb();
  let n = 0;
  if (client) {
    const { data, error } = await client
      .from("leads")
      .update({ opted_out_at: now, updated_at: now })
      .ilike("email", target)
      .is("opted_out_at", null)
      .select("id");
    if (error) throw error;
    n = data?.length ?? 0;
  }
  // Leads in the backup (or the local file) are opted out too, so a recovered lead never gets emailed.
  const rest = client ? await orphanLeads() : await fallbackLeads();
  for (const l of rest) {
    if (l.email.toLowerCase() === target && !l.opted_out_at) {
      await fallbackSave({ ...l, opted_out_at: now, updated_at: now });
      n++;
    }
  }
  return n;
}

// Every lead from this email address, newest first (earlier enquiries from the same person).
export async function listLeadsByEmail(email: string): Promise<Lead[]> {
  const target = email.trim().toLowerCase();
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("*").ilike("email", target.replace(/[%_\\]/g, "\\$&")).order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return data ?? [];
  }
  return (await fallbackLeads()).filter((l) => l.email.toLowerCase() === target).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Leads created since `since`, for the follow-up sequence, the weekly report and the recovery job.
export async function listLeadsSince(since: string): Promise<Lead[]> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("*").gte("created_at", since).order("created_at");
    if (error) throw error;
    const orphans = (await orphanLeads()).filter((l) => l.created_at >= since);
    return mergeById(data ?? [], orphans).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  return (await fallbackLeads()).filter((l) => l.created_at >= since).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

const VIEWS_BACKUP_PATH = "views/all.json";

export async function addPageView(view: Omit<PageView, "created_at">) {
  const row: PageView = { ...view, created_at: new Date().toISOString() };
  const client = sb();
  if (client) {
    const { error } = await client.from("page_views").insert(row);
    if (error) throw error;
    return;
  }
  // No database: without the Blob backup, the deployed filesystem is read-only and writeLocal() would
  // throw (ENOENT on /var/task/.data). Blob keeps views working in production with no Supabase set up.
  if (backupConfigured()) {
    const views = ((await backupGetJson<PageView[]>(VIEWS_BACKUP_PATH)) ?? []).concat(row).slice(-20_000);
    await backupPutJson(VIEWS_BACKUP_PATH, views);
    return;
  }
  const db = await readLocal();
  // The local file is for development only, so keep it small.
  db.views = [...(db.views ?? []), row].slice(-20_000);
  await writeLocal(db);
}

// Page views since `since` (ISO time), oldest first. Only the four columns the reports use; pages are read four
// at a time so a busy month still loads quickly (capped at 200k rows).
export async function listPageViews(since?: string): Promise<PageView[]> {
  const client = sb();
  if (client) {
    try {
      return await readAllPages<PageView>((from, to, withCount) => {
        let q = client.from("page_views").select("path, visitor_id, source, created_at", withCount ? { count: "exact" } : undefined);
        if (since) q = q.gte("created_at", since);
        return q.order("created_at", { ascending: true }).order("id").range(from, to);
      });
    } catch (e) {
      const error = e as DbError;
      // Table not created yet: the dashboard still works, just without visit counts.
      if (error.code === "42P01" || /page_views/.test(error.message ?? "")) return [];
      throw e;
    }
  }
  if (backupConfigured()) {
    const views = (await backupGetJson<PageView[]>(VIEWS_BACKUP_PATH)) ?? [];
    return since ? views.filter((v) => v.created_at >= since) : views;
  }
  const views = (await readLocal()).views ?? [];
  return since ? views.filter((v) => v.created_at >= since) : views;
}

// One read per request (React cache), since most admin pages and the sidebar both ask for it.
export const listPartners = cache(async (): Promise<VendorPartner[]> => {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("vendor_partners").select("*");
    if (error) {
      // Table not created yet: every vendor shows as "Not contacted".
      if (error.code === "42P01" || /vendor_partners/.test(error.message)) return [];
      throw error;
    }
    return data ?? [];
  }
  return (await readLocal()).partners ?? [];
});

export type PartnerPatch = Partial<Omit<VendorPartner, "vendor_id" | "activity" | "updated_at">>;

// Saves CRM edits for one vendor and appends `log` to its activity timeline.
export async function savePartner(vendorId: string, patch: PartnerPatch, log: Omit<LeadActivity, "at">[] = []) {
  const current = (await listPartners()).find((p) => p.vendor_id === vendorId);
  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    status: "not_contacted",
    ...current,
    vendor_id: vendorId,
    updated_at: now,
    activity: [...(current?.activity ?? []), ...log.map((a) => ({ ...a, at: now }))],
  };
  for (const [k, v] of Object.entries(patch)) row[k] = v === undefined || v === "" ? null : v;

  const client = sb();
  if (client) {
    const { error } = await client.from("vendor_partners").upsert(row, { onConflict: "vendor_id" });
    if (error) throw error;
    return;
  }
  const db = await readLocal();
  db.partners = [...(db.partners ?? []).filter((p) => p.vendor_id !== vendorId), row as VendorPartner];
  await writeLocal(db);
}

export async function getAccount(email: string): Promise<CustomerAccount | undefined> {
  const key = email.trim().toLowerCase();
  const client = sb();
  if (client) {
    const { data, error } = await client.from("customer_accounts").select("*").eq("email", key).maybeSingle();
    if (error) throw error;
    return data ?? undefined;
  }
  return (await readLocal()).accounts?.find((a) => a.email === key);
}

// Creates the account on first use, otherwise merges the patch in.
export async function upsertAccount(email: string, patch: AccountPatch): Promise<CustomerAccount> {
  const key = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const existing = await getAccount(key);
  const row: CustomerAccount = { ...(existing ?? { email: key, created_at: now }), ...patch, updated_at: now };
  const client = sb();
  if (client) {
    const { error } = await client.from("customer_accounts").upsert(row, { onConflict: "email" });
    if (error) throw error;
    return row;
  }
  const db = await readLocal();
  db.accounts = [...(db.accounts ?? []).filter((a) => a.email !== key), row];
  await writeLocal(db);
  return row;
}

// Adds one message to a lead's thread (renter or team) and returns the new list.
export async function addLeadMessage(id: string, from: LeadMessage["from"], text: string) {
  const lead = await getLead(id);
  if (!lead) throw new Error(`Lead ${id} not found`);
  const now = new Date().toISOString();
  // Replying marks the other side's messages as read.
  const messages = (lead.messages ?? []).map((m) => (m.from !== from && !m.read_at ? { ...m, read_at: now } : m));
  messages.push({ at: now, from, text: text.slice(0, 4000) });
  await updateLead(id, { messages }, [{ type: "note", text: from === "customer" ? "Customer sent a message from their account." : "Team replied in the customer's account." }]);
  return messages;
}

// What a known visitor did after sending a form (lib/activity.ts), keyed by their browser's visitor id.
// Supabase table visitor_activity; otherwise the private Blob store (activity/<id>.json) or the local file.
const missingTable = (e: { code?: string; message: string }, table: string) => e.code === "42P01" || e.code === "PGRST205" || e.message.includes(table);

// Activity is only kept for visitors who have sent us a form, so random ids can't fill the store.
const knownVisitors = new Set<string>();
export async function visitorHasLead(visitorId: string): Promise<boolean> {
  if (knownVisitors.has(visitorId)) return true;
  let known = false;
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("id").eq("visitor_id", visitorId).limit(1);
    known = !error && !!data?.length;
  } else if (backupConfigured()) {
    known = !!(await backupGetJson(`visitors/${visitorId}.json`));
  } else {
    known = (await readLocal()).leads.some((l) => l.visitor_id === visitorId);
  }
  if (known) knownVisitors.add(visitorId);
  return known;
}

// Called when a lead with a visitor id is saved. Only the Blob store needs a marker file; the database and the
// local file can look the id up on the lead itself.
export async function linkVisitor(visitorId: string) {
  knownVisitors.add(visitorId);
  if (!sb() && backupConfigured()) await backupPutJson(`visitors/${visitorId}.json`, { at: new Date().toISOString() });
}

export async function getVisitorActivity(visitorId: string): Promise<ActivityEvent[]> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("visitor_activity").select("events").eq("visitor_id", visitorId).maybeSingle();
    if (error) {
      if (missingTable(error, "visitor_activity")) return [];
      throw error;
    }
    return (data?.events as ActivityEvent[] | undefined) ?? [];
  }
  if (backupConfigured()) return (await backupGetJson<ActivityEvent[]>(`activity/${visitorId}.json`)) ?? [];
  return (await readLocal()).activity?.[visitorId] ?? [];
}

export async function appendVisitorActivity(visitorId: string, events: ActivityEvent[]) {
  if (!events.length) return;
  const merged = mergeActivity(await getVisitorActivity(visitorId), events);
  const client = sb();
  if (client) {
    const { error } = await client
      .from("visitor_activity")
      .upsert({ visitor_id: visitorId, events: merged, updated_at: new Date().toISOString() }, { onConflict: "visitor_id" });
    if (error && !missingTable(error, "visitor_activity")) throw error;
    return;
  }
  if (backupConfigured()) return backupPutJson(`activity/${visitorId}.json`, merged);
  const db = await readLocal();
  db.activity = { ...db.activity, [visitorId]: merged };
  await writeLocal(db);
}

// Small settings edited in /admin (for example the reminder emails and their offer), by key.
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("site_settings").select("value").eq("key", key).maybeSingle();
    if (error) {
      if (missingTable(error, "site_settings")) return undefined;
      throw error;
    }
    return (data?.value as T | undefined) ?? undefined;
  }
  if (backupConfigured()) return backupGetJson<T>(`settings/${key}.json`);
  return (await readLocal()).settings?.[key] as T | undefined;
}

export async function saveSetting(key: string, value: unknown) {
  const client = sb();
  if (client) {
    const { error } = await client.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return;
  }
  if (backupConfigured()) return backupPutJson(`settings/${key}.json`, value);
  const db = await readLocal();
  db.settings = { ...db.settings, [key]: value };
  await writeLocal(db);
}
