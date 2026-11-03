import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ApplicationActivity,
  NewVendorApplication,
  VendorApplication,
} from "./vendor-application-types";

export * from "./vendor-application-types";

// Vendor sign-ups from /partners/onboard. Stored in the Supabase table vendor_applications (supabase/schema.sql),
// or in .data/db.json under "vendorApplications" when Supabase isn't set up (local development).

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
type LocalDb = { vendorApplications?: VendorApplication[] } & Record<string, unknown>;

async function readLocal(): Promise<LocalDb> {
  try {
    return JSON.parse(await fs.readFile(dbFile, "utf8"));
  } catch {
    // Same empty shape as src/lib/store.ts, so the other local tables still read correctly after we write the file.
    return { votes: [], leads: [], views: [] };
  }
}
async function writeLocal(db: LocalDb) {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2));
}

// The table doesn't exist until schema.sql is re-run. Callers treat that as "not set up" rather than an error.
export class ApplicationsTableMissing extends Error {}
const missing = (e: { code?: string; message: string }) => e.code === "42P01" || e.code === "PGRST205" || /vendor_applications/.test(e.message);

export async function addVendorApplication(input: NewVendorApplication): Promise<VendorApplication> {
  const row: VendorApplication = {
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: "submitted",
    status_token: randomBytes(16).toString("hex"),
    activity: [],
  };
  const client = sb();
  if (client) {
    const { error } = await client.from("vendor_applications").insert(row);
    if (error) throw missing(error) ? new ApplicationsTableMissing(error.message) : error;
    return row;
  }
  const db = await readLocal();
  db.vendorApplications = [...(db.vendorApplications ?? []), row];
  await writeLocal(db);
  return row;
}

export async function listVendorApplications(): Promise<VendorApplication[]> {
  const client = sb();
  if (client) {
    const { data, error } = await client.from("vendor_applications").select("*").order("created_at", { ascending: false }).limit(2000);
    if (error) {
      if (missing(error)) return [];
      throw error;
    }
    return data ?? [];
  }
  return [...((await readLocal()).vendorApplications ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getVendorApplication(id: string): Promise<VendorApplication | undefined> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return undefined;
  const client = sb();
  if (client) {
    const { data, error } = await client.from("vendor_applications").select("*").eq("id", id).maybeSingle();
    if (error) {
      if (missing(error)) return undefined;
      throw error;
    }
    return data ?? undefined;
  }
  return (await readLocal()).vendorApplications?.find((a) => a.id === id);
}

// The vendor's own status page looks the application up by its random token, so the link is the key.
export async function getVendorApplicationByToken(token: string): Promise<VendorApplication | undefined> {
  if (!/^[a-f0-9]{32}$/.test(token)) return undefined;
  const client = sb();
  if (client) {
    const { data, error } = await client.from("vendor_applications").select("*").eq("status_token", token).maybeSingle();
    if (error) {
      if (missing(error)) return undefined;
      throw error;
    }
    return data ?? undefined;
  }
  return (await readLocal()).vendorApplications?.find((a) => a.status_token === token);
}

export type ApplicationPatch = Partial<Pick<VendorApplication, "status" | "linked_vendor_id" | "admin_notes">>;

// Saves admin edits and appends `log` to the application's activity timeline.
export async function updateVendorApplication(id: string, patch: ApplicationPatch, log: Omit<ApplicationActivity, "at">[] = []) {
  const current = await getVendorApplication(id);
  if (!current) throw new Error(`Application ${id} not found`);
  const now = new Date().toISOString();
  const changes: Record<string, unknown> = {
    updated_at: now,
    activity: [...(current.activity ?? []), ...log.map((a) => ({ ...a, at: now }))],
  };
  for (const [k, v] of Object.entries(patch)) changes[k] = v === undefined || v === "" ? null : v;

  const client = sb();
  if (client) {
    const { error } = await client.from("vendor_applications").update(changes).eq("id", id);
    if (error) throw error;
    return;
  }
  const db = await readLocal();
  db.vendorApplications = (db.vendorApplications ?? []).map((a) => {
    if (a.id !== id) return a;
    const next = { ...a, ...changes } as Record<string, unknown>;
    for (const k of Object.keys(next)) if (next[k] === null) delete next[k];
    return next as VendorApplication;
  });
  await writeLocal(db);
}
