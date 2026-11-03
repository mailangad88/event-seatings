"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

// Sticky "Get a quote" bar on phones, on every page that doesn't already have its own bottom bar.
// Item pages (add to quote), /looks/* (get this look), /quote (continue) and the admin have their own.
const hidden = [/^\/quote/, /^\/admin/, /^\/embed/, /^\/rentals\/[^/]+\/[^/]+/, /^\/looks\/[^/]+/, /^\/book/, /^\/partners/];

export function MobileCtaBar() {
  const pathname = usePathname() ?? "/";
  if (hidden.some((r) => r.test(pathname))) return null;
  return (
    <>
      {/* Keeps the footer's last links clear of the bar. */}
      <div aria-hidden className="h-[72px] md:hidden" />
      <nav aria-label="Quick actions" className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-surface/95 py-3 pr-20 pl-4 shadow-[0_-8px_24px_rgb(0_0_0/0.08)] backdrop-blur md:hidden">
        <Link
          href="/quote?from=mobile-bar"
          className="btn-primary btn-sm flex-1"
          onClick={() => track("cta_click", { cta: "mobile_bar_quote", page: pathname })}
        >
          Get a free quote
        </Link>
        <Link
          href="/book"
          className="btn-ghost btn-sm"
          onClick={() => track("cta_click", { cta: "mobile_bar_call", page: pathname })}
        >
          Call
        </Link>
      </nav>
    </>
  );
}
