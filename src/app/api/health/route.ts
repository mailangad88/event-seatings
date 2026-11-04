import { site } from "@/lib/site";
import { checkAdmin, safeEqual } from "@/lib/admin-auth";

// Uptime check target (.github/workflows/uptime.yml). Cheap by default: no database or external calls,
// and it answers 200 even when integrations are not set up. `checks` only says whether each one is
// configured (true/false), never the values, and only to a caller with the admin password (Basic auth)
// or "Authorization: Bearer $CRON_SECRET", so strangers can't see which services are switched on.
// Add ?deep=1 (same rule) to also ping Supabase (2 second limit).
export const dynamic = "force-dynamic";

const set = (...names: string[]) => names.every((n) => Boolean(process.env[n]?.trim()));

async function pingSupabase(): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/health`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function trusted(request: Request): boolean {
  const auth = request.headers.get("authorization");
  if (!auth) return false;
  const secret = process.env.CRON_SECRET;
  if (secret && auth.startsWith("Bearer ") && safeEqual(auth, `Bearer ${secret}`)) return true;
  return Boolean(process.env.ADMIN_PASSWORD) && checkAdmin(auth) === "ok";
}

export async function GET(request: Request) {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null;
  const base = { ok: true, site: site.name, time: new Date().toISOString(), version: commit, commit };
  if (!trusted(request)) return Response.json(base, { headers: { "Cache-Control": "no-store" } });
  const checks: Record<string, boolean> = {
    supabase: set("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"),
    resend: set("RESEND_API_KEY", "NOTIFY_EMAIL"),
    stripe: set("STRIPE_SECRET_KEY"),
    stripeWebhook: set("STRIPE_WEBHOOK_SECRET"),
    alerts: set("ALERT_WEBHOOK_URL"),
    cronSecret: set("CRON_SECRET"),
    adminPassword: set("ADMIN_PASSWORD"),
  };
  if (new URL(request.url).searchParams.get("deep") === "1") {
    checks.supabaseReachable = await pingSupabase();
  }
  return Response.json(
    { ...base, checks },
    { headers: { "Cache-Control": "no-store" } },
  );
}
