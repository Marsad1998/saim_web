import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, getGoogleConfig } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const redirectParam = request.nextUrl.searchParams.get("redirect") || "/account/dashboard";

    const { clientId } = await getGoogleConfig();
    if (!clientId) {
      // Redirect back to login with a descriptive error so user / admin knows how to configure
      const loginUrl = new URL("/account/login", origin);
      loginUrl.searchParams.set(
        "error",
        "Google Sign-In is not configured yet. Please enter your Google Client ID & Secret in Admin Portal -> Settings."
      );
      return NextResponse.redirect(loginUrl);
    }

    const authUrl = await getGoogleAuthUrl(origin, redirectParam);
    if (!authUrl) {
      const loginUrl = new URL("/account/login", origin);
      loginUrl.searchParams.set("error", "Unable to initiate Google sign-in.");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Google Auth initiation error:", error);
    const loginUrl = new URL("/account/login", request.nextUrl.origin);
    loginUrl.searchParams.set("error", "Failed to connect to Google.");
    return NextResponse.redirect(loginUrl);
  }
}
