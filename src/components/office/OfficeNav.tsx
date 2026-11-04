"use client";

import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

// Sidebar links for any back office (admin today, vendor portal later). The shell passes the menu in,
// so each portal keeps its own list but looks the same.

export type OfficeNavItem = { href: string; label: string; icon: IconName };
export type OfficeNavGroup = { group: string; items: OfficeNavItem[] };
// Small number next to a link: rose = something is wrong, amber = waiting on you, plain = a count.
export type NavCounts = Record<string, { n: number; tone?: "rose" | "amber" }>;

export const isActiveHref = (path: string, href: string, root: string) =>
  href === root ? path === root : path === href || path.startsWith(`${href}/`);

function Links({ nav, counts, root, path }: { nav: OfficeNavGroup[]; counts: NavCounts; root: string; path: string }) {
  return (
    <nav aria-label="Back office" className="space-y-5">
      {nav.map((g) => (
        <div key={g.group}>
          <p className="px-3 text-xs font-medium tracking-widest text-muted uppercase">{g.group}</p>
          <ul className="mt-1.5 space-y-0.5">
            {g.items.map((it) => {
              const on = isActiveHref(path, it.href, root);
              const c = counts[it.href];
              return (
                <li key={it.href}>
                  <Link href={it.href} aria-current={on ? "page" : undefined} className={`office-nav-link ${on ? "office-nav-on" : ""}`}>
                    <Icon name={it.icon} size={18} />
                    <span className="flex-1">{it.label}</span>
                    {c && c.n > 0 && (
                      <span className={`min-w-6 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums ${c.tone === "rose" ? "bg-rose text-surface" : c.tone === "amber" ? "bg-amber text-surface" : "bg-surface-2 text-ink"}`}>
                        {c.n}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function OfficeSidebarNav({ nav, counts, root }: { nav: OfficeNavGroup[]; counts: NavCounts; root: string }) {
  const path = usePathname() ?? root;
  return <Links nav={nav} counts={counts} root={root} path={path} />;
}

// Phones and tablets: the same menu folded into one button.
export function OfficeMobileNav({ nav, counts, root }: { nav: OfficeNavGroup[]; counts: NavCounts; root: string }) {
  const path = usePathname() ?? root;
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [path]);
  const current = nav.flatMap((g) => g.items).find((it) => isActiveHref(path, it.href, root));
  return (
    <details ref={ref} className="group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <Icon name="menu" size={18} />
        {current?.label ?? "Menu"}
      </summary>
      <div className="absolute inset-x-0 top-full z-50 max-h-dvh overflow-y-auto border-b border-line bg-espresso px-3 pt-4 pb-8 shadow-lift">
        <Links nav={nav} counts={counts} root={root} path={path} />
      </div>
    </details>
  );
}
