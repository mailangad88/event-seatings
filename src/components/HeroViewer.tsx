"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getChair } from "@/data/chairs";
import { ChairArt } from "./ChairArt";
import { ChairCanvas } from "./ChairViewer";

const picks = ["velvet-dining", "cross-back", "ghost", "rattan-garden"].map((s) => getChair(s)!);

// Home hero: a live, slowly turning 3D chair in a gold frame, with thumbnails to switch pieces.
export function HeroViewer() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const chair = picks[i];

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setI((n) => (n + 1) % picks.length), 9000);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <div>
      <div className="relative border border-gold/50 p-3 sm:p-4">
        <ChairCanvas chair={chair} color={chair.finishes[0].hex} className="aspect-[4/5]" priority />
        <span className="absolute -top-px left-8 -translate-y-1/2 bg-bg px-3 text-[10px] tracking-[0.35em] text-gold uppercase">
          The Founding Collection
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-serif text-2xl leading-tight font-light">{chair.name}</p>
          <Link href={`/chairs/${chair.slug}`} className="link-line mt-2 text-gold">
            View piece
          </Link>
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Featured chairs">
          {picks.map((c, n) => (
            <button
              key={c.slug}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={c.name}
              onClick={() => {
                setAuto(false);
                setI(n);
              }}
              className={`relative h-14 w-11 overflow-hidden outline outline-1 outline-offset-2 transition ${n === i ? "outline-gold" : "outline-transparent opacity-70 hover:opacity-100"}`}
            >
              <ChairArt chair={c} className="absolute inset-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
