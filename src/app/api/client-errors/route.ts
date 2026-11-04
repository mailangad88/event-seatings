import { sendAlert } from "@/lib/alerts";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isClientErrorNoise, parseClientError } from "@/lib/client-errors";

// Receives browser errors from src/instrumentation-client.ts and forwards them as alerts.
export async function POST(request: Request) {
  // A noisy or hostile browser can't flood the alert channel: 20 reports per IP per 10 minutes, then dropped quietly.
  const rl = await rateLimit("client-errors", clientIp(request), { limit: 20, windowMs: 10 * 60_000 });
  if (!rl.allowed) return new Response(null, { status: 204 });
  // Reports are small; anything bigger is not from our script. Always answer 204 so the browser never retries.
  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > 4000) return new Response(null, { status: 204 });
  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 204 });
  }
  const report = parseClientError(body);
  if (!report || isClientErrorNoise(report)) return new Response(null, { status: 204 });
  await sendAlert("Browser error", report);
  return new Response(null, { status: 204 });
}
