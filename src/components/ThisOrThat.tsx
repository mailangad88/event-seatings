"use client";

import Link from "next/link";
import { useState } from "react";
import { getChair, type Chair } from "@/data/chairs";
import { ChairArt } from "./ChairArt";
import { useVotes } from "./VoteProvider";

// Head-to-head chair pairings. Each choice is saved as a wishlist vote,
// so this doubles as demand research.
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
      <div className="border border-line bg-surface px-6 py-14 text-center sm:px-12">
        <p className="eyebrow justify-center">Your edit</p>
        <p className="headline mt-5 text-4xl sm:text-5xl">
          A considered <em>selection</em>.
        </p>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Your choices have been saved to your wishlist and counted toward our founding collection.
        </p>
        <ul className="mx-auto mt-8 flex max-w-lg flex-wrap justify-center gap-x-6 gap-y-2 font-serif text-xl italic">
          {picks.map((c) => (
            <li key={c.slug}>
              <Link href={`/chairs/${c.slug}`} className="hover:text-gold">{c.name}</Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href={`/quote?chairs=${picks.map((c) => c.slug).join(",")}`} className="btn-primary">
            Request a quote
          </Link>
          <button
            className="btn-ghost"
            onClick={() => {
              setRound(0);
              setPicks([]);
            }}
          >
            Begin again
          </button>
        </div>
      </div>
    );
  }

  const [a, b] = matchups[round].map((s) => getChair(s)!);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-6">
        <span className="text-[11px] tracking-[0.25em] text-muted uppercase">
          {String(round + 1).padStart(2, "0")} / {String(matchups.length).padStart(2, "0")}
        </span>
        <span className="relative h-px flex-1 bg-line">
          <span className="absolute inset-y-0 left-0 bg-gold transition-all duration-500" style={{ width: `${(round / matchups.length) * 100}%` }} />
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        {[a, b].map((chair, i) => (
          <button
            key={chair.slug}
            onClick={() => pick(chair)}
            className={`group text-left ${i === 1 ? "order-3" : ""}`}
          >
            <span className="block overflow-hidden">
              <ChairArt chair={chair} className="aspect-[4/5] transition-transform duration-700 group-hover:scale-[1.04]" />
            </span>
            <span className="mt-3 block font-serif text-lg leading-tight font-light sm:text-2xl">{chair.name}</span>
            <span className="mt-1 block text-[10px] tracking-[0.22em] text-muted uppercase transition-colors group-hover:text-gold">
              Choose →
            </span>
          </button>
        ))}
        <span className="order-2 font-serif text-2xl text-gold italic sm:text-4xl">or</span>
      </div>
    </div>
  );
}
