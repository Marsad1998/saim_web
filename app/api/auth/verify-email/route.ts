import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { signJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { status: 400, message: "Please provide both email and 6-digit verification code." },
        { status: 400 }
      );
    }

    const result = await UserModel.verifyEmailCode(email, code);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { status: 400, message: result.message || "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const user = result.user;

    // Issue JWT session token
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      status: 200,
      message: "Email verified successfully! You are now logged in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("verify-email API error:", error);
    return NextResponse.json(
      { status: 500, message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
