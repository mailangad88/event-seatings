import { NextResponse, type NextRequest } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";

// Password-protects /admin with HTTP Basic Auth (any username, password = ADMIN_PASSWORD).
// With no ADMIN_PASSWORD set, admin is only reachable in local development.
export function proxy(request: NextRequest) {
  const check = checkAdmin(request.headers.get("authorization"));
  if (check === "ok") return NextResponse.next();
  if (check === "unconfigured") {
    return new NextResponse("Set ADMIN_PASSWORD to enable the admin dashboard.", { status: 503 });
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Beyond Chiavari admin"' },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
