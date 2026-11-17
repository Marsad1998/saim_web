import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { signJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { status: 400, errorMessage: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user already exists
    const existing = await UserModel.findByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { status: 400, errorMessage: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    // 2. Create user (password will be automatically bcrypt-hashed in UserModel)
    const user = await UserModel.create({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: cleanEmail,
      phone,
      password,
      role: "customer",
    });

    // 3. Issue JWT session token
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 4. Set HTTP-Only Cookie
    const response = NextResponse.json({
      status: 200,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      message: "Account created successfully.",
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
    console.error("Register API error:", error);
    return NextResponse.json(
      { status: 500, errorMessage: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
