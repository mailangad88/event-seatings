"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import { currentSource, recordPage, recordVisit } from "@/lib/attribution";

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
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    recordPage(pathname);
    if (navigator.webdriver) return;
    const visitor = visitorId();
    if (!visitor) return;
    const body = JSON.stringify({ path: pathname, visitor, source: currentSource() });
    try {
      if (!navigator.sendBeacon?.("/api/views", new Blob([body], { type: "application/json" }))) {
        fetch("/api/views", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [pathname]);

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
