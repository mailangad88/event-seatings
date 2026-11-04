"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { answerOptions, bandFor, bands, readinessAreas, statementCount, type ReadinessArea } from "@/data/readiness";
import { postLead } from "@/lib/lead-client";

type Guide = { href: string; label: string };
type Answers = (number | null)[];

const empty = (): Answers => Array(statementCount).fill(null);

// The share link stores answers as one digit each (0, 1, 2) and "x" for unanswered.
function encode(a: Answers) {
  return a.map((v) => (v === null ? "x" : String(v))).join("");
}
function decode(s: string | null): Answers | null {
  if (!s || s.length !== statementCount || !/^[012x]+$/.test(s)) return null;
  return [...s].map((c) => (c === "x" ? null : Number(c)));
}

function areaScore(a: Answers, i: number): number | null {
  const vals = a.slice(i * 3, i * 3 + 3);
  if (vals.some((v) => v === null)) return null;
  return Math.round(((vals as number[]).reduce((s, v) => s + v, 0) / 6) * 100);
}

export function ReadinessScore({
  guides,
  bookHref,
  siteName,
}: {
  guides: Record<ReadinessArea["key"], Guide>;
  bookHref: string;
  siteName: string;
}) {
  const [answers, setAnswers] = useState<Answers>(empty);
  const [copied, setCopied] = useState<"" | "link" | "result">("");

  // Restore answers from a shared link.
  useEffect(() => {
    const restored = decode(new URLSearchParams(window.location.search).get("a"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from the URL on mount
    if (restored) setAnswers(restored);
  }, []);

  function answer(i: number, v: number) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
    const url = new URL(window.location.href);
    url.searchParams.set("a", encode(next));
    window.history.replaceState(null, "", url);
  }

  function clear() {
    setAnswers(empty());
    const url = new URL(window.location.href);
    url.searchParams.delete("a");
    window.history.replaceState(null, "", url);
  }

  const answered = answers.filter((v) => v !== null).length;
  const done = answered === statementCount;
  const areaScores = readinessAreas.map((_, i) => areaScore(answers, i));
  const overall = done ? Math.round(((answers as number[]).reduce((s, v) => s + v, 0) / (statementCount * 2)) * 100) : null;
  const band = overall === null ? null : bandFor(overall);

  // Weakest areas first, only those under 70.
  const weakest = readinessAreas
    .map((area, i) => ({ area, score: areaScores[i] }))
    .filter((x): x is { area: ReadinessArea; score: number } => x.score !== null && x.score < 70)
    .sort((a, b) => a.score - b.score);
  const focus = weakest[0]?.area;

  const resultText = done
    ? [
        `My ${siteName} Seating Readiness Score: ${overall}/100 (${band?.name}).`,
        ...readinessAreas.map((a, i) => `${a.name}: ${areaScores[i]}/100`),
        focus ? `Weakest area: ${focus.name}. ${focus.fix}` : "No weak areas.",
      ].join("\n")
    : "";

  async function copy(kind: "link" | "result") {
    await navigator.clipboard?.writeText(kind === "link" ? window.location.href : `${resultText}\n${window.location.href}`).catch(() => null);
    setCopied(kind);
    setTimeout(() => setCopied(""), 2000);
  }

  const callHref = `${bookHref}${bookHref.includes("?") ? "&" : "?"}focus=${focus?.key ?? "ready"}`;

  return (
    <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <div className="sticky top-24 z-10 mb-10 flex items-center gap-6 bg-bg/90 py-3 backdrop-blur" aria-live="polite">
          <span className="text-xs tracking-[0.25em] text-muted uppercase">
            {answered} of {statementCount} answered
          </span>
          <span className="relative h-px flex-1 bg-line" aria-hidden>
            <span className="absolute inset-y-0 left-0 bg-gold transition-all duration-500" style={{ width: `${(answered / statementCount) * 100}%` }} />
          </span>
        </div>

        <ol className="space-y-16">
          {readinessAreas.map((area, ai) => (
            <li key={area.key} id={`area-${area.key}`}>
              <div className="flex items-center gap-5">
                <Image src={area.image} alt={area.imageAlt} width={1000} height={1250} sizes="64px" className="aspect-[4/5] w-16 object-cover" />
                <div>
                  <p className="text-xs tracking-[0.25em] text-gold uppercase">Area {ai + 1} of {readinessAreas.length}</p>
                  <h3 className="display-2 mt-1">{area.name}</h3>
                </div>
                {areaScores[ai] !== null && (
                  <span className="ml-auto font-heading font-semibold text-3xl text-gold">
                    {areaScores[ai]}
                    <span className="text-base text-muted">/100</span>
                  </span>
                )}
              </div>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {area.statements.map((s, si) => {
                  const i = ai * 3 + si;
                  return (
                    <li key={s} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                      <p id={`st-${i}`} className="leading-7">{s}</p>
                      <div role="radiogroup" aria-labelledby={`st-${i}`} className="flex gap-1">
                        {answerOptions.map((o) => {
                          const on = answers[i] === o.value;
                          return (
                            <button
                              key={o.value}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              onClick={() => answer(i, o.value)}
                              className={`min-w-20 border px-3 py-2 text-xs tracking-[0.18em] uppercase transition-colors ${
                                on ? "border-gold bg-gold text-accent-ink" : "border-line text-ink/80 hover:border-gold"
                              }`}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Your result">
        <div className="border border-line bg-surface p-8">
          <p className="eyebrow">Your result</p>
          {overall === null ? (
            <p className="mt-6 font-heading font-semibold text-2xl leading-snug text-muted">
              Answer all {statementCount} statements to see your score. Area scores appear as you finish each area.
            </p>
          ) : (
            <>
              <p className="mt-6 font-heading font-semibold text-6xl text-gold">
                {overall}
                <span className="text-2xl text-muted">/100</span>
              </p>
              <p className="headline mt-2 text-3xl">{band?.name}</p>
              <p className="mt-3 leading-7 text-muted">{band?.summary}</p>
            </>
          )}

          <figure className="mt-8">
            <ul className="space-y-3">
              {readinessAreas.map((a, i) => {
                const s = areaScores[i];
                const weak = focus?.key === a.key;
                return (
                  <li key={a.key}>
                    <div className="flex justify-between text-xs tracking-[0.18em] uppercase">
                      <span className={weak ? "text-gold" : "text-ink/80"}>{a.name}{weak ? " · focus" : ""}</span>
                      <span className="text-muted">{s === null ? "–" : s}</span>
                    </div>
                    <div
                      className="mt-1.5 h-1.5 bg-line"
                      role="meter"
                      aria-label={`${a.name} score`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={s ?? 0}
                    >
                      <div className={`h-full transition-all duration-500 ${weak ? "bg-gold" : "bg-ink/60"}`} style={{ width: `${s ?? 0}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <figcaption className="mt-4 text-xs leading-5 text-muted">
              Score per area out of 100. The gold bar is your weakest area.
            </figcaption>
          </figure>

          {done && focus && (
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-xs tracking-[0.25em] text-gold uppercase">Start with {focus.name.toLowerCase()}</p>
              <p className="mt-3 leading-7">{focus.fix}</p>
              <Link href={guides[focus.key].href} className="mt-3 inline-block text-sm underline decoration-gold underline-offset-4">
                {guides[focus.key].label} →
              </Link>
              {weakest.length > 1 && (
                <p className="mt-4 text-sm text-muted">
                  Also below 70:{" "}
                  {weakest.slice(1).map((w, i) => (
                    <span key={w.area.key}>
                      {i > 0 && ", "}
                      <Link href={guides[w.area.key].href} className="underline decoration-line underline-offset-4 hover:decoration-gold">
                        {w.area.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}

          {done && (
            <div className="mt-8 border-t border-line pt-6">
              <p className="font-heading font-semibold text-2xl leading-snug">
                {focus ? `Want help with ${focus.name.toLowerCase()}?` : "Ready to reserve your chairs?"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                A free 15-minute call. We&apos;ll go through your result and leave you with a chair count, a style shortlist and a timeline.
              </p>
              <a href={callHref} className="btn-primary mt-5 w-full justify-center">Book a free seating call</a>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.2em] uppercase">
            <button type="button" onClick={() => copy("link")} className="text-ink/80 hover:text-gold" disabled={answered === 0}>
              {copied === "link" ? "Link copied" : "Copy share link"}
            </button>
            {done && (
              <button type="button" onClick={() => copy("result")} className="text-ink/80 hover:text-gold">
                {copied === "result" ? "Result copied" : "Copy result"}
              </button>
            )}
            {answered > 0 && (
              <button type="button" onClick={clear} className="text-muted hover:text-ink">Clear answers</button>
            )}
          </div>
        </div>

        {done && <EmailResult resultText={resultText} focus={focus?.key ?? "ready"} siteName={siteName} />}

        <p className="mt-6 text-xs leading-5 text-muted">
          Bands: {bands.map((b, i) => `${b.name} ${b.min}${i < bands.length - 1 ? `–${bands[i + 1].min - 1}` : "–100"}`).join(" · ")}.
          This is a planning guide, not a guarantee.
        </p>
      </aside>
    </div>
  );
}

function EmailResult({ resultText, focus, siteName }: { resultText: string; focus: string; siteName: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    const res = await postLead({
      ...data,
      kind: "waitlist",
      source: `seating-readiness:${focus}`,
      message: `${resultText}\n${window.location.href}`,
    }).catch(() => null);
    if (res?.ok) return setStatus("done");
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") {
    return (
      <p className="mt-6 border border-line p-6 font-heading font-semibold text-xl">
        Thank you. {siteName} will email you your score with tips for your weakest area.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 border border-line p-6">
      <p className="font-heading font-semibold text-xl">Email me my score and tips</p>
      <p className="mt-1 text-xs leading-5 text-muted">Optional. We&apos;ll reply with your result and may follow up about your event.</p>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="mt-4 grid gap-3">
        <label className="text-xs tracking-[0.2em] text-muted uppercase">
          First name
          <input name="name" autoComplete="given-name" className="mt-1 w-full border-0 border-b border-line bg-transparent px-0 py-2 text-base normal-case tracking-normal text-ink focus:border-gold focus:ring-0 focus:outline-none" />
        </label>
        <label className="text-xs tracking-[0.2em] text-muted uppercase">
          Email
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full border-0 border-b border-line bg-transparent px-0 py-2 text-base normal-case tracking-normal text-ink focus:border-gold focus:ring-0 focus:outline-none" />
        </label>
        <label className="text-xs tracking-[0.2em] text-muted uppercase">
          Event date (optional)
          <input name="event_date" type="date" className="mt-1 w-full border-0 border-b border-line bg-transparent px-0 py-2 text-base normal-case tracking-normal text-ink focus:border-gold focus:ring-0 focus:outline-none" />
        </label>
      </div>
      <button className="btn-ghost mt-5 w-full justify-center" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send my score"}
      </button>
      {status === "error" && <p className="mt-2 text-sm text-rose">{error}</p>}
    </form>
  );
}
