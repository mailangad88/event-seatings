// Where a visitor came from, so every lead in the CRM says which search, ad, email or post brought them in.
// First touch is kept for 90 days (the click that discovered us); last touch is the visit that converted.
// Everything lives in the visitor's own browser until they submit a form.

export const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "referrer",
  "landing_page",
] as const;

export type AttributionKey = (typeof attributionKeys)[number];
export type Touch = Partial<Record<AttributionKey, string>> & { at?: string };
export type Attribution = { first?: Touch; last?: Touch };

const storageKey = "lead-attribution";
const firstTouchDays = 90;
const clickIds = ["gclid", "fbclid", "msclkid"] as const;

function read(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}

// Call once per page view. Only visits that carry campaign info or an outside referrer start a new touch,
// so clicking around the site doesn't overwrite how someone found us.
export function recordVisit() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const touch: Touch = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", ...clickIds] as const) {
    const v = params.get(k);
    if (v) touch[k] = v.slice(0, 200);
  }

  let externalReferrer = "";
  try {
    if (document.referrer && new URL(document.referrer).host !== window.location.host) externalReferrer = document.referrer;
  } catch {}

  const saved = read();
  const firstExpired =
    !saved.first?.at || Date.now() - new Date(saved.first.at).getTime() > firstTouchDays * 864e5;
  if (Object.keys(touch).length === 0 && !externalReferrer && !firstExpired) return;

  if (externalReferrer) touch.referrer = externalReferrer.slice(0, 300);
  // Search engines and social apps send no UTMs, so name the source from the referrer.
  if (!touch.utm_source && externalReferrer) {
    const host = new URL(externalReferrer).hostname.replace(/^www\./, "");
    touch.utm_source = host;
    touch.utm_medium = /google|bing|duckduckgo|yahoo|ecosia|brave/.test(host) ? "organic" : "referral";
  }
  if (!touch.utm_source && touch.gclid) Object.assign(touch, { utm_source: "google", utm_medium: "cpc" });
  if (!touch.utm_source && Object.keys(touch).length === 0) Object.assign(touch, { utm_source: "(direct)" });
  touch.landing_page = (window.location.pathname + window.location.search).slice(0, 300);
  touch.at = new Date().toISOString();

  const next: Attribution = { first: firstExpired ? touch : saved.first, last: touch };
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {}
}

// The fields every lead form sends to /api/leads.
export function attributionFields(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const { first, last } = read();
  const out: Record<string, string> = { page_path: window.location.pathname };
  const pick = (t: Touch | undefined, prefix: string) => {
    for (const k of attributionKeys) if (t?.[k]) out[`${prefix}${k}`] = t[k]!;
  };
  pick(first, "first_");
  pick(last, "");
  const trail = readTrail();
  if (trail.length) out.pages_viewed = trail.join(" > ").slice(0, 1500);
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) out.visitor_tz = tz.slice(0, 60);
  } catch {}
  return out;
}

// The last pages this visitor looked at (this session and earlier ones), oldest first. Sent with each lead so the
// owner alert can say what they read before asking, e.g. "/rentals/chairs > /quote".
const trailKey = "lead-trail";
const trailMax = 15;

function readTrail(): string[] {
  try {
    const t = JSON.parse(localStorage.getItem(trailKey) ?? "[]");
    return Array.isArray(t) ? t.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function recordPage(path: string) {
  if (typeof window === "undefined" || path.startsWith("/admin")) return;
  const trail = readTrail();
  if (trail[trail.length - 1] === path) return;
  try {
    localStorage.setItem(trailKey, JSON.stringify([...trail, path.slice(0, 120)].slice(-trailMax)));
  } catch {}
}

// Short label for the visit that brought this visitor in, sent with each page view (e.g. "google / organic").
export function currentSource(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const t = read().last;
  return t?.utm_source ? [t.utm_source, t.utm_medium].filter(Boolean).join(" / ").slice(0, 100) : undefined;
}
