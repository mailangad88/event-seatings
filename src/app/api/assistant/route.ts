import { aiMode, answerQuestion, assistantEnabled, buildPlan, cleanInput, takeAiCredit } from "@/lib/assistant";

// Planning assistant API. Off (404) unless NEXT_PUBLIC_PLANNING_ASSISTANT=on.
// { kind: "plan", event, guests, setting, budget, date?, question? } -> a priced plan with ideas and guide links.
// { kind: "ask", question } -> an answer from our guides, with sources.

// A light per-instance burst limit; the daily Gemini spend cap is takeAiCredit in src/lib/assistant.ts.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > (aiMode() === "gemini" ? 15 : 60);
}

export async function POST(request: Request) {
  if (!assistantEnabled()) return new Response("Not found", { status: 404 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return Response.json({ error: "Too many questions at once. Please wait a few minutes." }, { status: 429 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request" }, { status: 400 });

  if (body.kind === "ask") {
    const q = typeof body.question === "string" ? body.question.trim().slice(0, 500) : "";
    if (q.length < 3) return Response.json({ error: "Please type a question." }, { status: 400 });
    return Response.json(await answerQuestion(q, takeAiCredit(ip)));
  }

  const input = cleanInput(body);
  if (!input) return Response.json({ error: "Please choose the event type, setting and guest count." }, { status: 400 });
  return Response.json(await buildPlan(input, takeAiCredit(ip)));
}
