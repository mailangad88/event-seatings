import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Storage for votes and leads.
// - With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set, data goes to Supabase (use this in production).
// - Without them, data goes to a local JSON file (.data/db.json) so you can develop with no setup.

export type LeadKind = "quote" | "waitlist" | "quiz";

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
};

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
