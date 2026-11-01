import Link from "next/link";
import { ChairArt } from "./ChairArt";
import { getChair } from "@/data/chairs";

// A row of chair images with captions. Gives text-heavy pages a visual and links into the catalog.
export function ChairStrip({
  slugs = ["cross-back", "ghost", "velvet-dining", "rattan-garden"],
  caption,
  className = "",
}: {
  slugs?: string[];
  caption?: string;
  className?: string;
}) {
  const list = slugs.map((s) => getChair(s)).filter((c) => c !== undefined);
  return (
    <figure className={className}>
      <ul className={`grid grid-cols-2 gap-3 ${list.length > 3 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        {list.map((c) => (
          <li key={c.slug}>
            <Link href={`/chairs/${c.slug}`} className="group block">
              <ChairArt chair={c} className="aspect-[4/5] transition-opacity group-hover:opacity-85" />
              <span className="mt-2 block text-[11px] tracking-[0.18em] text-muted uppercase group-hover:text-ink">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      {caption && <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}
