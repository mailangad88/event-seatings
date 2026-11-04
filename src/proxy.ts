import { NextResponse, type NextRequest } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { clientIp, rateLimit, tooManyResponse } from "@/lib/rate-limit";

// Password-protects /admin with HTTP Basic Auth (any username, password = ADMIN_PASSWORD).
// With no ADMIN_PASSWORD set, admin is only reachable in local development.
// Wrong passwords are limited per IP (10 per 15 minutes), so the password can't be guessed by brute force.
const failedLogins = { limit: 10, windowMs: 15 * 60_000 };

export async function proxy(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const check = checkAdmin(authorization);
  if (check === "unconfigured") {
    return new NextResponse("Set ADMIN_PASSWORD to enable the admin dashboard.", { status: 503 });
  }
  const ip = clientIp(request);
  // Once an IP is over the limit, even a right password waits until the window passes.
  const status = await rateLimit("admin-login", ip, failedLogins, false);
  if (!status.allowed) return tooManyResponse(status.retryAfterMs, "Too many wrong passwords. Please wait 15 minutes and try again.");
  if (check === "ok") {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  // A request with no password at all is just the browser asking; only count real wrong guesses.
  if (authorization) await rateLimit("admin-login", ip, failedLogins, true);
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Beyond Chiavari admin"', "Cache-Control": "no-store" },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
