import Link from "next/link";
import type { Chair } from "@/data/chairs";
import { ChairArt } from "./ChairArt";
import { VoteButton } from "./VoteProvider";

export function ChairCard({ chair, index }: { chair: Chair; index?: number }) {
  return (
    <article className="group card card-hover relative flex flex-col overflow-hidden">
      <div className="relative overflow-hidden">
        <ChairArt
          chair={chair}
          className="aspect-[4/5] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute top-4 right-4 z-10">
          <VoteButton slug={chair.slug} />
        </div>
        {index !== undefined && (
          <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-2.5 py-0.5 text-xs text-muted">
            No. {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <h3 className="font-serif text-2xl leading-tight">
            <Link href={`/chairs/${chair.slug}`} className="after:absolute after:inset-0">
              {chair.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">{chair.tagline}</p>
        </div>
      </div>
      <div className="mx-5 mt-4 mb-5 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-1.5" aria-label="Finishes">
          {chair.finishes.map((f) => (
            <span
              key={f.name}
              title={f.name}
              className="h-3 w-3 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-bg"
              style={{ background: f.hex }}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-muted">Get a quote</span>
      </div>
    </article>
  );
}
