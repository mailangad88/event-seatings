import Link from "next/link";
import { site } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export type Crumb = { name: string; href: string };

// Visible breadcrumb trail plus BreadcrumbList schema. "Home" is added automatically.
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-muted ${className}`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: `${site.url}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {all.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-line">/</span>}
            {i === all.length - 1 ? (
              <span aria-current="page" className="text-ink">{c.name}</span>
            ) : (
              <Link href={c.href} className="transition-colors hover:text-gold">{c.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
