import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { attributionKeys } from "./attribution";
import type { QuoteLine } from "./catalog-types";

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
  // Set by the unsubscribe link: no more automated email of any kind to this address.
  opted_out_at?: string;
  // A/B/C from lib/lead-score.ts, with the reasons, set when the lead arrives.
  lead_score?: string;
  lead_score_reasons?: string;
  // Browser time zone and the pages the visitor viewed before sending (oldest first).
  visitor_tz?: string;
  pages_viewed?: string;
  // Follow-up sequence progress (lib/followups.ts): how many emails went out and when the last one did.
  followup_step?: number;
  followup_last_at?: string;
  // Quote builder: the priced line items (customer price + our vendor cost per line) and totals.
  items?: QuoteLine[];
  quote_subtotal?: number; // what the customer saw, vendor price + markup
  quote_cost?: number; // what the vendors charge us
  // CRM fields, edited in /admin/leads.
  status?: LeadStatus;
  assigned_vendor?: string;
  follow_up_at?: string; // YYYY-MM-DD
  lost_reason?: string;
  activity?: LeadActivity[];
  updated_at?: string;
  // Customer proposal (/proposal/<token>). The rental partner's name stays hidden on it until fee_status is "paid",
  // so the booking fee (or a refundable hold) is collected before the customer can go to the vendor directly.
  proposal_token?: string;
  proposal_created_at?: string;
  fee_status?: FeeStatus;
  fee_amount?: number; // USD charged at checkout (booking fee or hold)
  fee_paid_at?: string;
  stripe_session_id?: string;
} & Partial<Record<TrackingField, string>>;

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
  activity?: LeadActivity[];
  updated_at?: string;
};

type LocalDb = { votes: Vote[]; leads: Lead[]; views?: PageView[]; partners?: VendorPartner[] };

let supabase: SupabaseClient | null | undefined;
function sb() {
  if (supabase === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return supabase;
}

const dbFile = path.join(process.cwd(), ".data", "db.json");

async function readLocal(): Promise<LocalDb> {
  try {
    return JSON.parse(await fs.readFile(dbFile, "utf8"));
  } catch {
    return { votes: [], leads: [], views: [] };
  }
}

async function writeLocal(db: LocalDb) {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2));
}

export async function setVote(chairSlug: string, visitorId: string, on: boolean) {
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

export async function getVoteCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const v of await allVotes()) counts[v.chair_slug] = (counts[v.chair_slug] ?? 0) + 1;
  return counts;
}

export async function getVisitorVotes(visitorId: string): Promise<string[]> {
  return (await allVotes()).filter((v) => v.visitor_id === visitorId).map((v) => v.chair_slug);
}

// Columns added after the first launch. Kept here so a not-yet-migrated database can still take leads.
const newerLeadColumns = [
  "email_consent", "call_consent", "consent_at", "opted_out_at", "lead_score", "lead_score_reasons",
  "visitor_tz", "pages_viewed", "followup_step", "followup_last_at",
] as const;

export async function addLead(lead: NewLead): Promise<Lead> {
  const full: Lead = { ...lead, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  const client = sb();
  if (client) {
    const { error } = await client.from("leads").insert(full);
    if (!error) return full;
    // Database not migrated yet (supabase/schema.sql not re-run): save without the newer columns rather than lose
    // the lead. The full lead still reaches the owner alert and the CRM sync.
    if (error.code === "PGRST204" || /column/i.test(error.message)) {
      const legacy: Record<string, unknown> = { ...full };
      for (const k of newerLeadColumns) delete legacy[k];
      const retry = await client.from("leads").insert(legacy);
      if (!retry.error) {
        console.warn("LEAD_SAVED_WITHOUT_NEW_COLUMNS: re-run supabase/schema.sql", error.message);
        return full;
      }
    }
    throw error;
  }
  const db = await readLocal();
  db.leads.push(full);
  await writeLocal(db);
  return full;
}

export async function listLeads(): Promise<Lead[]> {
  const client = sb();
  if (client) {
    const rows: Lead[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + 999);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < 1000) return rows;
    }
  }
  return (await readLocal()).leads.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getLead(id: string): Promise<Lead | undefined> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ?? undefined;
  }
  return (await readLocal()).leads.find((l) => l.id === id);
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
  return (await readLocal()).leads.find((l) => l.proposal_token === token);
}

