import { bodyTooLarge, limitRequest, readJson } from "@/lib/rate-limit";
import { getOrCreateReferrer } from "@/lib/referrals";
import { site } from "@/lib/site";

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

// Makes (or finds) someone's personal referral link for /refer.
export async function POST(request: Request) {
  const blocked = bodyTooLarge(request, 8 * 1024) ?? (await limitRequest(request, "referrals", { limit: 10, windowMs: 10 * 60_000 }));
  if (blocked) return blocked;
  const body = await readJson<Record<string, unknown>>(request, 8 * 1024);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request" }, { status: 400 });
  if (body.website) return Response.json({ ok: true });
  const name = str(body.name, 80);
  const email = str(body.email, 254);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please add your name and a valid email address." }, { status: 400 });
  }
  try {
    const r = await getOrCreateReferrer(name, email);
    return Response.json({ ok: true, code: r.code, url: `${site.url}/?ref=${r.code}` });
  } catch (error) {
    console.error("REFERRER_SAVE_FAILED", error);
    return Response.json({ error: "We couldn't make your link just now. Please try again in a minute." }, { status: 500 });
  }
}
