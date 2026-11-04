import { isVisitorId, parseActivity } from "@/lib/activity";
import { appendVisitorActivity, visitorHasLead } from "@/lib/store";

export const dynamic = "force-dynamic";

const bot = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|bingpreview|vercel/i;

// Best-effort limit per server instance: 60 batches per visitor or IP per 10 minutes.
const hits = new Map<string, number[]>();
function tooMany(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 60;
}

// Pages, clicks and quote-list changes from a known visitor (lib/activity-client.ts), sent with sendBeacon.
// Always answers 204 so it never slows or breaks a page.
export async function POST(request: Request) {
  if (bot.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  const raw = await request.text().catch(() => "");
  if (raw.length > 64 * 1024) return new Response(null, { status: 204 });
  let body: { visitor?: unknown; events?: unknown } | null = null;
  try {
    body = JSON.parse(raw);
  } catch {}
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (!body || !isVisitorId(body.visitor) || tooMany(body.visitor) || tooMany(`ip:${ip}`)) return new Response(null, { status: 204 });
  const events = parseActivity(body.events);
  if (!events.length) return new Response(null, { status: 204 });
  try {
    if (await visitorHasLead(body.visitor)) await appendVisitorActivity(body.visitor, events);
  } catch (e) {
    console.error("visitor activity not saved", e);
  }
  return new Response(null, { status: 204 });
}
