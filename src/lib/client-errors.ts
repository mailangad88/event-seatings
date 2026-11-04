// Checks for browser error reports sent to /api/client-errors. Pure functions, no server imports,
// so they can be unit tested on their own.

export type ClientErrorReport = { message: string; source?: string; path?: string; ua?: string };

// Errors that come from browser extensions, the browser itself, or cancelled loads. None of them
// are bugs in the site, so they are dropped before they become alerts.
const NOISE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i, // cross-origin script with no details
  /(chrome|moz|safari|safari-web|ms-browser)-extension:\/\//i,
  /webkit-masked-url:\/\//i,
  /Non-Error promise rejection captured/i,
  /__gCrWeb|__firefox__|ethereum|MetaMask|solana|tronweb/i,
  /Load failed|NetworkError|Failed to fetch|AbortError|The operation was aborted/i,
  /^(Uncaught )?(Error: )?(null|undefined|\[object Object\])$/i,
];

const cap = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : undefined);

/** Validates and trims a raw report. Returns null when it is not a usable report. */
export function parseClientError(body: unknown): ClientErrorReport | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const message = cap(b.message, 500);
  if (!message) return null;
  const path = cap(b.path, 200);
  return {
    message,
    source: cap(b.source, 300),
    // Only a site path, never a full URL from somewhere else; the query string can hold personal details.
    path: path && path.startsWith("/") ? path.split(/[?#]/)[0] : undefined,
    ua: cap(b.ua, 200),
  };
}

/** True for errors that are not the site's fault (extensions, ResizeObserver, cancelled requests). */
export function isClientErrorNoise(r: Pick<ClientErrorReport, "message" | "source">): boolean {
  return NOISE.some((re) => re.test(r.message) || (r.source ? re.test(r.source) : false));
}
