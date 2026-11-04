// Browser error reporting: uncaught errors and promise rejections are sent (at most 3 per page view)
// to /api/client-errors, which forwards them to the alert webhook. No third-party script.
let sent = 0;
const seen = new Set<string>();

function report(message: string, source?: string) {
  try {
    if (sent >= 3 || !message || seen.has(message)) return;
    // Noise from extensions and cancelled loads (the server filters again in src/lib/client-errors.ts).
    if (/ResizeObserver|-extension:\/\/|webkit-masked-url|^Script error|Load failed|NetworkError|Failed to fetch|AbortError/i.test(message + (source ?? ""))) return;
    seen.add(message);
    sent++;
    const body = JSON.stringify({ message: message.slice(0, 500), source: source?.slice(0, 300), path: location.pathname, ua: navigator.userAgent.slice(0, 200) });
    if (!navigator.sendBeacon?.("/api/client-errors", new Blob([body], { type: "application/json" }))) {
      fetch("/api/client-errors", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {}
}

try {
  window.addEventListener("error", (e) => report(e.message || String(e.error), e.filename ? `${e.filename}:${e.lineno}` : undefined));
  window.addEventListener("unhandledrejection", (e) => report(e.reason instanceof Error ? e.reason.message : String(e.reason)));
} catch {}
