import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Renter sign-in for /account. No passwords: we email a link that works once for 30 minutes, and the
// browser then keeps a signed cookie for 30 days. Tokens are HMAC-signed with ACCOUNT_SECRET, so nothing
// is stored server-side except last_login_at (which makes each link single use).
//
// Switched on by ACCOUNT_SECRET (any long random string, e.g. `openssl rand -base64 32`). Sending the link
// also needs RESEND_API_KEY + NOTIFY_FROM. In local development it works with neither and shows the link on screen.
// The sample account (fixed example data, no real customer) works everywhere so the owner can see the pages.

export const SESSION_COOKIE = "bc_account";
export const SAMPLE_EMAIL = "sample@beyondchiavari.com";
const LOGIN_MINUTES = 30;
const SESSION_DAYS = 30;

const dev = process.env.NODE_ENV === "development";
const secret = () => process.env.ACCOUNT_SECRET || (dev ? "local-dev-only-account-secret" : undefined);

export const accountsEnabled = () => Boolean(secret());
export const canEmailLinks = () => Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM);
// Real sign-in is open when we can sign tokens and either send email or show the link (development).
export const signInOpen = () => accountsEnabled() && (canEmailLinks() || dev);

type Payload = { e: string; t: "login" | "session"; iat: number; x: number };

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");
const sign = (body: string, key: string) => createHmac("sha256", key).update(body).digest("base64url");

function makeToken(p: Payload) {
  const key = secret();
  if (!key) throw new Error("ACCOUNT_SECRET is not set");
  const body = b64(JSON.stringify(p));
  return `${body}.${sign(body, key)}`;
}

function readToken(token: string | undefined, type: Payload["t"]): Payload | null {
  const key = secret();
  if (!key || !token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(sign(body, key));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (p.t !== type || typeof p.e !== "string" || !(p.x > Date.now())) return null;
    return p;
  } catch {
    return null;
  }
}

export const normalEmail = (e: string) => e.trim().toLowerCase();

export function loginToken(email: string) {
  const now = Date.now();
  return makeToken({ e: normalEmail(email), t: "login", iat: now, x: now + LOGIN_MINUTES * 60_000 });
}

export const readLoginToken = (token: string | undefined) => readToken(token, "login");

export type AccountSession = { email: string; sample: boolean };

export async function getSession(): Promise<AccountSession | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (value === "sample") return { email: SAMPLE_EMAIL, sample: true };
  const p = readToken(value, "session");
  return p ? { email: p.e, sample: false } : null;
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: !dev,
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export async function startSession(email: string) {
  const now = Date.now();
  const token = makeToken({ e: normalEmail(email), t: "session", iat: now, x: now + SESSION_DAYS * 864e5 });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_DAYS * 86400));
}

export async function startSampleSession() {
  (await cookies()).set(SESSION_COOKIE, "sample", cookieOptions(2 * 3600));
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
