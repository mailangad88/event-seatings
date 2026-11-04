import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { site } from "./site";

// Personal "fill in your event details" links (/event-details/<token>). The token is the lead id plus an HMAC
// of it, so only the owner (from the admin call script) can make one and it can't be guessed for other leads.
function secret() {
  return process.env.DETAILS_LINK_SECRET || process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "dev-only" : "");
}

export function detailsToken(leadId: string): string | undefined {
  const key = secret();
  if (!key) return undefined;
  return `${leadId}.${createHmac("sha256", key).update(`details:${leadId}`).digest("base64url").slice(0, 22)}`;
}

export const detailsLink = (leadId: string) => {
  const t = detailsToken(leadId);
  return t ? `${site.url}/event-details/${t}` : undefined;
};

/** The lead id inside a valid details token, or undefined. */
export function leadFromDetailsToken(token: string | undefined | null): string | undefined {
  if (!token || token.length > 80) return undefined;
  const [leadId] = token.split(".");
  const expected = leadId ? detailsToken(leadId) : undefined;
  if (!expected || expected.length !== token.length) return undefined;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token)) ? leadId : undefined;
}
