"use client";

import { useEffect, useState } from "react";

// Dates blocked in /admin/availability, fetched once per page. Empty until loaded or if the request fails.
export function useBlockedDates() {
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    let live = true;
    fetch("/api/availability")
      .then((r) => (r.ok ? r.json() : { blocked: [] }))
      .then((j: { blocked?: string[] }) => live && setBlocked(new Set(j.blocked ?? [])))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return blocked;
}

export const blockedMessage = "That date is fully booked. Please pick another date, or tell us in the notes and we'll check partner availability.";
