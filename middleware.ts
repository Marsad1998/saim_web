import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwtRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload).role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionCookie =
    request.cookies.get("qcm_session")?.value ||
    request.cookies.get("ots_session")?.value;
  const role = sessionCookie ? parseJwtRole(sessionCookie) : null;

  // 1. Protected routes: User must be logged in with a valid token
  const isProtectedPath =
    pathname.startsWith("/account/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/driver");

  if (isProtectedPath && (!sessionCookie || !role)) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-specific protection: redirect to login if role does not have authorization
  if (pathname.startsWith("/admin") && role !== "admin") {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", "/admin");
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/driver") && role !== "driver") {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", "/driver/dashboard");
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth routes: Logged-in users redirect to their respective dashboard
  const isAuthPage =
    pathname === "/account/login" ||
    pathname === "/account/register" ||
    pathname === "/account/forgot-password";

  // Allow switching accounts if switch=1 or logout=1
  const isSwitchingAccount = searchParams.get("switch") === "1" || searchParams.get("logout") === "1";
  const redirectParam = searchParams.get("redirect");

  // If explicitly logging out, clear session cookies on response and show login page
  if (isAuthPage && isSwitchingAccount) {
    const response = NextResponse.next();
    response.cookies.delete("qcm_session");
    response.cookies.delete("ots_session");
    return response;
  }

  if (isAuthPage && role && !isSwitchingAccount) {
    // If redirect parameter matches current role's allowed zone, proceed there
    if (redirectParam && redirectParam.startsWith("/")) {
      const isAllowed =
        (role === "admin" && redirectParam.startsWith("/admin")) ||
        (role === "driver" && redirectParam.startsWith("/driver")) ||
        (role === "customer" && redirectParam.startsWith("/account"));

      if (isAllowed) {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      }
      // If role does not match destination (e.g. customer logged in, but trying to reach /admin),
      // allow them to view login form to authenticate with the proper credentials.
      return NextResponse.next();
    }

    // Default redirect to role dashboard
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (role === "driver") {
      return NextResponse.redirect(new URL("/driver/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/account/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/driver/:path*"],
};
