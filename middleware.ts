import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("ots_session")?.value;

  // 1. Protected routes: User must be logged in
  const isProtectedPath = pathname.startsWith("/account/dashboard") || pathname.startsWith("/admin");
  if (isProtectedPath && !sessionCookie) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth routes: Logged-in users should not see login/register pages
  const isAuthPage =
    pathname === "/account/login" ||
    pathname === "/account/register" ||
    pathname === "/account/forgot-password";

  if (isAuthPage && sessionCookie) {
    const dashboardUrl = new URL("/account/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
