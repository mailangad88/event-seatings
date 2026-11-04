import "server-only";
import { randomBytes } from "crypto";
import { missingTable, readLocal, supabase, writeLocal } from "./community-db";

// Referral tracking. Anyone can make a personal share link on /refer (beyondchiavari.com/?ref=<code>).
// The code rides along in the visitor's browser (see recordVisit in attribution.ts) and is saved on any lead
// they submit as `referral_code`, so /admin/referrals shows who sent whom.
// No reward is promised on the site unless REFERRAL_REWARD is set to the real, approved offer.

export type Referrer = {
  code: string;
  created_at: string;
  name: string;
  email: string;
};

export const referralCodePattern = /^[a-z0-9][a-z0-9-]{2,31}$/;

export function cleanCode(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const code = v.trim().toLowerCase();
  return referralCodePattern.test(code) ? code : undefined;
}

// The real reward, when Angad has approved one (e.g. "$25 off your rentals for both of you").
export const referralReward = () => process.env.REFERRAL_REWARD?.trim() || "";

async function all(): Promise<Referrer[]> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb.from("referrers").select("*").order("created_at", { ascending: false });
    if (error) {
      if (missingTable(error, "referrers")) return [];
      throw error;
    }
    return (data ?? []) as Referrer[];
  }
  return (((await readLocal()).referrers ?? []) as Referrer[]).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export const listReferrers = all;

export async function getReferrer(code: string) {
  return (await all()).find((r) => r.code === code);
}

// "Priya Shah" -> "priya-7k2m": readable, short, and not guessable from the name alone.
function makeCode(name: string) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "").slice(0, 12) || "friend";
  return `${base}-${randomBytes(3).toString("hex").slice(0, 4)}`;
}

/** Returns the existing code for this email, or makes a new one. */
export async function getOrCreateReferrer(name: string, email: string): Promise<Referrer> {
  const existing = (await all()).find((r) => r.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;
  const row: Referrer = { code: makeCode(name), created_at: new Date().toISOString(), name, email };
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from("referrers").insert(row);
    if (error) throw error;
    return row;
  }
  const db = await readLocal();
  db.referrers = [...(db.referrers ?? []), row];
  await writeLocal(db);
  return row;
}
