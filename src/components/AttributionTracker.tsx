"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import { currentSource, recordClick, recordPage, recordVisit } from "@/lib/attribution";
import { flushLeadOutbox } from "@/lib/lead-client";
import { trackActivity } from "@/lib/activity-client";

function visitorId() {
  try {
    let id = localStorage.getItem("es_visitor");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("es_visitor", id);
    }
    return id;
  } catch {
    return null;
  }
}

// Remembers which search, ad or link brought the visitor here, so their lead carries it into the CRM.
// recordVisit runs once per full page load: in-site navigation keeps the original referrer, so it must not count as a new visit.
// Every page (including in-site navigation) is also counted for the admin dashboard's visits and conversion rates.
export function AttributionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordVisit();
    // Forms that couldn't be sent earlier (no connection, server down) go now, and again when the connection returns.
    const flush = () => void flushLeadOutbox().catch(() => {});
    const t = window.setTimeout(flush, 2000);
    window.addEventListener("online", flush);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("online", flush);
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    recordPage(pathname);
    // Known visitors only (they've sent a form): what they look at next, for reminders. Title set after render.
    const t = window.setTimeout(() => trackActivity({ t: "page", path: pathname, title: document.title.slice(0, 140) }), 500);
    const visitor = navigator.webdriver ? null : visitorId();
    if (visitor) {
      const body = JSON.stringify({ path: pathname, visitor, source: currentSource() });
      try {
        if (!navigator.sendBeacon?.("/api/views", new Blob([body], { type: "application/json" }))) {
          fetch("/api/views", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
        }
      } catch {}
    }
    return () => window.clearTimeout(t);
  }, [pathname]);

  // Clicks on links and buttons, so the owner can see what caught their eye (labels and targets only).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("a[href], button, [role=button], summary");
      if (!el || el.closest("[data-no-track]")) return;
      const path = window.location.pathname;
      const label = el.getAttribute("aria-label") || el.dataset.trackLabel || el.textContent || el.getAttribute("title") || "";
      let href: string | undefined;
      const raw = el.getAttribute("href");
      if (raw) {
        try {
          const u = new URL(raw, window.location.href);
          href = u.host === window.location.host ? u.pathname + u.search : u.protocol.startsWith("http") ? u.host : u.protocol.replace(":", "");
        } catch {}
      }
      recordClick(label, href, path);
      trackActivity({ t: "click", path, label: label.replace(/\s+/g, " ").trim().slice(0, 80), href });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // "Form started": the first time a visitor types into any form on a page. Compared with sends in /admin,
  // this shows where people give up. Counted once per page per visit.
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    let sent = false;
    const onInput = (e: Event) => {
      const form = (e.target as HTMLElement | null)?.closest?.("form");
      if (sent || !form || (e.target as HTMLInputElement).name === "website") return;
      sent = true;
      track("form_start", { page: pathname, form: form.getAttribute("aria-label") ?? form.id ?? "" });
      const visitor = visitorId();
      if (!visitor || navigator.webdriver) return;
      const body = JSON.stringify({ path: pathname, visitor, event: "form_start" });
      try {
        navigator.sendBeacon?.("/api/views", new Blob([body], { type: "application/json" }));
      } catch {}
    };
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);
    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
    };
  }, [pathname]);

  return null;
}
