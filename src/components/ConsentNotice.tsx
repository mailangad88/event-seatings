"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { setTrackingChoice, trackingChoice } from "@/lib/consent";

// Small notice shown until the visitor picks. We remember which pages they look at (in their own browser) so a
// quote request arrives with context, and we load Google Analytics. "No thanks" turns both off and clears the list.
export function ConsentNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (navigator.webdriver || window.location.pathname.startsWith("/admin")) return;
    const t = setTimeout(() => setOpen(!trackingChoice()), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;
  const pick = (c: "ok" | "no") => {
    setTrackingChoice(c);
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Privacy choice"
      className="fixed inset-x-3 bottom-20 z-40 rounded-2xl border border-line bg-surface p-3.5 text-sm sm:p-4 text-ink shadow-[0_12px_40px_rgb(0_0_0/0.18)] sm:right-auto sm:bottom-6 sm:left-6 sm:max-w-sm"
    >
      <p className="leading-5 sm:leading-6">
        We remember the pages you look at here and send them with any form you fill in, so we know what you&apos;re
        planning. After you send a form, we may email you a reminder about what you looked at. We also count visits
        with Google Analytics. No ads, and we never sell it.{" "}
        <Link href="/privacy#cookies" className="text-accent underline">Privacy</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => pick("ok")} className="btn-primary px-4 py-2 text-sm">
          OK
        </button>
        <button type="button" onClick={() => pick("no")} className="btn-ghost px-4 py-2 text-sm">
          No thanks
        </button>
      </div>
    </div>
  );
}
