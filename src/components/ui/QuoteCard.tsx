import Link from "next/link";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

// Compact sidebar card for content pages: nudges readers to price their event.
export function QuoteCard({ source, title = "Planning an event?" }: { source?: string; title?: string }) {
  const q = source ? `?from=${encodeURIComponent(source)}` : "";
  return (
    <div className="card p-6">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold">
        <Icon name="quote" size={22} />
      </span>
      <p className="mt-4 font-heading font-semibold text-2xl leading-tight">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Pick your rentals, see live prices and get one quote for everything, delivered across {site.marketLong}.
      </p>
      <Link href={`/quote${q}`} className="btn-primary mt-5 w-full">Build your quote</Link>
      <Link href={`/book${q}`} className="mt-3 block text-center text-sm font-medium text-gold hover:underline">
        or book a free call
      </Link>
    </div>
  );
}
