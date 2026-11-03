import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Storage for reviews and referral codes, kept apart from store.ts so these features stay self-contained.
// - With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set, rows go to Supabase (tables in supabase/schema.sql).
// - Without them, rows go to .data/community.json so everything works locally with no setup.

let client: SupabaseClient | null | undefined;
export function supabase() {
  if (client === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return client;
}

const file = path.join(process.cwd(), ".data", "community.json");

export type LocalCommunity = { reviews?: unknown[]; referrers?: unknown[] };

export async function readLocal(): Promise<LocalCommunity> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return {};
  }
}

export async function writeLocal(db: LocalCommunity) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2));
}

// "relation does not exist": the owner hasn't re-run schema.sql yet. Pages treat that as "no rows".
export const missingTable = (error: { code?: string; message?: string }, table: string) =>
  error.code === "42P01" || error.code === "PGRST205" || new RegExp(table).test(error.message ?? "");
