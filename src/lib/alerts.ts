import "server-only";

// Error alerts. Posts a short message to ALERT_WEBHOOK_URL (a Slack or Discord incoming webhook, both free)
// when the site throws. Without the variable, errors are only logged (Vercel runtime logs).
// Throttled per server instance so a burst of the same error sends one alert.

const seen = new Map<string, number>();
const WINDOW = 10 * 60_000;

export async function sendAlert(title: string, detail: Record<string, unknown>) {
  const key = `${title}|${String(detail.path ?? "")}`.slice(0, 300);
  const now = Date.now();
  const last = seen.get(key);
  console.error(`[alert] ${title}`, detail);
  if (last && now - last < WINDOW) return;
  seen.set(key, now);
  if (seen.size > 500) seen.clear();
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;
  const lines = Object.entries(detail)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${String(v).slice(0, 300)}`);
  const text = `🚨 ${process.env.VERCEL_ENV ?? "local"} · ${title}\n${lines.join("\n")}`.slice(0, 1900);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `text` for Slack, `content` for Discord.
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {}
}
