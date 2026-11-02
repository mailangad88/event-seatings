// One password check for the whole back office (HTTP Basic Auth, any username, password = ADMIN_PASSWORD).
// Used by src/proxy.ts for /admin pages and by every admin Server Action, because actions can be
// POSTed to any URL and would otherwise skip the proxy's /admin matcher.

export type AdminCheck = "ok" | "unconfigured" | "denied";

export function checkAdmin(authorization: string | null): AdminCheck {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return process.env.NODE_ENV === "development" ? "ok" : "unconfigured";
  const [scheme, encoded] = (authorization ?? "").split(" ");
  if (scheme !== "Basic" || !encoded) return "denied";
  try {
    const decoded = atob(encoded);
    return decoded.slice(decoded.indexOf(":") + 1) === password ? "ok" : "denied";
  } catch {
    return "denied";
  }
}
