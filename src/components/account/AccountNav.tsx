"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

type Counts = { unread: number; needs: number };
type Item = { href: string; label: string; icon: IconName; count?: number };

const isActive = (path: string, href: string) =>
  href === "/account" ? path === "/account" : path === href || path.startsWith(`${href}/`) || (href === "/account/orders" && path.startsWith("/account/events"));

function accountItems({ unread, needs }: Counts): Item[] {
  return [
    { href: "/account", label: "Overview", icon: "home", count: needs || undefined },
    { href: "/account/orders", label: "Orders", icon: "truck" },
    { href: "/account/payments", label: "Payments", icon: "wallet" },
    { href: "/account/messages", label: "Messages", icon: "chat", count: unread || undefined },
    { href: "/account/saved", label: "Plans and ideas", icon: "heart" },
    { href: "/account/profile", label: "Profile", icon: "users" },
  ];
}

// Dark sidebar on large screens.
export function AccountSidebar(counts: Counts) {
  const items = accountItems(counts);
  const path = usePathname() ?? "/account";
  return (
    <nav aria-label="Account" className="space-y-1">
      {items.map((it) => {
        const on = isActive(path, it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
              on ? "bg-surface-2 font-semibold text-ink" : "text-muted hover:bg-surface-2/60 hover:text-ink"
            }`}
          >
            <Icon name={it.icon} size={18} className={on ? "text-accent" : ""} />
            <span className="flex-1">{it.label}</span>
            {it.count ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink tabular-nums">{it.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

// Phones and tablets: a row of tabs that scrolls sideways.
export function AccountTabs(counts: Counts) {
  const items = accountItems(counts);
  const path = usePathname() ?? "/account";
  return (
    <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 lg:hidden">
      <ul className="flex gap-2 pb-1">
        {items.map((it) => {
          const on = isActive(path, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm whitespace-nowrap ${
                  on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink"
                }`}
              >
                <Icon name={it.icon} size={16} />
                {it.label}
                {it.count ? <span className="tabular-nums">({it.count})</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
