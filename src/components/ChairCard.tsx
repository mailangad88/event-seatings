import Link from "next/link";
import type { Chair } from "@/data/chairs";
import { ChairArt } from "./ChairArt";
import { VoteButton } from "./VoteProvider";

export function ChairCard({ chair }: { chair: Chair }) {
  return (
    <article className="pop pop-hover group relative flex flex-col overflow-hidden rounded-3xl bg-surface">
      <div className="relative border-b-2 border-ink">
        <ChairArt chair={chair} className="aspect-[4/3]" />
        <span className="absolute top-3 left-3 rounded-full border-2 border-ink bg-surface px-2.5 py-0.5 text-xs font-bold">
          {chair.estPrice}
          {!chair.estPrice.includes("/") && <span className="font-medium text-muted">/chair</span>}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-2xl leading-[1.05] font-extrabold tracking-tight lowercase">
          <Link href={`/chairs/${chair.slug}`} className="after:absolute after:inset-0">
            {chair.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm text-muted">{chair.tagline}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="flex items-center -space-x-1" aria-label="Finishes">
            {chair.finishes.map((f) => (
              <span
                key={f.name}
                title={f.name}
                className="h-5 w-5 rounded-full border-2 border-ink"
                style={{ background: f.hex }}
              />
            ))}
          </div>
          <div className="relative z-10">
            <VoteButton slug={chair.slug} />
          </div>
        </div>
      </div>
    </article>
  );
}
