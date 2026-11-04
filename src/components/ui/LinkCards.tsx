import Image from "next/image";
import Link from "@/components/Link";
import { iconFor } from "@/lib/icon-for";
import { Icon, type IconName } from "./Icon";

export type LinkCard = {
  href: string;
  label: string;
  text?: string;
  /** With an image the card is a small picture card; without, an icon card. */
  image?: { src: string; alt: string };
  /** Defaults to an icon picked from the label. */
  icon?: IconName;
};

const cols = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
} as const;

// Shows a list of links as tappable cards (icon or picture) instead of a plain text list,
// so hub, area and guide pages stay easy to scan. Use it anywhere there are more than 3 links.
export function LinkCards({
  items,
  columns = 3,
  compact = false,
  label,
  scrollOnPhone = false,
  className = "",
}: {
  items: LinkCard[];
  columns?: keyof typeof cols;
  /** Smaller single-line cards for long lists of related links. */
  compact?: boolean;
  /** Accessible name for the list (wrap in <nav> when it is navigation). */
  label?: string;
  /** On phones, show the cards as one swipeable row instead of a tall stack. */
  scrollOnPhone?: boolean;
  className?: string;
}) {
  const layout = scrollOnPhone
    ? `-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 ${cols[columns].replace(/^grid-cols-\d /, "")}`
    : `grid gap-3 sm:gap-4 ${cols[columns]}`;
  return (
    <ul aria-label={label} className={`${layout} ${className}`}>
      {items.map((it) => (
        <li key={it.href + it.label} className={scrollOnPhone ? "w-60 min-w-0 shrink-0 snap-start sm:w-auto" : "min-w-0"}>
          {it.image ? (
            <Link href={it.href} className="group card card-hover flex h-full items-center gap-4 overflow-hidden p-3">
              <span className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2 sm:w-28">
                <Image src={it.image.src} alt={it.image.alt} fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
              </span>
              <span className="min-w-0">
                <span className="block leading-snug font-medium transition-colors group-hover:text-accent">{it.label}</span>
                {it.text && <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted">{it.text}</span>}
              </span>
            </Link>
          ) : (
            <Link
              href={it.href}
              className={`group card card-hover flex h-full items-center gap-3 ${compact ? "p-3" : "p-4"}`}
            >
              <span className={`grid shrink-0 place-items-center rounded-xl bg-gold-soft text-gold ${compact ? "h-9 w-9" : "h-11 w-11"}`}>
                <Icon name={it.icon ?? iconFor(it.label)} size={compact ? 18 : 22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block leading-snug font-medium transition-colors group-hover:text-accent ${compact ? "text-sm" : ""}`}>{it.label}</span>
                {it.text && !compact && <span className="mt-0.5 line-clamp-2 block text-sm leading-6 text-muted">{it.text}</span>}
              </span>
              <Icon name="arrow" size={16} className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
