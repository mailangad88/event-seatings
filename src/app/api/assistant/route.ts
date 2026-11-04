import { bodyTooLarge, clientIp, limitRequest, readJson } from "@/lib/rate-limit";
import { aiMode, answerQuestion, assistantEnabled, buildPlan, cleanInput, takeAiCredit } from "@/lib/assistant";

// Planning assistant API. Off (404) unless NEXT_PUBLIC_PLANNING_ASSISTANT=on.
// { kind: "plan", event, guests, setting, budget, date?, question? } -> a priced plan with ideas and guide links.
// { kind: "ask", question } -> an answer from our guides, with sources.

// A burst limit per IP (src/lib/rate-limit.ts); the daily Gemini spend cap is takeAiCredit in src/lib/assistant.ts.
const maxBody = 16 * 1024;

export async function POST(request: Request) {
  if (!assistantEnabled()) return new Response("Not found", { status: 404 });
  const ip = clientIp(request);
  const gemini = aiMode() === "gemini";
  const blocked =
    bodyTooLarge(request, maxBody) ??
    (await limitRequest(request, gemini ? "assistant-ai" : "assistant", {
      limit: gemini ? 15 : 60,
      windowMs: 10 * 60_000,
      message: "Too many questions at once. Please wait a few minutes.",
    }));
  if (blocked) return blocked;

  const body = await readJson<Record<string, unknown>>(request, maxBody);
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
