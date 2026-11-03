import "server-only";
import { catalogItems } from "@/data/catalog";
import { priceQuote } from "./catalog-types";
import {
  assessment,
  budgets,
  danceSections,
  extras as extraOptions,
  getPlannerEvent,
  layout,
  plannerEvents,
  recommend,
  settings,
  spaceNeeded,
  styleName,
  styles,
  tentFor,
  type BudgetId,
  type ExtraId,
  type PlanInput,
  type SettingId,
  type StyleId,
} from "./event-plan";
import { searchGuides, snippet } from "./guide-search";

// The planning assistant (/planning-assistant). Free by default: the plan comes from the same rules as the
// /quote planner (src/lib/event-plan.ts), prices from the live catalog, and answers from our own guides.
// Optional AI wording: with ASSISTANT_AI=gemini and GEMINI_API_KEY set, Gemini rewrites the summary and answers
// follow-up questions, but only from the facts we pass it. That mode costs money, so it stays off until Angad
// approves it. Nothing here invents prices, items or claims: every number comes from the catalog or the rules.

export const assistantEnabled = () => process.env.NEXT_PUBLIC_PLANNING_ASSISTANT === "on";
export const aiMode = () => (process.env.ASSISTANT_AI === "gemini" && process.env.GEMINI_API_KEY ? "gemini" : "free");

export type AssistantInput = {
  event: string;
  guests: number;
  setting: SettingId;
  budget: BudgetId;
  date?: string;
  question?: string;
};

// Customer-safe line (no vendor names or costs).
export type PlanLine = { id: string; name: string; qty: number; unit: string; unit_price: number; line_total: number; group: string; why: string };
export type AddOnIdea = { extra: ExtraId; name: string; text: string; lines: PlanLine[]; total: number };
export type GuideLink = { url: string; title: string; heading?: string; snippet: string };

export type AssistantPlan = {
  summary: string;
  style: { id: StyleId; name: string };
  lines: PlanLine[];
  total: number;
  perGuest: number;
  setup: string[];
  notes: { tone: "good" | "watch"; text: string }[];
  addOns: AddOnIdea[];
  guides: GuideLink[];
  answer?: { text: string; sources: GuideLink[] };
  quoteHref: string;
  mode: "free" | "gemini";
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function priced(input: PlanInput) {
  const rec = recommend(input);
  const q = priceQuote(rec, catalogItems);
  const why = new Map<string, { group: string; why: string }>();
  for (const r of rec) if (!why.has(r.id)) why.set(r.id, { group: r.group, why: r.why });
  const lines: PlanLine[] = q.lines.map((l) => ({
    id: l.id,
    name: l.name,
    qty: l.qty,
    unit: l.unit,
    unit_price: l.unit_price,
    line_total: l.line_total,
    group: why.get(l.id)?.group ?? "Other",
    why: why.get(l.id)?.why ?? "",
  }));
  return { lines, total: q.subtotal };
}

/** Picks the fullest package that fits the budget (Signature when the budget is unknown). */
function chooseStyle(base: Omit<PlanInput, "style">, budget: BudgetId) {
  const cap = budgets.find((b) => b.id === budget)?.max;
  const options = styles.map((s) => ({ id: s.id, ...priced({ ...base, style: s.id }) }));
  if (budget === "unsure") return options.find((o) => o.id === "classic")!;
  if (!cap) return options[options.length - 1];
  const fits = options.filter((o) => o.total <= cap);
  return fits.length ? fits[fits.length - 1] : options[0];
}

export function cleanInput(body: Record<string, unknown>): AssistantInput | null {
  const event = typeof body.event === "string" && getPlannerEvent(body.event) ? body.event : null;
  const setting = settings.find((s) => s.id === body.setting)?.id;
  const budget = budgets.find((b) => b.id === body.budget)?.id ?? "unsure";
  const guests = Math.round(Number(body.guests));
  if (!event || !setting || !Number.isFinite(guests) || guests < 1) return null;
  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : undefined;
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 500) : undefined;
  return { event, guests: Math.min(guests, 2000), setting, budget, date, question: question || undefined };
}

