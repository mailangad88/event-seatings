"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { currentSource, recordVisit } from "@/lib/attribution";

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
    if (!pathname || pathname.startsWith("/admin") || navigator.webdriver) return;
    const visitor = visitorId();
    if (!visitor) return;
    const body = JSON.stringify({ path: pathname, visitor, source: currentSource() });
    try {
      if (!navigator.sendBeacon?.("/api/views", new Blob([body], { type: "application/json" }))) {
        fetch("/api/views", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [pathname]);

  return null;
}
