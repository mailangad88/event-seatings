import { addPageView } from "@/lib/store";

export const dynamic = "force-dynamic";

const bot = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|bingpreview|vercel/i;

// Counts one page view for the admin dashboard. Sent with navigator.sendBeacon, so it never slows a page down.
export async function POST(request: Request) {
  if (bot.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  const body = await request.json().catch(() => null);
  const page = typeof body?.path === "string" ? body.path.split("?")[0] : "";
  // A visitor started typing into a form on this page: stored as a view of "/__form-start<page>".
  const path = body?.event === "form_start" ? `/__form-start${page}` : page;
  const visitor = typeof body?.visitor === "string" ? body.visitor : "";
  if (!/^\/[\w\-./%]{0,200}$/.test(path) || path.startsWith("/admin") || !/^[a-zA-Z0-9-]{8,64}$/.test(visitor)) {
    return new Response(null, { status: 204 });
  }
  const source = typeof body?.source === "string" ? body.source.slice(0, 100) : undefined;
  try {
    await addPageView({ path, visitor_id: visitor, source });
  } catch (e) {
    console.error("page view not saved", e);
  }
  return new Response(null, { status: 204 });
}
