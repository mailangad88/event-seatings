"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/attribution";

// Remembers which search, ad or link brought the visitor here, so their lead carries it into the CRM.
// Runs once per full page load: in-site navigation keeps the original referrer, so it must not count as a new visit.
export function AttributionTracker() {
  useEffect(() => {
    recordVisit();
  }, []);
  return null;
}
