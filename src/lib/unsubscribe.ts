import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { site } from "./site";

// Signed one-click unsubscribe links, so nobody can opt out someone else by guessing a URL.
// Signed with UNSUBSCRIBE_SECRET, or ADMIN_PASSWORD when that isn't set.
const secret = () => process.env.UNSUBSCRIBE_SECRET || process.env.ADMIN_PASSWORD || "";

const sign = (email: string) =>
  createHmac("sha256", secret()).update(email.trim().toLowerCase()).digest("base64url").slice(0, 32);

export function unsubscribeUrl(email: string) {
  if (!secret()) return `mailto:${site.email}?subject=Unsubscribe`;
  const params = new URLSearchParams({ e: email.trim().toLowerCase(), t: sign(email) });
  return `${site.url}/api/unsubscribe?${params}`;
}

export function verifyUnsubscribe(email: string, token: string) {
  if (!secret() || !email || !token) return false;
  const a = Buffer.from(sign(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
