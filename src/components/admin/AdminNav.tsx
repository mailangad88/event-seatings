"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

type Item = { href: string; label: string; icon: IconName };

// The admin sidebar. Grouped by when you use it: daily work, selling, growing, money, setup.
export const adminNav: { group: string; items: Item[] }[] = [
  {
    group: "Daily",
    items: [
      { href: "/admin", label: "Today", icon: "home" },
      { href: "/admin/week", label: "This week", icon: "clock" },
      { href: "/admin/calendar", label: "Calendar", icon: "calendar" },
    ],
  },
  {
    group: "Sell",
    items: [
      { href: "/admin/leads", label: "Leads", icon: "inbox" },
      { href: "/admin/proposals", label: "Proposals", icon: "quote" },
      { href: "/admin/customers", label: "Customers", icon: "users" },
      { href: "/admin/vendors", label: "Vendors", icon: "truck" },
      { href: "/admin/pricing", label: "Pricing", icon: "chart" },
      { href: "/admin/applications", label: "Vendor applications", icon: "plus" },
    ],
  },
  {
    group: "Grow",
    items: [
      { href: "/admin/followups", label: "Follow-up emails", icon: "mail" },
      { href: "/admin/emails", label: "Email previews", icon: "quote" },
      { href: "/admin/reviews", label: "Reviews", icon: "star" },
      { href: "/admin/referrals", label: "Referrals", icon: "heart" },
    ],
  },
  {
    group: "Money",
    items: [
      { href: "/admin/payments", label: "Booking fees", icon: "wallet" },
      { href: "/admin/invoices", label: "Invoices", icon: "quote" },
      { href: "/admin/reports", label: "Sales report", icon: "chart" },
    ],
  },
  {
    group: "Setup",
    items: [{ href: "/admin/settings", label: "Site settings", icon: "sliders" }],
  },
];

const isActive = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));

function Links({ path }: { path: string }) {
  return (
    <nav aria-label="Admin" className="space-y-6">
      {adminNav.map((g) => (
        <div key={g.group}>
          <p className="px-3 text-[11px] font-medium tracking-[0.18em] text-muted uppercase">{g.group}</p>
          <ul className="mt-2 space-y-1">
            {g.items.map((it) => {
              const on = isActive(path, it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={on ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition-colors ${
                      on ? "bg-accent text-accent-ink" : "text-ink hover:bg-surface-2"
                    }`}
                  >
                    <Icon name={it.icon} size={18} />
                    {it.label}
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

export function AdminSidebar() {
  const path = usePathname() ?? "/admin";
  return <Links path={path} />;
}

// Phones and tablets: the same menu, folded into one button above the page.
export function AdminMobileNav() {
  const path = usePathname() ?? "/admin";
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [path]);
  const current = adminNav.flatMap((g) => g.items).find((it) => isActive(path, it.href));
  return (
    <details ref={ref} className="group border-b border-line bg-surface lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <Icon name="menu" size={18} />
          {current?.label ?? "Menu"}
        </span>
        <span className="text-sm text-muted group-open:hidden">All sections</span>
        <span className="hidden text-sm text-muted group-open:inline">Close</span>
      </summary>
      <div className="px-2 pt-2 pb-5">
        <Links path={path} />
      </div>
    </details>
  );
}
