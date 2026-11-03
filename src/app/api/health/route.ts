import { site } from "@/lib/site";

// Uptime check target (.github/workflows/uptime.yml). Cheap: no database or external calls.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, site: site.name, time: new Date().toISOString(), commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null }, { headers: { "Cache-Control": "no-store" } });
}
