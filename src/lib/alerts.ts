import "server-only";
import { log, redact } from "@/lib/log";

// Error alerts. Posts a short message to ALERT_WEBHOOK_URL (a Slack or Discord incoming webhook, both free)
// when the site throws. Without the variable, errors are only logged (Vercel runtime logs).
// Throttled per server instance so a burst of the same error sends one alert.
// Detail values go through redact() first: emails and phone numbers are masked and secret-looking
// keys are dropped, so nothing personal ends up in the chat channel.

const seen = new Map<string, number>();
const WINDOW = 10 * 60_000;

export async function sendAlert(title: string, detail: Record<string, unknown>) {
  const safe = redact(detail) as Record<string, unknown>;
  const key = `${title}|${String(safe.path ?? "")}`.slice(0, 300);
  const now = Date.now();
  const last = seen.get(key);
  const throttled = Boolean(last && now - last < WINDOW);
  log.error("alert", { title, throttled, ...safe });
  if (throttled) return;
  seen.set(key, now);
  if (seen.size > 500) seen.clear();
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;
  const lines = Object.entries(safe)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${(typeof v === "string" ? v : JSON.stringify(v)).slice(0, 300)}`);
  const text = `🚨 ${process.env.VERCEL_ENV ?? "local"} · ${title}\n${lines.join("\n")}`.slice(0, 1900);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `text` for Slack, `content` for Discord.
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) log.warn("alert_webhook_failed", { status: res.status });
  } catch (err) {
    // Best effort: the alert itself is already in the logs above.
    log.warn("alert_webhook_failed", { err });
  }
}
