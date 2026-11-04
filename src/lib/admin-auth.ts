// One password check for the whole back office (HTTP Basic Auth, any username, password = ADMIN_PASSWORD).
// Used by src/proxy.ts for /admin pages and by every admin Server Action, because actions can be
// POSTed to any URL and would otherwise skip the proxy's /admin matcher.

// Constant-time compare so response timing doesn't leak how much of the password matched.
export function safeEqual(a: string, b: string) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export type AdminCheck = "ok" | "unconfigured" | "denied";

export function checkAdmin(authorization: string | null): AdminCheck {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return process.env.NODE_ENV === "development" ? "ok" : "unconfigured";
  const [scheme, encoded] = (authorization ?? "").split(" ");
  // The scheme name is case-insensitive (RFC 7617).
  if (scheme?.toLowerCase() !== "basic" || !encoded) return "denied";
  try {
    const decoded = atob(encoded);
    return safeEqual(decoded.slice(decoded.indexOf(":") + 1), password) ? "ok" : "denied";
  } catch {
    return "denied";
  }
}
