import { after } from "next/server";
import { getLead } from "@/lib/store";
import { addReview, leadFromToken } from "@/lib/reviews";
import { notifyOwnerOfReview } from "@/lib/notify";

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

// Saves a customer review as "pending". Nothing is published until the owner approves it in /admin/reviews.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request" }, { status: 400 });
  if (body.website) return Response.json({ ok: true }); // honeypot

  const name = str(body.name, 80);
  const email = str(body.email, 254);
  const text = str(body.body, 3000);
  const rating = Number(body.rating);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please add your name and a valid email address." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Please choose a star rating." }, { status: 400 });
  }
  if (!text || text.length < 20) {
    return Response.json({ error: "Please write at least a sentence about your experience." }, { status: 400 });
  }
  if (body.consent !== "yes") {
    return Response.json({ error: "Please confirm we may publish your review." }, { status: 400 });
  }

  // A personal review link proves the reviewer is a real lead; it only counts as a verified booking
  // once that lead reached "booked" or "completed" in the CRM.
  const leadId = leadFromToken(str(body.token, 80));
  const lead = leadId ? await getLead(leadId).catch(() => undefined) : undefined;
  const month = str(body.event_month, 7);

  try {
    const review = await addReview({
      rating,
      name,
      email,
      body: text,
      title: str(body.title, 120),
      city: str(body.city, 80),
      event_type: str(body.event_type, 60),
      event_month: month && /^\d{4}-\d{2}$/.test(month) ? month : undefined,
      lead_id: lead?.id,
      verified: lead ? lead.status === "booked" || lead.status === "completed" : undefined,
    });
    after(() => notifyOwnerOfReview(review));
  } catch (error) {
    console.error("REVIEW_SAVE_FAILED", error, JSON.stringify({ name, email, rating, text }));
    return Response.json({ error: "We couldn't save your review just now. Please try again in a minute." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
