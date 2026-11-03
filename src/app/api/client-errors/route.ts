import { sendAlert } from "@/lib/alerts";

// Receives browser errors from src/instrumentation-client.ts and forwards them as alerts.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.message !== "string") return new Response(null, { status: 204 });
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);
  await sendAlert("Browser error", { message: s(body.message, 500), source: s(body.source, 300), path: s(body.path, 200), ua: s(body.ua, 200) });
  return new Response(null, { status: 204 });
}