// Applies CRM edits and appends `log` to the lead's activity timeline in one write.
export async function updateLead(id: string, patch: LeadPatch, log: Omit<LeadActivity, "at">[] = []) {
  const lead = await getLead(id);
  if (!lead) throw new Error(`Lead ${id} not found`);
  const now = new Date().toISOString();
  const activity = [...(lead.activity ?? []), ...log.map((a) => ({ ...a, at: now }))];
  // Supabase needs explicit nulls to clear a column; undefined would be skipped.
  const changes: Record<string, unknown> = { updated_at: now, activity };
  for (const [k, v] of Object.entries(patch)) changes[k] = v === undefined || v === "" ? null : v;

  const client = sb();
  if (client) {
    const { error } = await client.from("leads").update(changes).eq("id", id);
    if (error) throw error;
    return;
  }
  const db = await readLocal();
  const i = db.leads.findIndex((l) => l.id === id);
  const next = { ...db.leads[i], ...changes } as Record<string, unknown>;
  for (const k of Object.keys(next)) if (next[k] === null) delete next[k];
  db.leads[i] = next as Lead;
  await writeLocal(db);
}

// Marks every lead with this email as opted out (unsubscribe link). Returns how many rows changed.
export async function optOutEmail(email: string) {
  const now = new Date().toISOString();
  const target = email.trim().toLowerCase();
  const client = sb();
  if (client) {
    const { data, error } = await client
      .from("leads")
      .update({ opted_out_at: now, updated_at: now })
      .ilike("email", target)
      .is("opted_out_at", null)
      .select("id");
    if (error) throw error;
    return data?.length ?? 0;
  }
  const db = await readLocal();
  let n = 0;
  for (const l of db.leads) {
    if (l.email.toLowerCase() === target && !l.opted_out_at) {
      l.opted_out_at = now;
      n++;
    }
  }
  await writeLocal(db);
  return n;
}

// Leads created since `since`, for the follow-up sequence and weekly report.
export async function listLeadsSince(since: string): Promise<Lead[]> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("*").gte("created_at", since).order("created_at");
    if (error) throw error;
    return data ?? [];
  }
  return (await readLocal()).leads.filter((l) => l.created_at >= since).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function addPageView(view: Omit<PageView, "created_at">) {
  const row: PageView = { ...view, created_at: new Date().toISOString() };
  const client = sb();
  if (client) {
    const { error } = await client.from("page_views").insert(row);
    if (error) throw error;
    return;
  }
  const db = await readLocal();
  // The local file is for development only, so keep it small.
  db.views = [...(db.views ?? []), row].slice(-20_000);
  await writeLocal(db);
}

// Page views since `since` (ISO time), newest last. Paged so a busy month still loads in full (capped at 200k rows).
export async function listPageViews(since?: string): Promise<PageView[]> {
  const client = sb();
  if (client) {
    const out: PageView[] = [];
    const size = 1000;
    for (let from = 0; from < 200_000; from += size) {
      let q = client.from("page_views").select("path, visitor_id, source, created_at");
      if (since) q = q.gte("created_at", since);
      const { data, error } = await q.order("created_at", { ascending: true }).range(from, from + size - 1);
      if (error) {
        // Table not created yet: the dashboard still works, just without visit counts.
        if (error.code === "42P01" || /page_views/.test(error.message)) return [];
        throw error;
      }
      out.push(...(data ?? []));
      if (!data || data.length < size) break;
    }
    return out;
  }
  const views = (await readLocal()).views ?? [];
  return since ? views.filter((v) => v.created_at >= since) : views;
}

export async function listPartners(): Promise<VendorPartner[]> {
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
}

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
