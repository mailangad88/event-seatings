// First-touch attribution for leads from Instagram, Facebook, YouTube Shorts and ads.
// Captured once per browser session when the visitor lands, then sent with every lead form.
// Client-only: call these from event handlers or effects, never during render.

const KEY = "es_attr";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

export type Attribution = Partial<Record<(typeof UTM)[number] | "landing_page" | "referrer", string>>;

// Social apps often strip UTMs but leave a click id or a referrer we can read.
function inferSource(params: URLSearchParams, referrer: string): string | undefined {
  if (params.get("fbclid")) return "facebook";
  if (params.get("igshid")) return "instagram";
  if (params.get("ttclid")) return "tiktok";
  if (params.get("gclid")) return "google";
  const host = referrer ? new URL(referrer).hostname : "";
  if (/instagram\./.test(host)) return "instagram";
  if (/facebook\.|fb\.me/.test(host)) return "facebook";
  if (/youtube\.|youtu\.be/.test(host)) return "youtube";
  if (/pinterest\./.test(host)) return "pinterest";
  if (/google\./.test(host)) return "google";
  return undefined;
}

export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const hasUtm = UTM.some((k) => params.get(k));
    // Keep the first touch unless a new tagged link arrives.
    if (sessionStorage.getItem(KEY) && !hasUtm) return;
    const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
    const attr: Attribution = { landing_page: window.location.pathname + window.location.search };
    for (const k of UTM) {
      const v = params.get(k);
      if (v) attr[k] = v.slice(0, 150);
    }
    attr.utm_source ??= inferSource(params, referrer);
    if (referrer) attr.referrer = referrer.slice(0, 300);
    sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    // Private mode or blocked storage: leads still go through, just without attribution.
  }
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}
