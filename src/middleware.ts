import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login API and the main /admin page (which shows login form)
  if (
    pathname === "/admin" ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/verify")
  ) {
    return NextResponse.next();
  }

  // All other /admin/* and /api/admin/* routes require the cookie
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    // API routes return 401; page routes redirect to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
