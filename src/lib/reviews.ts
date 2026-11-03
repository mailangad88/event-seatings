import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { missingTable, readLocal, supabase, writeLocal } from "./community-db";

// Customer reviews. The rule (Angad, Nov 2026): show only real reviews, never invent one.
// - Anyone can submit a review on /reviews/write. It is saved as "pending" and shows nowhere until the owner
//   approves it in /admin/reviews.
// - A review sent from a personal review link (/reviews/write?t=<token>, made in /admin/reviews for a lead)
//   is marked "verified booking", because the token can only be made by the owner for a real lead.
// - Review and AggregateRating structured data are only output when at least one approved review exists.

export type ReviewStatus = "pending" | "approved" | "hidden";

export type Review = {
  id: string;
  created_at: string;
  status: ReviewStatus;
  rating: number; // 1-5
  name: string; // shown as first name + last initial
  email: string; // never shown publicly
  city?: string;
  event_type?: string;
  event_month?: string; // YYYY-MM
  title?: string;
  body: string;
  lead_id?: string; // set when the review came from a personal review link
  verified?: boolean;
  owner_reply?: string;
  approved_at?: string;
};

export type NewReview = Omit<Review, "id" | "created_at" | "status" | "approved_at" | "owner_reply">;

// "Angad Singh" -> "Angad S." so full surnames never appear on the site.
export function displayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "Customer";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export async function addReview(input: NewReview): Promise<Review> {
  const row: Review = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString(), status: "pending" };
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from("reviews").insert(row);
    if (error) throw error;
    return row;
  }
  const db = await readLocal();
  db.reviews = [...(db.reviews ?? []), row];
  await writeLocal(db);
  return row;
}

export async function listReviews(status?: ReviewStatus): Promise<Review[]> {
  const sb = supabase();
  let rows: Review[];
  if (sb) {
    let q = sb.from("reviews").select("*");
    if (status) q = q.eq("status", status);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) {
      if (missingTable(error, "reviews")) return [];
      throw error;
    }
    rows = (data ?? []) as Review[];
  } else {
    rows = ((await readLocal()).reviews ?? []) as Review[];
    if (status) rows = rows.filter((r) => r.status === status);
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  return rows;
}

/** Approved reviews for the public site. Never throws: a storage problem shows "no reviews yet" instead of an error. */
export async function publicReviews(): Promise<Review[]> {
  try {
    return await listReviews("approved");
  } catch (error) {
    console.error("publicReviews failed", error);
    return [];
  }
}

export type ReviewPatch = Partial<Pick<Review, "status" | "owner_reply" | "approved_at">>;

export async function updateReview(id: string, patch: ReviewPatch) {
  const changes: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) changes[k] = v === undefined || v === "" ? null : v;
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from("reviews").update(changes).eq("id", id);
    if (error) throw error;
    return;
  }
  const db = await readLocal();
  const rows = (db.reviews ?? []) as Review[];
  db.reviews = rows.map((r) => {
    if (r.id !== id) return r;
    const next = { ...r, ...changes } as Record<string, unknown>;
    for (const k of Object.keys(next)) if (next[k] === null) delete next[k];
    return next as Review;
  });
  await writeLocal(db);
}

export function summarize(reviews: Review[]) {
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const byStar = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  return { count, average: Math.round(average * 10) / 10, byStar };
}

// Personal review links. The token is the lead id plus an HMAC of it, so only someone holding the secret
// (the owner, through /admin/reviews) can make one, and the link can't be guessed for other leads.
function secret() {
  return process.env.REVIEW_LINK_SECRET || process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "development" ? "dev-only" : "");
}

export function reviewToken(leadId: string): string | undefined {
  const key = secret();
  if (!key) return undefined;
  const sig = createHmac("sha256", key).update(`review:${leadId}`).digest("base64url").slice(0, 22);
  return `${leadId}.${sig}`;
}

/** The lead id inside a valid review token, or undefined. */
export function leadFromToken(token: string | undefined | null): string | undefined {
  if (!token || token.length > 80) return undefined;
  const [leadId] = token.split(".");
  const expected = leadId ? reviewToken(leadId) : undefined;
  if (!expected || expected.length !== token.length) return undefined;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token)) ? leadId : undefined;
}
