import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { signJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, password } = body;

    // Support both unified name ('name' or 'fullName') and split name ('firstName' & 'lastName')
    let fullName = (body.name || body.fullName || "").trim();
    if (!fullName && body.firstName) {
      fullName = `${body.firstName.trim()} ${(body.lastName || "").trim()}`.trim();
    }

    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          status: 400,
          message: "Please fill in all required fields (name, email, password).",
          errorMessage: "Please fill in all required fields (name, email, password)."
        },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return NextResponse.json(
        {
          status: 400,
          message: "Please enter a valid email address.",
          errorMessage: "Please enter a valid email address."
        },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        {
          status: 400,
          message: "Password must be at least 6 characters long.",
          errorMessage: "Password must be at least 6 characters long."
        },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    const existing = await UserModel.findByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        {
          status: 400,
          message: "An account with this email address already exists.",
          errorMessage: "An account with this email address already exists."
        },
        { status: 400 }
      );
    }

    // 2. Create user (password will be automatically bcrypt-hashed in UserModel)
    const user = await UserModel.create({
      name: fullName,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      password: String(password),
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
      {
        status: 500,
        message: "Registration failed. Please try again.",
        errorMessage: "Registration failed. Please try again."
      },
      { status: 500 }
    );
  }
}
