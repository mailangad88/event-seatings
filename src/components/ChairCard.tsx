import Link from "next/link";
import type { Chair } from "@/data/chairs";
import { ChairArt } from "./ChairArt";
import { VoteButton } from "./VoteProvider";

export function ChairCard({ chair }: { chair: Chair }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-md">
      <ChairArt chair={chair} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          {chair.styles.slice(0, 3).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
        <h3 className="mt-3 font-serif text-2xl leading-tight">
          <Link href={`/chairs/${chair.slug}`} className="after:absolute after:inset-0">
            {chair.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{chair.tagline}</p>
        <div className="mt-4 flex items-center gap-1.5" aria-label="Finishes">
          {chair.finishes.map((f) => (
            <span
              key={f.name}
              title={f.name}
              className="h-4 w-4 rounded-full border border-black/10"
              style={{ background: f.hex }}
            />
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm">
            <span className="text-muted">Est. </span>
            {chair.estPrice}
            {!chair.estPrice.includes("/") && <span className="text-muted"> / chair</span>}
          </span>
          <div className="relative z-10">
            <VoteButton slug={chair.slug} />
          </div>
        </div>
      </div>
    </article>
  );
}
