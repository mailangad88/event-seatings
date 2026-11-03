// Where a visitor came from, so every lead in the CRM says which search, ad, email or post brought them in.
// First touch is kept for 90 days (the click that discovered us); last touch is the visit that converted.
// Everything lives in the visitor's own browser until they submit a form.

import { trackingAllowed } from "./consent";
import { journeyMaxClicks, journeyMaxPages, type Journey } from "./journey";

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
  saveReferral(params.get("ref"));
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
  const journey = readJourneyForForm();
  if (journey) {
    out.pages_viewed = journey.pages.map((p) => p.path).join(" > ").slice(0, 1500);
    out.journey = JSON.stringify(journey);
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) out.visitor_tz = tz.slice(0, 60);
  } catch {}
  const ref = readReferral();
  if (ref) out.referral_code = ref;
  return out;
}

// The visitor's path through the site (lib/journey.ts): first visit, visit count and the last 30 pages with titles
// and times. Stays in this browser until a form is sent. Not kept when the visitor said no in the tracking notice.
const journeyKey = "lead-journey";
const newVisitAfterMs = 30 * 60_000;
type StoredJourney = Journey & { last_at?: string };

function readJourney(): StoredJourney | undefined {
  try {
    const j = JSON.parse(localStorage.getItem(journeyKey) ?? "null") as StoredJourney | null;
    return j && Array.isArray(j.pages) ? j : undefined;
  } catch {
    return undefined;
  }
}

// Strips the " | Beyond Chiavari" suffix so the owner sees what the page is about.
const pageTitle = () => document.title.replace(/\s*\|\s*Beyond Chiavari\s*$/i, "").trim().slice(0, 140) || undefined;

export function recordPage(path: string) {
  if (typeof window === "undefined" || path.startsWith("/admin") || !trackingAllowed()) return;
  const now = new Date();
  const j: StoredJourney = readJourney() ?? { first_seen: now.toISOString(), visits: 0, page_views: 0, pages: [] };
  const last = j.pages[j.pages.length - 1];
  const newVisit = !j.last_at || now.getTime() - new Date(j.last_at).getTime() > newVisitAfterMs;
  if (newVisit) j.visits += 1;
  j.last_at = now.toISOString();
  if (!newVisit && last?.path === path) return save(j);
  j.page_views += 1;
  j.pages = [...j.pages, { path: path.slice(0, 200), at: now.toISOString(), visit: j.visits }].slice(-journeyMaxPages);
  save(j);
  // The App Router sets the new page's <title> just after navigation, so read it a moment later.
  setTimeout(() => {
    const cur = readJourney();
    const entry = cur?.pages[cur.pages.length - 1];
    if (!cur || !entry || entry.path !== path.slice(0, 200) || entry.title) return;
    entry.title = pageTitle();
    save(cur);
  }, 700);

  function save(v: StoredJourney) {
    try {
      localStorage.setItem(journeyKey, JSON.stringify(v));
    } catch {}
  }
}

// Remembers a click on a link or button (its visible text and where it points, never anything typed into a form).
export function recordClick(label: string, href: string | undefined, path: string) {
  if (typeof window === "undefined" || path.startsWith("/admin") || !trackingAllowed()) return;
  const j = readJourney();
  if (!j) return;
  const clean = label.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!clean) return;
  const at = new Date().toISOString();
  const last = j.clicks?.[j.clicks.length - 1];
  if (last && last.label === clean && last.path === path && Date.now() - new Date(last.at).getTime() < 3000) return;
  j.clicks = [...(j.clicks ?? []), { label: clean, href: href?.slice(0, 200), path: path.slice(0, 200), at }].slice(-journeyMaxClicks);
  try {
    localStorage.setItem(journeyKey, JSON.stringify(j));
  } catch {}
}

export function readJourneyForForm(): Journey | undefined {
  if (!trackingAllowed()) return undefined;
  const j = readJourney();
  if (!j?.pages.length) return undefined;
  return { first_seen: j.first_seen, visits: j.visits, page_views: j.page_views, pages: j.pages, clicks: j.clicks };
}

// Referral links (/refer) look like beyondchiavari.com/?ref=priya-7k2m. The code is kept for 90 days and sent
// with every lead as referral_code. The latest friend's link wins if someone clicks two.
const referralKey = "lead-referral";
const referralDays = 90;

function saveReferral(raw: string | null) {
  const code = raw?.trim().toLowerCase();
  if (!code || !/^[a-z0-9][a-z0-9-]{2,31}$/.test(code)) return;
  try {
    localStorage.setItem(referralKey, JSON.stringify({ code, at: new Date().toISOString() }));
  } catch {}
}

export function readReferral(): string | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(referralKey) ?? "null") as { code?: string; at?: string } | null;
    if (!saved?.code || !saved.at) return undefined;
    return Date.now() - new Date(saved.at).getTime() < referralDays * 864e5 ? saved.code : undefined;
  } catch {
    return undefined;
  }
}

// Short label for the visit that brought this visitor in, sent with each page view (e.g. "google / organic").
export function currentSource(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const t = read().last;
  return t?.utm_source ? [t.utm_source, t.utm_medium].filter(Boolean).join(" / ").slice(0, 100) : undefined;
}
