// Client-side measurement helpers: GA4 events. Lead attribution lives in lib/attribution.ts.
// Everything here is a no-op until NEXT_PUBLIC_GA_ID is set, so local dev and
// preview builds stay clean. Event names follow GA4's recommended events where
// one exists, so they show up in standard reports without custom setup.

const rawId = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const GA_ID = /^G-[A-Z0-9]+$/.test(rawId) ? rawId : "";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

// A lead form was submitted successfully. Mark generate_lead as a key event in GA4.
export function trackLead(kind: "quote" | "waitlist" | "quiz" | "call", source: string, extra: Params = {}) {
  track("generate_lead", { lead_type: kind, form_source: source, ...extra });
}
