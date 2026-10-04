"use client";

import Link from "next/link";
import { useState } from "react";
import { getChair, type Chair } from "@/data/chairs";
import { ChairArt } from "./ChairArt";
import { useVotes } from "./VoteProvider";

// Head-to-head chair matchups. Each pick counts as a "want" vote,
// so the game doubles as demand research.
const matchups: [string, string][] = [
  ["cross-back", "ghost"],
  ["rattan-garden", "velvet-dining"],
  ["bentwood", "wishbone"],
  ["infinity", "cane-back"],
  ["windsor", "louis-medallion"],
  ["shell", "garden-folding"],
];

export function ThisOrThat() {
  const { mine, toggle } = useVotes();
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<Chair[]>([]);

  function pick(chair: Chair) {
    if (!mine.has(chair.slug)) toggle(chair.slug);
    setPicks((p) => [...p, chair]);
    setRound((r) => r + 1);
  }

  if (round >= matchups.length) {
    return (
      <div className="pop rounded-3xl bg-surface p-6 text-center sm:p-10">
        <p className="font-serif text-4xl font-extrabold tracking-tight lowercase sm:text-5xl">
          your taste is <span className="font-italic font-normal normal-case">impeccable</span> ✨
        </p>
        <p className="mt-3 text-muted">Your picks were added to the vote. Here&apos;s your lineup:</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {picks.map((c) => (
            <Link key={c.slug} href={`/chairs/${c.slug}`} className="chip px-3 py-1 text-sm hover:bg-butter">
              {c.name}
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/quote?chairs=${picks.map((c) => c.slug).join(",")}`} className="btn-primary">
            get a quote for these →
          </Link>
          <button
            className="btn-ghost"
            onClick={() => {
              setRound(0);
              setPicks([]);
            }}
          >
            play again
          </button>
        </div>
      </div>
    );
  }

  const [a, b] = matchups[round].map((s) => getChair(s)!);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between text-sm font-bold">
        <span>round {round + 1} / {matchups.length}</span>
        <div className="flex gap-1.5" aria-hidden>
          {matchups.map((_, i) => (
            <span key={i} className={`h-2.5 w-6 rounded-full border-2 border-ink ${i < round ? "bg-accent" : i === round ? "bg-butter" : "bg-surface"}`} />
          ))}
        </div>
      </div>
      <div className="relative grid grid-cols-2 gap-3 sm:gap-6">
        {[a, b].map((chair) => (
          <button
            key={chair.slug}
            onClick={() => pick(chair)}
            className="pop pop-hover overflow-hidden rounded-3xl bg-surface text-left"
          >
            <ChairArt chair={chair} className="aspect-square border-b-2 border-ink" />
            <span className="block p-3 font-serif text-lg leading-tight font-extrabold tracking-tight lowercase sm:p-4 sm:text-2xl">
              {chair.name}
            </span>
          </button>
        ))}
        <span className="pointer-events-none absolute top-[38%] left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] place-items-center rounded-full border-2 border-ink bg-butter font-serif text-lg font-extrabold shadow-[3px_3px_0_0_var(--ink)] sm:h-16 sm:w-16 sm:text-xl">
          or
        </span>
      </div>
    </div>
  );
}
