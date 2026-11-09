import { Icon } from "./Icon";

// Plain HTML search form (GET to /search): works with no JavaScript. The /search page then
// upgrades to live, as-you-type results once the index has loaded.
export function SearchBox({ className = "", id }: { className?: string; id?: string }) {
  return (
    <form action="/search" method="get" role="search" className={`relative ${className}`}>
      <Icon name="search" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
      <input
        type="search"
        name="q"
        id={id}
        placeholder="Search rentals, guides, FAQs…"
        aria-label="Search the site"
        className="input pl-9"
      />
    </form>
  );
}
