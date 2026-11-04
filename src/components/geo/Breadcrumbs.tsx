import Link from "@/components/Link";
import { site } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  const all = [{ href: "/", label: "Home" }, ...items];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${site.url}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        {all.map((c, i) => (
          <span key={c.href}>
            {i > 0 && (
              <span className="mx-2 text-line" aria-hidden>
                /
              </span>
            )}
            {i < all.length - 1 ? (
              <Link href={c.href} className="inline-block py-1 hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
