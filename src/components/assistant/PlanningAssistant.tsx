"use client";

import Link from "next/link";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { budgets, plannerEvents, settings, type BudgetId, type SettingId } from "@/lib/event-plan";
import type { AssistantPlan, GuideLink } from "@/lib/assistant";

// Planning assistant UI: four quick answers, then a priced plan with setup ideas, add-ons and guide links,
// plus follow-up questions answered from our guides. Hands off to /quote with everything pre-filled.

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type Turn = { q: string; a?: { text: string; sources: GuideLink[] }; error?: string };

export function PlanningAssistant({ aiWording }: { aiWording: boolean }) {
  const [event, setEvent] = useState(plannerEvents[0].id);
  const [guests, setGuests] = useState(plannerEvents[0].defaultGuests);
  const [setting, setSetting] = useState<SettingId>("venue");
  const [budget, setBudget] = useState<BudgetId>("unsure");
  const [date, setDate] = useState("");
  const [question, setQuestion] = useState("");
  const [plan, setPlan] = useState<AssistantPlan | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [ask, setAsk] = useState("");

  async function makePlan(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "plan", event, guests, setting, budget, date: date || undefined, question: question || undefined }),
    }).catch(() => null);
    const json = await res?.json().catch(() => null);
    if (!res?.ok || !json?.lines) {
      setError(json?.error ?? "Something went wrong. Please try again.");
      return setStatus("error");
    }
    setPlan(json);
    setPicked(new Set());
    setTurns(question ? [{ q: question, a: json.answer }] : []);
    setStatus("idle");
    track("assistant_plan", { event, guests, setting, budget });
    requestAnimationFrame(() => document.getElementById("assistant-plan")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function followUp(e: React.FormEvent) {
    e.preventDefault();
    const q = ask.trim();
    if (q.length < 3) return;
    setAsk("");
    setTurns((t) => [...t, { q }]);
    const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "ask", question: q }) }).catch(() => null);
    const json = await res?.json().catch(() => null);
    setTurns((t) => t.map((turn, i) => (i === t.length - 1 ? (res?.ok && json?.text ? { q, a: json } : { q, error: json?.error ?? "Couldn't answer just now." }) : turn)));
    track("assistant_ask");
  }

  const addOnIds = plan
    ? [
        ...plan.addOns.filter((a) => picked.has(a.extra)).flatMap((a) => a.lines.map((l) => l.id)),
        ...plan.themes.filter((t) => picked.has(`theme:${t.slug}`)).flatMap((t) => t.lines.map((l) => l.id)),
      ]
    : [];
  const quoteHref = plan ? plan.quoteHref.replace(/items=([^&]*)/, (_, ids) => `items=${[...new Set([...ids.split(","), ...addOnIds])].join(",")}`) : "/quote";
  const addOnTotal = plan
    ? plan.addOns.filter((a) => picked.has(a.extra)).reduce((s, a) => s + a.total, 0) +
      plan.themes.filter((t) => picked.has(`theme:${t.slug}`)).reduce((s, t) => s + t.total, 0)
    : 0;
  const toggle = (key: string) =>
    setPicked((p) => {
      const next = new Set(p);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const groups = plan ? [...new Set(plan.lines.map((l) => l.group))] : [];

  return (
    <div className="grid gap-10">
      <form onSubmit={makePlan} className="card grid gap-6 p-6 sm:p-8">
        <fieldset>
          <legend className="label">What are you planning?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {plannerEvents.map((ev) => (
              <button
                key={ev.id}
                type="button"
                aria-pressed={event === ev.id}
                className={event === ev.id ? "chip chip-active" : "chip"}
                onClick={() => {
                  setEvent(ev.id);
                  setGuests(ev.defaultGuests);
                }}
              >
                {ev.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Where?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {settings.map((s) => (
              <button key={s.id} type="button" aria-pressed={setting === s.id} className={setting === s.id ? "chip chip-active" : "chip"} onClick={() => setSetting(s.id)} title={s.blurb}>
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="grid gap-1.5">
            <span className="label">Guests</span>
            <input type="number" min={1} max={2000} value={guests} onChange={(e) => setGuests(Math.min(2000, Math.max(1, Number(e.target.value) || 1)))} className="field" />
          </label>
          <label className="grid gap-1.5">
            <span className="label">Rental budget</span>
            <select value={budget} onChange={(e) => setBudget(e.target.value as BudgetId)} className="field">
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="label">Date (optional)</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="label">Anything you&apos;re stuck on? (optional)</span>
          <input value={question} maxLength={500} onChange={(e) => setQuestion(e.target.value)} className="field" placeholder="e.g. Do I need a tent for a backyard party in September?" />
        </label>
        {status === "error" && <p className="text-sm text-rose">{error}</p>}
        <div>
          <button className="btn-primary" disabled={status === "loading"}>{status === "loading" ? "Planning…" : plan ? "Update my plan" : "Plan my event"}</button>
        </div>
      </form>

      {plan && (
        <div id="assistant-plan" className="grid scroll-mt-28 gap-8">
          <div className="card p-6 sm:p-8">
            <p className="eyebrow">Your plan · {plan.style.name} package</p>
            <p className="mt-3 text-lg leading-8">{plan.summary}</p>
            {plan.mode === "gemini" && <p className="mt-2 text-xs text-muted">Summary written by AI from the numbers below. Prices are estimates from local rental companies&apos; published rates plus our booking fee.</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={quoteHref} className="btn-primary" onClick={() => track("assistant_handoff", { addons: addOnIds.length })}>
                Build this quote{addOnTotal ? ` (+${usd(addOnTotal)} add-ons)` : ""}
              </Link>
              <Link href="/tools/floor-plan" className="btn-ghost">Draw the layout</Link>
              {date && <Link href={`/tools/event-date?date=${date}`} className="btn-ghost">Weather for {date}</Link>}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <section className="card p-6">
              <h2 className="display-3">The rental list</h2>
              {groups.map((g) => (
                <div key={g} className="mt-5">
                  <p className="label">{g}</p>
                  <ul className="mt-2 divide-y divide-line">
                    {plan.lines.filter((l) => l.group === g).map((l) => (
                      <li key={l.id} className="flex justify-between gap-4 py-2 text-sm">
                        <span>
                          {l.qty} × {l.name}
                          {l.why && <span className="block text-xs text-muted">{l.why}</span>}
                        </span>
                        <span className="shrink-0">{usd(l.line_total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="mt-5 flex justify-between border-t border-line pt-4 font-medium">
                <span>Estimated rentals</span>
                <span>{usd(plan.total)}</span>
              </p>
              <p className="mt-2 text-xs text-muted">Based on local rental companies&apos; published rates plus our booking fee; delivery and tax are added on the quote. Final prices are confirmed by the rental company.</p>
            </section>

            <div className="grid content-start gap-6">
              <section className="card p-6">
                <h2 className="display-3">Setup ideas</h2>
                <ul className="mt-4 grid gap-3 text-sm leading-6">
                  {plan.setup.map((s) => (
                    <li key={s} className="flex gap-3"><span className="text-gold">◆</span><span>{s}</span></li>
                  ))}
                </ul>
              </section>
              <section className="card p-6">
                <h2 className="display-3">Worth knowing</h2>
                <ul className="mt-4 grid gap-3 text-sm leading-6">
                  {plan.notes.map((n) => (
                    <li key={n.text} className={n.tone === "watch" ? "well p-3" : ""}>{n.text}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {plan.themes.length > 0 && (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="display-3">Theme ideas</h2>
                  <p className="mt-2 text-sm text-muted">Pick a look and its extra rentals are added to your quote. Props and crafts are listed for you to source.</p>
                </div>
                {plan.ideasHref && <Link href={plan.ideasHref} className="text-sm text-accent">All ideas for this event →</Link>}
              </div>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plan.themes.map((t) => {
                  const key = `theme:${t.slug}`;
                  const on = picked.has(key);
                  return (
                    <li key={t.slug}>
                      <div className={`card flex h-full flex-col p-5 ${on ? "ring-2 ring-gold" : ""}`}>
                        <div className="flex gap-1" aria-label={`Palette: ${t.palette.map((c) => c.name).join(", ")}`}>
                          {t.palette.map((c) => (
                            <span key={c.hex} className="h-5 w-5 rounded-full border border-line" style={{ background: c.hex }} title={c.name} />
                          ))}
                        </div>
                        <label className="mt-3 flex cursor-pointer items-start justify-between gap-3">
                          <span>
                            <span className="font-medium">{t.name}</span>
                            <span className="mt-1 block text-sm text-muted">{t.tagline}</span>
                          </span>
                          <input type="checkbox" checked={on} onChange={() => toggle(key)} className="mt-1" />
                        </label>
                        <p className="mt-3 text-sm leading-6">{t.setup}</p>
                        {t.activities.length > 0 && <p className="mt-2 text-xs text-muted">Activities: {t.activities.join(", ")}</p>}
                        {t.props.length > 0 && <p className="mt-1 text-xs text-muted">Props to source: {t.props.join(", ")}</p>}
                        <p className="mt-3 flex-1 text-xs text-muted">{t.lines.length ? `Adds ${t.lines.map((l) => `${l.qty} ${l.name}`).join(", ")}` : "Uses rentals already on your list"}</p>
                        <span className="mt-3 flex items-center justify-between text-sm">
                          <span className="font-medium">{t.total ? `about +${usd(t.total)}` : "no extra rentals"}</span>
                          <Link href={t.href} className="text-accent">See the look →</Link>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {(plan.setupIdeas.length > 0 || plan.activities.length > 0) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {plan.setupIdeas.length > 0 && (
                <section className="card p-6">
                  <h2 className="display-3">Layouts that work</h2>
                  <ul className="mt-4 grid gap-4">
                    {plan.setupIdeas.map((x) => (
                      <li key={x.title}>
                        <p className="font-medium">{x.title} <span className="badge ml-1">{x.where}</span></p>
                        <p className="mt-1 text-sm leading-6 text-muted">{x.text}</p>
                        {x.rentals.length > 0 && <p className="mt-1 text-xs text-muted">Rentals: {x.rentals.join(", ")}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {plan.activities.length > 0 && (
                <section className="card p-6">
                  <h2 className="display-3">Activities and games</h2>
                  <ul className="mt-4 grid gap-4">
                    {plan.activities.map((a) => (
                      <li key={a.name}>
                        <p className="font-medium">{a.name}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">{a.text}</p>
                        {a.rentals.length > 0 && <p className="mt-1 text-xs text-muted">Rent: {a.rentals.join(", ")}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {plan.addOns.length > 0 && (
            <section>
              <h2 className="display-3">Add-ons and activities</h2>
              <p className="mt-2 text-sm text-muted">Tick any you like and they&apos;ll be added to your quote.</p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plan.addOns.map((a) => {
                  const on = picked.has(a.extra);
                  return (
                    <li key={a.extra}>
                      <label className={`card flex h-full cursor-pointer flex-col p-5 ${on ? "ring-2 ring-gold" : ""}`}>
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-medium">{a.name}</span>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(a.extra)}
                          />
                        </span>
                        <span className="mt-1 text-sm text-muted">{a.text}</span>
                        <span className="mt-3 flex-1 text-xs text-muted">{a.lines.map((l) => `${l.qty} ${l.name}`).join(", ")}</span>
                        <span className="mt-3 text-sm font-medium">about +{usd(a.total)}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {plan.guides.length > 0 && (
            <section>
              <h2 className="display-3">Guides for your event</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {plan.guides.map((g) => (
                  <li key={g.url}>
                    <Link href={g.url} className="card card-hover block h-full p-5">
                      <span className="font-medium">{g.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-muted">{g.snippet}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-6 sm:p-8">
            <h2 className="display-3">Ask a planning question</h2>
            <p className="mt-2 text-sm text-muted">
              Answers come from our own planning guides{aiWording ? ", written up by AI" : ""}, with a link to the source. For anything specific to your event, the team will answer.
            </p>
            <ul className="mt-5 grid gap-4">
              {turns.map((t, i) => (
                <li key={i} className="grid gap-2">
                  <p className="justify-self-end rounded-2xl bg-surface-2 px-4 py-2 text-sm">{t.q}</p>
                  {t.a ? (
                    <div className="well p-4 text-sm leading-6">
                      <p>{t.a.text}</p>
                      {t.a.sources.length > 0 && (
                        <p className="mt-2 text-xs text-muted">
                          Source{t.a.sources.length > 1 ? "s" : ""}:{" "}
                          {t.a.sources.map((s, j) => (
                            <span key={s.url}>
                              {j > 0 && " · "}
                              <Link href={s.url} className="underline">{s.title}</Link>
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  ) : t.error ? (
                    <p className="text-sm text-rose">{t.error}</p>
                  ) : (
                    <p className="text-sm text-muted">Looking through our guides…</p>
                  )}
                </li>
              ))}
            </ul>
            <form onSubmit={followUp} className="mt-5 flex gap-2">
              <label className="sr-only" htmlFor="assistant-ask">Your question</label>
              <input id="assistant-ask" value={ask} onChange={(e) => setAsk(e.target.value)} maxLength={500} className="field flex-1" placeholder="How big a tent for 80 guests?" />
              <button className="btn-primary btn-sm">Ask</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
