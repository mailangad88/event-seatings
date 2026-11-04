"use client";

import Link from "next/link";
import { useState } from "react";
import { chairs, type Style } from "@/data/chairs";
import { attributionFields } from "@/lib/attribution";
import { track, trackLead } from "@/lib/analytics";
import { BookingCta } from "./BookingCta";
import { ChairCard } from "./ChairCard";
import { postLead } from "@/lib/lead-client";

type Option = { label: string; scores: Partial<Record<Style, number>> };

const questions: { q: string; options: Option[] }[] = [
  {
    q: "Where are you celebrating?",
    options: [
      { label: "Barn, farm or vineyard", scores: { Rustic: 2, Garden: 1 } },
      { label: "Garden, estate or outdoors", scores: { Garden: 2, Classic: 1 } },
      { label: "Ballroom or hotel", scores: { Glam: 2, Classic: 1 } },
      { label: "Loft, gallery or modern space", scores: { Modern: 2, Minimalist: 1 } },
      { label: "Lakeside, beach or tented", scores: { Boho: 2, Garden: 1 } },
      { label: "Banquet hall for a big cultural celebration", scores: { Cultural: 2, Glam: 1 } },
    ],
  },
  {
    q: "Pick a color palette",
    options: [
      { label: "Earthy neutrals & terracotta", scores: { Boho: 2, Rustic: 1 } },
      { label: "Whites & lots of greenery", scores: { Garden: 2, Minimalist: 1 } },
      { label: "Jewel tones: emerald, navy, burgundy", scores: { Glam: 2, Modern: 1 } },
      { label: "Black & white", scores: { Modern: 2, Minimalist: 2 } },
      { label: "Blush, ivory & gold", scores: { Classic: 2, Glam: 1 } },
      { label: "Bold & bright: fuchsia, marigold, red", scores: { Cultural: 2, Modern: 1 } },
    ],
  },
  {
    q: "Which word should guests use to describe your wedding?",
    options: [
      { label: "Cozy", scores: { Rustic: 2 } },
      { label: "Relaxed", scores: { Boho: 2, Garden: 1 } },
      { label: "Timeless", scores: { Classic: 2 } },
      { label: "Luxe", scores: { Glam: 2 } },
      { label: "Clean", scores: { Minimalist: 2, Modern: 1 } },
      { label: "Colorful", scores: { Cultural: 2, Boho: 1 } },
    ],
  },
  {
    q: "What season?",
    options: [
      { label: "Spring", scores: { Garden: 1, Classic: 1 } },
      { label: "Summer", scores: { Boho: 1, Garden: 1 } },
      { label: "Fall", scores: { Rustic: 2 } },
      { label: "Winter", scores: { Glam: 2 } },
      { label: "Not sure yet", scores: {} },
    ],
  },
];

export function Quiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "done">("idle");
  const step = answers.length;

  if (step < questions.length) {
    const { q, options } = questions[step];
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 flex items-center gap-6">
          <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold">
            {String(step + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
          </span>
          <span className="relative h-px flex-1 bg-line">
            <span className="absolute inset-y-0 left-0 bg-gold transition-all duration-500" style={{ width: `${(step / questions.length) * 100}%` }} />
          </span>
        </div>
        <h2 className="display-2 text-center">{q}</h2>
        <div className="mt-12 grid gap-2 sm:grid-cols-2">
          {options.map((o) => (
            <button
              key={o.label}
              onClick={() => {
                if (step + 1 === questions.length) track("quiz_complete");
                setAnswers([...answers, options.indexOf(o)]);
              }}
              className="group card card-hover flex items-center justify-between gap-4 px-6 py-5 text-left hover:border-ink"
            >
              <span className="text-lg leading-snug font-medium">{o.label}</span>
              <span className="text-gold transition-transform group-hover:translate-x-1" aria-hidden>→</span>
            </button>
          ))}
        </div>
        {step > 0 && (
          <button onClick={() => setAnswers(answers.slice(0, -1))} className="link-line mt-10 text-muted">
            ← Previous
          </button>
        )}
      </div>
    );
  }

  const styleScores: Partial<Record<Style, number>> = {};
  answers.forEach((a, qi) => {
    for (const [s, n] of Object.entries(questions[qi].options[a].scores)) {
      styleScores[s as Style] = (styleScores[s as Style] ?? 0) + (n ?? 0);
    }
  });
  const topStyles = (Object.entries(styleScores) as [Style, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([s]) => s);
  const picks = [...chairs]
    .map((c) => ({ c, score: c.styles.reduce((sum, s) => sum + (styleScores[s] ?? 0), 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ c }) => c);

  async function saveEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setEmailStatus("sending");
    const res = await postLead({
      ...attributionFields(),
      ...data,
      kind: "quiz",
      quiz_styles: topStyles,
      chairs: picks.map((c) => c.slug),
      source: "style-quiz",
    }).catch(() => null);
    if (res?.ok) trackLead("quiz", "style-quiz", { quiz_style: topStyles[0] });
    setEmailStatus("done");
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center">Your aesthetic</p>
        <h2 className="display-2 mt-6">
          {topStyles.length ? (
            <>
              {topStyles[0]}
              {topStyles[1] && (
                <>
                  {" "}<em className="text-gold">&amp;</em> {topStyles[1]}
                </>
              )}
            </>
          ) : (
            "Classic"
          )}
        </h2>
        <p className="mt-6 leading-7 text-muted">Three pieces we would place in your room. Save any that speak to you.</p>
      </div>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((c) => (
          <ChairCard key={c.slug} chair={c} index={chairs.indexOf(c)} />
        ))}
      </div>
      <div className="card mx-auto mt-16 max-w-xl p-8 text-center">
        {emailStatus === "done" ? (
          <div>
            <p className="font-heading font-semibold text-2xl">
              Thank you. We&apos;ll send your selections, styling notes and launch updates.
            </p>
            <BookingCta content="quiz-thank-you" note="Prefer to talk it through? We'll match these chairs to your venue and guest count." />
          </div>
        ) : (
          <>
            <p className="headline text-4xl">Receive your selections</p>
            <p className="mt-3 text-muted">
              With styling notes for {(topStyles[0] ?? "your").toLowerCase()} celebrations.
            </p>
            <form onSubmit={saveEmail} className="mt-8 flex gap-2 rounded-full border border-line bg-surface p-1.5 text-left focus-within:border-gold">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <label className="sr-only" htmlFor="quiz-email">Email address</label>
              <input
                id="quiz-email"
                name="email"
                type="email"
                required
                placeholder="Your email address"
                className="min-w-0 flex-1 border-0 bg-transparent px-3 focus:ring-0 focus:outline-none"
              />
              <button className="btn-primary btn-sm shrink-0" disabled={emailStatus === "sending"}>
                Send
              </button>
            </form>
          </>
        )}
      </div>
      <div className="mt-14 flex flex-wrap justify-center gap-4">
        <Link href={`/quote?chairs=${picks.map((c) => c.slug).join(",")}`} className="btn-primary">
          Price these chairs
        </Link>
        <Link href="/book?from=style-quiz" className="btn-ghost">Book a free call</Link>
        <button onClick={() => setAnswers([])} className="link-line">Retake the quiz</button>
      </div>
    </div>
  );
}
