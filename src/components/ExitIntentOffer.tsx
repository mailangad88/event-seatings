"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DownloadGate } from "@/components/DownloadGate";
import { getDownload } from "@/data/downloads";
import { track } from "@/lib/analytics";

// Offers the free Event Planning Kit to someone about to leave without a quote or a call booked.
// Shows once per browser tab session, on desktop when the cursor leaves toward the top of the page
// (the classic "closing the tab" move) and on any device after a long scroll with no action taken.
// Never on pages that already ask for an email, or on admin/embed/account pages.
const hiddenOn = [/^\/admin/, /^\/embed/, /^\/account/, /^\/downloads/, /^\/quote/, /^\/book/, /^\/proposal/];
const SHOWN_KEY = "bc-exit-offer-shown";
const DWELL_MS = 20_000;
const SCROLL_DEPTH = 0.65;

const slug = "event-planning-kit";

export function ExitIntentOffer() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);
  const dwellRef = useRef(false);

  const eligible = !hiddenOn.some((r) => r.test(pathname));

  useEffect(() => {
    if (!eligible) return;
    try {
      if (sessionStorage.getItem(SHOWN_KEY)) shownRef.current = true;
    } catch {
      // Private mode: fall back to showing at most once per tab via shownRef alone.
    }

    const dwellTimer = setTimeout(() => {
      dwellRef.current = true;
    }, DWELL_MS);

    const reveal = () => {
      if (shownRef.current || !dwellRef.current) return;
      shownRef.current = true;
      setOpen(true);
      track("exit_intent_shown", { page: pathname });
      try {
        sessionStorage.setItem(SHOWN_KEY, "1");
      } catch {
        // Not critical.
      }
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) reveal();
    };
    const onScroll = () => {
      const depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (depth >= SCROLL_DEPTH) reveal();
    };

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(dwellTimer);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [eligible, pathname]);

  if (!eligible || !open) return null;
  const d = getDownload(slug);
  if (!d) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Free event planning kit"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink shadow-md hover:text-gold"
        >
          ×
        </button>
        <p className="mb-3 text-center text-sm leading-6 text-ink/90">
          Before you go, grab this free planning kit. It covers venues, vendors and a rental checklist for your guest count.
        </p>
        <DownloadGate slug={d.slug} title={d.title} files={d.files} compact placement="exit-intent" />
      </div>
    </div>
  );
}
