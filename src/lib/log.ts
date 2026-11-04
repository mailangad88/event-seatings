// Structured logs: one JSON line per event, so Vercel runtime logs can be searched by `event` or
// `level`. Everything passed in is run through redact() first, so emails, phone numbers, tokens,
// cookies and passwords never reach the logs in full. No dependencies; safe in Node and Edge.
//
//   log.error("lead_save_failed", { err, leadId: lead.id, email: lead.email });
//   -> {"level":"error","event":"lead_save_failed","time":"…","leadId":"…","email":"a***@gmail.com","err":{…}}

export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogFields = Record<string, unknown>;

const MAX_STRING = 1000;
const MAX_DEPTH = 5;
const MAX_ITEMS = 50;

// Keys whose values are dropped outright.
const SECRET_KEY = /authorization|cookie|secret|token|passw(or)?d|api[-_]?key|apikey|signature|session|credential|private[-_]?key|bearer/i;
const EMAIL_KEY = /e-?mail/i;
const PHONE_KEY = /phone|mobile|^tel$|^sms$|whatsapp/i;
// Keys holding ids or hashes, which can look like phone numbers but are not.
const ID_KEY = /^(digest|id|.*[-_]id|.*Id|reqId|requestId|time|ts|status|count|amount)$/;

const EMAIL_RE = /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
// US-style numbers: 3125551234, (312) 555-1234, +1 312.555.1234.
const PHONE_RE = /(?<![\d-])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?![\d-])/g;

/** "alice@example.com" -> "a***@example.com". Non-emails come back unchanged. */
export function redactEmail(s: string): string {
  return s.replace(EMAIL_RE, (_m, first: string, domain: string) => `${first}***@${domain}`);
}

/** Masks every digit but the last two: "(312) 555-1234" -> "(***) ***-**34". */
export function redactPhone(s: string): string {
  const total = (s.match(/\d/g) ?? []).length;
  let seen = 0;
  return s.replace(/\d/g, (d) => (++seen > total - 2 ? d : "*"));
}

/** Scrubs emails and phone numbers that appear inside free text (error messages, notes). */
export function redactText(s: string): string {
  const out = redactEmail(s).replace(PHONE_RE, (m) => redactPhone(m));
  return out.length > MAX_STRING ? `${out.slice(0, MAX_STRING)}…` : out;
}

/** True for keys like authorization, cookie, x-api-key, client_secret, password, stripe-signature. */
export function isSecretKey(key: string): boolean {
  return SECRET_KEY.test(key);
}

/** Error -> plain object with a short, redacted stack. Keeps `digest` and `code` when present. */
export function serializeError(err: unknown): LogFields {
  if (err instanceof Error) {
    const e = err as Error & { digest?: unknown; code?: unknown; cause?: unknown };
    const out: LogFields = { name: e.name, message: redactText(e.message) };
    if (e.digest !== undefined) out.digest = String(e.digest);
    if (e.code !== undefined) out.code = String(e.code);
    if (e.stack) out.stack = redactText(e.stack.split("\n").slice(0, 6).join("\n"));
    if (e.cause !== undefined) out.cause = e.cause instanceof Error ? redactText(e.cause.message) : redactText(String(e.cause));
    return out;
  }
  return { message: redactText(typeof err === "string" ? err : safeString(err)) };
}

function safeString(v: unknown): string {
  try {
    return typeof v === "object" ? JSON.stringify(v) ?? String(v) : String(v);
  } catch {
    return String(v);
  }
}

/**
 * Deep copy of `value` that is safe to log: secret-looking keys become "[redacted]", email and phone
 * keys are masked, free text is scrubbed, Errors are serialized, and size is capped.
 */
export function redact(value: unknown, key = "", depth = 0): unknown {
  if (key && isSecretKey(key)) return value === undefined || value === null || value === "" ? value : "[redacted]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    if (key && EMAIL_KEY.test(key)) return redactEmail(value).slice(0, MAX_STRING);
    if (key && PHONE_KEY.test(key)) return redactPhone(value).slice(0, MAX_STRING);
    if (key && ID_KEY.test(key)) return redactEmail(value).slice(0, MAX_STRING);
    return redactText(value);
  }
  if (typeof value === "number" && key && PHONE_KEY.test(key)) return redactPhone(String(value));
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "function" || typeof value === "symbol") return undefined;
  if (value instanceof Error) return serializeError(value);
  if (value instanceof Date) return value.toISOString();
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ITEMS).map((v) => redact(v, key, depth + 1));
    if (value.length > MAX_ITEMS) items.push(`[+${value.length - MAX_ITEMS} more]`);
    return items;
  }
  if (typeof Headers !== "undefined" && value instanceof Headers) {
    return redact(Object.fromEntries(value.entries()), key, depth);
  }
  const out: Record<string, unknown> = {};
  let n = 0;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (n++ >= MAX_ITEMS) {
      out["…"] = "[truncated]";
      break;
    }
    const r = redact(v, k, depth + 1);
    if (r !== undefined) out[k] = r;
  }
  return out;
}

type HeaderSource = Headers | { get(name: string): string | null } | Record<string, string | string[] | undefined> | undefined | null;

/** Vercel's request id (x-vercel-id), or x-request-id, from a Headers object or a plain header map. */
export function requestIdFrom(headers: HeaderSource): string | undefined {
  if (!headers) return undefined;
  const read = (name: string): string | undefined => {
    if (typeof (headers as Headers).get === "function") return (headers as Headers).get(name) ?? undefined;
    const v = (headers as Record<string, string | string[] | undefined>)[name];
    return Array.isArray(v) ? v[0] : v;
  };
  const id = read("x-vercel-id") ?? read("x-request-id");
  return id ? id.slice(0, 120) : undefined;
}

/** Drops the query string and hash, which can carry emails or tokens: "/quote?email=a@b.c" -> "/quote". */
export function stripQuery(path: string): string {
  return path.split(/[?#]/)[0].slice(0, 300);
}

/**
 * Builds the log entry (pure, for tests). `err` and `error` fields are serialized; `req` (a Request
 * or headers) is turned into a request id and never logged itself.
 */
export function buildEntry(level: LogLevel, event: string, fields: LogFields = {}, now: Date = new Date()): LogFields {
  const { req, err, error, msg, ...rest } = fields;
  const entry: LogFields = { level, event, time: now.toISOString() };
  if (typeof msg === "string") entry.msg = redactText(msg);
  const reqId = req ? requestIdFrom(req instanceof Request ? req.headers : (req as HeaderSource)) : undefined;
  if (reqId) entry.reqId = reqId;
  Object.assign(entry, redact(rest) as LogFields);
  const e = err ?? error;
  if (e !== undefined) entry.err = serializeError(e);
  return entry;
}

function write(level: LogLevel, event: string, fields?: LogFields) {
  let line: string;
  try {
    line = JSON.stringify(buildEntry(level, event, fields));
  } catch {
    line = JSON.stringify({ level, event, time: new Date().toISOString(), msg: "log entry could not be serialized" });
  }
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "debug") console.debug(line);
  else console.log(line);
}

export const log = {
  debug: (event: string, fields?: LogFields) => write("debug", event, fields),
  info: (event: string, fields?: LogFields) => write("info", event, fields),
  warn: (event: string, fields?: LogFields) => write("warn", event, fields),
  error: (event: string, fields?: LogFields) => write("error", event, fields),
};
