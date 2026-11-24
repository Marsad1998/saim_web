import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const COOKIES_TO_CLEAR = [SESSION_COOKIE_NAME, "qcm_session", "ots_session", "session", "token"];

export async function POST() {
  const response = NextResponse.json({
    status: 200,
    message: "Logged out successfully",
  });

  // Clear all variants of session cookies
  for (const cookieName of COOKIES_TO_CLEAR) {
    response.cookies.set({
      name: cookieName,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/account/login?logout=1", request.url);
  const response = NextResponse.redirect(loginUrl);

  for (const cookieName of COOKIES_TO_CLEAR) {
    response.cookies.set({
      name: cookieName,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
  }

  return response;
}
