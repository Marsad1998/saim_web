import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCodeForUser } from "@/lib/google-auth";
import { UserModel } from "@/models/User";
import { signJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  let redirectTarget = "/account/dashboard";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf8"));
      if (decoded.redirect) redirectTarget = decoded.redirect;
    } catch {
      // ignore state parsing error
    }
  }

  if (error || !code) {
    console.warn("Google OAuth callback returned error or no code:", error);
    const loginUrl = new URL("/account/login", origin);
    loginUrl.searchParams.set("error", "Google authentication was cancelled or failed.");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const googleUser = await exchangeGoogleCodeForUser(code, origin);
    if (!googleUser || !googleUser.email) {
      const loginUrl = new URL("/account/login", origin);
      loginUrl.searchParams.set("error", "Unable to retrieve Google profile information.");
      return NextResponse.redirect(loginUrl);
    }

    const email = googleUser.email.trim().toLowerCase();
    const name = googleUser.name || googleUser.given_name || "Google User";

    // 1. Check if user already exists
    let user = await UserModel.findByEmail(email);

    if (!user) {
      // 2. Create new customer user with auto-verified status
      const newUserId = `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      user = await UserModel.createUser({
        id: newUserId,
        name: name,
        email: email,
        phone: "",
        password: Math.random().toString(36) + "G!@#99", // Random unguessable password
        role: "customer",
      });

      // Mark verified since Google already confirmed email
      await UserModel.markEmailVerified(email);
    } else if (!user.is_verified) {
      // Auto-verify existing account if they sign in via Google
      await UserModel.markEmailVerified(email);
      user.is_verified = true;
    }

    // 3. Generate JWT session token
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Determine redirect
    let finalRedirect = redirectTarget;
    if (user.role === "admin") {
      finalRedirect = "/admin";
    } else if (user.role === "driver") {
      finalRedirect = "/driver/dashboard";
    }

    const response = NextResponse.redirect(new URL(finalRedirect, origin));

    // 4. Set HTTP-Only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth callback exception:", err);
    const loginUrl = new URL("/account/login", origin);
    loginUrl.searchParams.set("error", err.message || "Failed to complete Google sign-in.");
    return NextResponse.redirect(loginUrl);
  }
}
