"use client";

import Link from "next/link";
import { useState } from "react";
import { chairs, type Style } from "@/data/chairs";
import { ChairCard } from "./ChairCard";

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
      { label: "Effortless", scores: { Boho: 2, Garden: 1 } },
      { label: "Timeless", scores: { Classic: 2 } },
      { label: "Luxe", scores: { Glam: 2 } },
      { label: "Clean", scores: { Minimalist: 2, Modern: 1 } },
      { label: "Vibrant", scores: { Cultural: 2, Boho: 1 } },
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
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex gap-1.5" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
          ))}
        </div>
        <p className="eyebrow">Question {step + 1} of {questions.length}</p>
        <h2 className="mt-2 font-serif text-4xl leading-tight">{q}</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {options.map((o, i) => (
            <button
              key={o.label}
              onClick={() => setAnswers([...answers, i])}
              className="rounded-xl border border-line bg-surface px-4 py-4 text-left transition-colors hover:border-accent hover:bg-accent-soft"
            >
              {o.label}
            </button>
          ))}
        </div>
        {step > 0 && (
          <button onClick={() => setAnswers(answers.slice(0, -1))} className="mt-6 text-sm text-muted underline">
            Back
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
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        kind: "quiz",
        quiz_styles: topStyles,
        chairs: picks.map((c) => c.slug),
        source: "style-quiz",
      }),
    }).catch(() => null);
    setEmailStatus("done");
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Your wedding style</p>
        <h2 className="mt-2 font-serif text-5xl">{topStyles.join(" + ") || "Classic"}</h2>
        <p className="mt-4 text-muted">Here are the three chairs we&apos;d put in your room. Tap ♡ on any you love.</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((c) => (
          <ChairCard key={c.slug} chair={c} />
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-line bg-surface p-6 text-center">
        {emailStatus === "done" ? (
          <p className="text-sage">Got it! We&apos;ll send your picks, styling ideas and launch updates to your inbox.</p>
        ) : (
          <>
            <p className="font-serif text-2xl">Email me my results</p>
            <p className="mt-1 text-sm text-muted">Plus styling tips for {topStyles[0] ?? "your"} weddings. No spam.</p>
            <form onSubmit={saveEmail} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <input name="email" type="email" required placeholder="you@email.com" className="field flex-1" />
              <button className="btn-primary" disabled={emailStatus === "sending"}>Send</button>
            </form>
          </>
        )}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/quote?chairs=${picks.map((c) => c.slug).join(",")}`} className="btn-primary">
          Get a quote for these
        </Link>
        <button onClick={() => setAnswers([])} className="btn-ghost">Retake quiz</button>
      </div>
    </div>
  );
}