export async function buildPlan(input: AssistantInput): Promise<AssistantPlan> {
  const ev = getPlannerEvent(input.event) ?? plannerEvents[0];
  const setting = settings.find((s) => s.id === input.setting)!;
  const base = { event: ev.id, guests: input.guests, setting: input.setting, extras: ev.extras, date: input.date };
  const chosen = chooseStyle(base, input.budget);
  const planInput: PlanInput = { ...base, style: chosen.id };
  const { lines, total } = chosen;

  // Setup: floor space, tables, dance floor and tent, from the planner's own rules.
  const space = spaceNeeded(planInput);
  const shape = layout(planInput, lines);
  const setup: string[] = [
    `About ${space.total.toLocaleString()} sq ft of usable floor for ${input.guests} guests${space.dance ? ", including the dance floor" : ""}.`,
    shape.rounds
      ? `${shape.rounds} round table${shape.rounds === 1 ? "" : "s"} with about 5 feet between table edges so chairs can pull out and servers can pass.`
      : `${shape.banquets} banquet table${shape.banquets === 1 ? "" : "s"}, which line up into long rows and fit narrow spaces.`,
  ];
  if (planInput.extras.includes("dancing")) {
    const side = Math.ceil(Math.sqrt(danceSections(input.guests))) * 3;
    setup.push(`A dance floor of about ${side}' × ${side}' in the middle of the room, with the DJ or speakers on one edge.`);
  }
  if (input.setting !== "venue") {
    const tent = tentFor(space.total);
    setup.push(`For a ${setting.name.toLowerCase()} event, a ${tent.label} tent covers that floor area. Book sidewalls as a rain plan.`);
  }
  if (input.setting === "backyard") setup.push("Keep food and the bar near the house for power and water, and seating on the flattest part of the lawn.");
  setup.push("Draw it to scale in the free seating layout builder to check walkways before you book.");

  // Add-on ideas: each extra this event doesn't have yet, priced as the difference it makes to the list.
  const have = new Set(lines.map((l) => `${l.id}:${l.qty}`));
  const addOns: AddOnIdea[] = extraOptions
    .filter((x) => !planInput.extras.includes(x.id))
    .map((x) => {
      const withX = priced({ ...planInput, extras: [...planInput.extras, x.id] });
      const before = new Map(lines.map((l) => [l.id, l.qty]));
      const added = withX.lines
        .filter((l) => !have.has(`${l.id}:${l.qty}`))
        .map((l) => {
          const extraQty = l.qty - (before.get(l.id) ?? 0);
          return { ...l, qty: extraQty, line_total: Math.round(extraQty * l.unit_price * 100) / 100 };
        })
        .filter((l) => l.qty > 0);
      return { extra: x.id, name: x.name, text: x.text, lines: added, total: Math.round(added.reduce((s, l) => s + l.line_total, 0)) };
    })
    .filter((a) => a.lines.length > 0);

  const notes = assessment(planInput, total, input.budget);
  // Guides that match every word of the occasion first (e.g. "graduation party"), then broader matches.
  const topic = ev.name.split(/ or |,/)[0].replace(/'s?/g, "");
  const strict = await searchGuides(`${topic} planning`, 4, "AND");
  const loose = strict.length < 4 ? await searchGuides(`${topic} ${setting.name} ideas`, 8) : [];
  const hits = [...strict, ...loose.filter((h) => !strict.some((s) => s.url === h.url))].slice(0, 4);
  const guides = hits.map((h) => ({ url: h.url, title: h.title, heading: h.heading, snippet: snippet(h.text, 200) }));
  const answer = input.question ? await answerQuestion(input.question) : undefined;

  const perGuest = input.guests ? total / input.guests : 0;
  const summary = `For a ${ev.name.toLowerCase()} with ${input.guests} guests (${setting.name.toLowerCase()}), we'd start with the ${styleName(chosen.id)} package: ${lines.length} rental items for about ${usd(total)}, roughly ${usd(perGuest)} per guest, before delivery and tax.`;
  const quoteHref = `/quote?items=${lines.map((l) => l.id).join(",")}&guests=${input.guests}&from=assistant`;

  const plan: AssistantPlan = { summary, style: { id: chosen.id, name: styleName(chosen.id) }, lines, total, perGuest, setup, notes, addOns, guides, answer, quoteHref, mode: aiMode() };
  if (plan.mode === "gemini") {
    const better = await geminiSummary(plan, input).catch(() => null);
    if (better) plan.summary = better;
  }
  return plan;
}

/** Answers a question from our guides. Free mode quotes the best passages; Gemini mode writes from them. */
export async function answerQuestion(question: string): Promise<{ text: string; sources: GuideLink[] }> {
  const hits = await searchGuides(question, 3);
  const sources = hits.map((h) => ({ url: h.url, title: h.title, heading: h.heading, snippet: snippet(h.text, 260) }));
  if (!hits.length) {
    return { text: "I couldn't find that in our guides. Send it to the team with the chat button and a person will answer.", sources: [] };
  }
  if (aiMode() === "gemini") {
    const text = await gemini(
      `Answer the event planner's question in 2 to 4 sentences, using ONLY the guide excerpts below. If they don't answer it, say so and suggest asking our team. Do not invent prices, statistics, vendors or promises.\n\nQuestion: ${question}\n\n${hits.map((h, i) => `[${i + 1}] ${h.title}${h.heading ? ` — ${h.heading}` : ""}: ${h.text}`).join("\n\n")}`,
    ).catch(() => null);
    if (text) return { text, sources };
  }
  return { text: snippet(hits[0].text, 380), sources };
}

async function geminiSummary(plan: AssistantPlan, input: AssistantInput) {
  return gemini(
    `You are the friendly planning assistant for Beyond Chiavari, a Chicago event rental marketplace. Write a warm 3 to 4 sentence summary of this plan for the host. Use ONLY these facts; do not add prices, items, statistics or promises that aren't here.\n\n` +
      JSON.stringify({ input, package: plan.style.name, total: Math.round(plan.total), perGuest: Math.round(plan.perGuest), items: plan.lines.map((l) => `${l.qty} ${l.name}`), setup: plan.setup, notes: plan.notes.map((n) => n.text), addOns: plan.addOns.map((a) => `${a.name}: about $${a.total}`) }),
  );
}

async function gemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.ASSISTANT_GEMINI_MODEL || "gemini-2.5-flash";
  if (!key) return null;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 400 } }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim();
  return text || null;
}
