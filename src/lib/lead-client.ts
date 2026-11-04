"use client";

// Sends every site form to /api/leads so that no lead is lost to a bad connection:
// - Each submission gets an id. Sending the same details again (double click, "try again") reuses it, and
//   the server saves the lead once.
// - Network errors and server errors are retried twice (after about 0.6s and 1.8s).
// - If it still fails, the details wait on this device (localStorage "lead-outbox", up to 7 days) and are sent
//   on the visitor's next page view. The visitor still sees the form's error, so they can also try again.
// - form_ms (time since the page opened) lets the server spot forms filled by scripts.

const OUTBOX = "lead-outbox";
const KEYS = "lead-submission-keys";
const ENDPOINT = "/api/leads";
// Fields that change on their own between two sends of the same form; left out of the "same details" check.
const VOLATILE = new Set(["journey", "pages_viewed", "form_ms", "submission_id"]);

type Payload = Record<string, unknown>;
type Queued = { id: string; at: number; body: Payload };

function hash(text: string) {
  // FNV-1a: tiny and good enough to tell two forms apart.
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((k) => !VOLATILE.has(k))
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((value as Payload)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

function read<T>(store: Storage | undefined, key: string, fallback: T): T {
  try {
    const raw = store?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(store: Storage | undefined, key: string, value: unknown) {
  try {
    store?.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage full: the form still works, just without the safety copy.
  }
}

const session = () => (typeof window === "undefined" ? undefined : window.sessionStorage);
const local = () => (typeof window === "undefined" ? undefined : window.localStorage);

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
      );

/** The submission id for these details: the same id for the same details within an hour. */
export function submissionIdFor(body: Payload, now = Date.now()) {
  const key = hash(stable(body));
  const keys = read<Record<string, { id: string; at: number }>>(session(), KEYS, {});
  for (const [k, v] of Object.entries(keys)) if (now - v.at > 3600_000) delete keys[k];
  const id = keys[key]?.id ?? newId();
  keys[key] = { id, at: now };
  write(session(), KEYS, keys);
  return id;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const retryable = (status: number) => status === 408 || status === 429 || status >= 500;

async function send(body: Payload, keepalive = false) {
  return fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": String(body.submission_id) },
    body: JSON.stringify(body),
    keepalive,
  });
}

function enqueue(body: Payload) {
  const queue = read<Queued[]>(local(), OUTBOX, []).filter((q) => q.id !== body.submission_id);
  queue.push({ id: String(body.submission_id), at: Date.now(), body });
  write(local(), OUTBOX, queue.slice(-10));
}

function dequeue(id: string) {
  write(
    local(),
    OUTBOX,
    read<Queued[]>(local(), OUTBOX, []).filter((q) => q.id !== id),
  );
}

/**
 * Posts a form to /api/leads. Use it instead of fetch("/api/leads"): it adds the submission id and timing,
 * retries, and keeps a copy on the device if the server can't be reached. Returns the server's response
 * (or a 503 response when the network failed every time).
 */
export async function postLead(payload: Payload): Promise<Response> {
  const body: Payload = {
    ...payload,
    submission_id: submissionIdFor(payload),
    form_ms: typeof performance !== "undefined" ? Math.round(performance.now()) : undefined,
  };
  let last: Response | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      last = await send(body);
      if (!retryable(last.status)) {
        dequeue(String(body.submission_id));
        return last;
      }
    } catch {
      last = undefined;
    }
    if (attempt < 3) await wait(600 * 3 ** (attempt - 1));
  }
  enqueue(body);
  return (
    last ??
    new Response(
      JSON.stringify({ error: "We couldn't reach our server. Your details are saved on this device and will be sent automatically. You can also try again." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    )
  );
}

let flushing = false;
/** Sends any forms waiting on this device. Called once per page view (PageViewTracker). */
export async function flushLeadOutbox() {
  if (flushing || typeof window === "undefined") return;
  const queue = read<Queued[]>(local(), OUTBOX, []);
  if (!queue.length) return;
  flushing = true;
  try {
    for (const q of queue) {
      if (Date.now() - q.at > 7 * 864e5) {
        dequeue(q.id);
        continue;
      }
      try {
        const res = await send(q.body, true);
        // Saved, or turned down for a reason a retry won't fix: either way stop holding it.
        if (!retryable(res.status)) dequeue(q.id);
      } catch {
        return; // Still offline: try again on the next page.
      }
    }
  } finally {
    flushing = false;
  }
}
