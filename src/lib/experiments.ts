"use client";

import { useEffect, useState } from "react";
import { GrowthBook } from "@growthbook/growthbook";
import { track } from "./analytics";

// A/B tests with GrowthBook (open source). Off until NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY is set:
// every hook then returns its fallback, so the site behaves exactly as before.
// Exposures go to GA4 as `experiment_viewed` so results can be read there or in GrowthBook.

const clientKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY;
const apiHost = process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST ?? "https://cdn.growthbook.io";

let gb: GrowthBook | null = null;
let ready: Promise<void> | null = null;

function visitorId() {
  try {
    let id = localStorage.getItem("bc-vid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("bc-vid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function client() {
  if (!clientKey || typeof window === "undefined") return null;
  if (!gb) {
    gb = new GrowthBook({
      apiHost,
      clientKey,
      attributes: { id: visitorId(), url: window.location.href, path: window.location.pathname },
      trackingCallback: (experiment, result) => track("experiment_viewed", { experiment_id: experiment.key, variation_id: String(result.key) }),
    });
    ready = gb.init({ timeout: 1500 }).then(() => undefined).catch(() => undefined);
  }
  return gb;
}

/** A feature flag value from GrowthBook, or `fallback` when GrowthBook is off or slow. */
export function useFeatureValue<T extends string | number | boolean>(key: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const g = client();
    if (!g || !ready) return;
    let live = true;
    ready.then(() => {
      if (live) setValue(g.getFeatureValue(key, fallback) as T);
    });
    return () => {
      live = false;
    };
  }, [key, fallback]);
  return value;
}
