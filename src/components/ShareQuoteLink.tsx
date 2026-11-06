"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { listLink, type ListLine } from "@/lib/quote-list";
import { Icon } from "./ui/Icon";

// "Share this list": a link that rebuilds the current picks and guest count on any device, so a visitor
// can text or email it to a partner or planner without waiting on us to send anything. Uses the native
// share sheet on phones, and copies the link on desktop (or if the visitor cancels the share sheet).
export function ShareQuoteLink({ items, guests }: { items: Record<string, ListLine>; guests: number }) {
  const [copied, setCopied] = useState(false);
  if (Object.keys(items).length === 0) return null;

  async function share() {
    const url = listLink({ items, guests: guests || undefined }, window.location.origin);
    track("cta_click", { cta: "share_quote_list" });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My event rental list", url });
        return;
      } catch {
        // Cancelled or unsupported mid-call; fall back to copying the link.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-2 flex w-full items-center justify-center gap-1.5 text-sm text-accent hover:underline"
    >
      <Icon name="share" size={14} />
      {copied ? "Link copied" : "Share this list"}
    </button>
  );
}
