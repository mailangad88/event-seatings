import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Dates we can't take new events on (fully booked, holidays, partner blackouts). Set in /admin/availability.
// Supabase table `blocked_dates` when configured, otherwise .data/availability.json for local development.

export type BlockedDate = { date: string; reason?: string; created_at?: string };

let client: SupabaseClient | null | undefined;
function sb() {
  if (client === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return client;
}

const file = path.join(process.cwd(), ".data", "availability.json");
const isDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

async function readLocal(): Promise<BlockedDate[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return [];
  }
}

export async function listBlockedDates(from?: string): Promise<BlockedDate[]> {
  const c = sb();
  if (c) {
    let q = c.from("blocked_dates").select("date, reason, created_at").order("date");
    if (from) q = q.gte("date", from);
    const { data, error } = await q;
    if (error) {
      // Table not created yet: treat every date as open rather than breaking the planner.
      if (error.code === "42P01" || /blocked_dates/.test(error.message)) return [];
      throw error;
    }
    return data ?? [];
  }
  const all = await readLocal();
  return all.filter((d) => !from || d.date >= from).sort((a, b) => a.date.localeCompare(b.date));
}

export async function setDateBlocked(date: string, blocked: boolean, reason?: string) {
  if (!isDay(date)) throw new Error("Bad date");
  const c = sb();
  if (c) {
    const { error } = blocked
      ? await c.from("blocked_dates").upsert({ date, reason: reason || null }, { onConflict: "date" })
      : await c.from("blocked_dates").delete().eq("date", date);
    if (error) throw error;
    return;
  }
  const rest = (await readLocal()).filter((d) => d.date !== date);
  if (blocked) rest.push({ date, reason: reason || undefined, created_at: new Date().toISOString() });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(rest, null, 2));
}

// Today's date in Chicago, YYYY-MM-DD.
export const chicagoToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
