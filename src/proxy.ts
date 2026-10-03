import { NextResponse, type NextRequest } from "next/server";

// Password-protects /admin with HTTP Basic Auth (any username, password = ADMIN_PASSWORD).
// With no ADMIN_PASSWORD set, admin is only reachable in local development.
export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Set ADMIN_PASSWORD to enable the admin dashboard.", { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    if (decoded.slice(decoded.indexOf(":") + 1) === password) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Event Seatings admin"' },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
