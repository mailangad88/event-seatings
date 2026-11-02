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
export type LeadKind = "quote" | "waitlist" | "quiz" | "call" | "chat";

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
} & Partial<Record<TrackingField, string>>;

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

type LocalDb = { votes: Vote[]; leads: Lead[] };

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
    return { votes: [], leads: [] };
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
    const { data, error } = await client.from("votes").select("chair_slug, visitor_id, created_at");
    if (error) throw error;
    return data ?? [];
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

export async function addLead(lead: NewLead): Promise<Lead> {
  const full: Lead = { ...lead, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  const client = sb();
  if (client) {
    const { error } = await client.from("leads").insert(full);
    if (error) throw error;
    return full;
  }
  const db = await readLocal();
  db.leads.push(full);
  await writeLocal(db);
  return full;
}

export async function listLeads(): Promise<Lead[]> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("leads").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
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

export type LeadPatch = Partial<Pick<Lead, "status" | "assigned_vendor" | "follow_up_at" | "lost_reason" | "activity">>;

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
