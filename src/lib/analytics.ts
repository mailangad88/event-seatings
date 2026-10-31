// Client-side measurement helpers: GA4 events and first-touch attribution.
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
export function trackLead(kind: "quote" | "waitlist" | "quiz", source: string, extra: Params = {}) {
  track("generate_lead", { lead_type: kind, form_source: source, ...extra });
}

// ---- First-touch attribution -------------------------------------------------
// Captures where a visitor first came from (search engine, campaign, referrer,
// landing page) and sends it with every lead, so each lead in the admin/CRM can
// be traced to the keyword-targeted page or campaign that earned it.

const KEY = "es_first_touch";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type Attribution = Partial<Record<(typeof UTM)[number] | "gclid" | "referrer" | "landing_page" | "first_seen", string>>;

function read(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

export function captureFirstTouch() {
  if (typeof window === "undefined" || read()) return;
  const params = new URLSearchParams(window.location.search);
  const touch: Attribution = { landing_page: window.location.pathname, first_seen: new Date().toISOString() };
  for (const k of [...UTM, "gclid"] as const) {
    const v = params.get(k);
    if (v) touch[k] = v.slice(0, 150);
  }
  const ref = document.referrer;
  if (ref && !ref.startsWith(window.location.origin)) touch.referrer = ref.slice(0, 300);
  try {
    localStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    // Private mode or storage blocked: attribution is best-effort.
  }
}

export function getAttribution(): Attribution | undefined {
  if (typeof window === "undefined") return undefined;
  return read() ?? { landing_page: window.location.pathname };
}
