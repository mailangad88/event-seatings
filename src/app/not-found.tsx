import Link from "@/components/Link";
import { Figure, Icon } from "@/components/ui";
import { rentalCategories } from "@/lib/nav";
import { scenes } from "@/lib/scenes";

export default function NotFound() {
  return (
    <div className="container-x grid items-center gap-12 py-20 md:grid-cols-[1.1fr_1fr] md:py-28">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display-1 mt-4">
          This seat is <em className="text-gold">empty</em>
        </h1>
        <p className="lede mt-5">We couldn&apos;t find that page. Try one of these instead.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/rentals" className="btn-primary">Browse rentals</Link>
          <Link href="/quote" className="btn-ghost">Build a quote</Link>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {rentalCategories.slice(0, 8).map((c) => (
            <li key={c.id}>
              <Link href={`/rentals/${c.id}`} className="chip hover:border-ink hover:text-ink">
                <Icon name={c.icon} size={14} className="text-gold" /> {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Figure {...scenes.blushLongTable} ratio="4/5" className="mx-auto w-full max-w-sm" sizes="(max-width: 768px) 100vw, 35vw" />
    </div>
  );
}
