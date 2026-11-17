import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { signJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { status: 400, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify credentials using UserModel with bcrypt
    const user = await UserModel.verifyCredentials(cleanEmail, password);
    if (!user) {
      const existing = await UserModel.findByEmail(cleanEmail);
      if (existing) {
        return NextResponse.json(
          { status: 401, message: "Invalid email or password." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { status: 404, message: "Account not found. Please register first." },
        { status: 404 }
      );
    }

    // 2. Generate secure JWT session token
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 3. Set HTTP-Only Cookie
    const response = NextResponse.json({
      status: 200,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      message: "Login successful.",
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
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { status: 500, message: "Login failed" },
      { status: 500 }
    );
  }
}
