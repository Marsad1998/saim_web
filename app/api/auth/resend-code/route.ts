import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { status: 400, message: "Please provide an email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserModel.findByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { status: 404, message: "User account not found." },
        { status: 404 }
      );
    }

    if (user.is_verified) {
      return NextResponse.json(
        { status: 400, message: "This account is already verified. Please sign in." },
        { status: 400 }
      );
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    await UserModel.setVerificationCode(cleanEmail, newCode);
    await sendVerificationCodeEmail(cleanEmail, user.name, newCode);

    return NextResponse.json({
      status: 200,
      message: "A new verification code has been sent to your email address.",
      devCode: process.env.NODE_ENV !== "production" ? newCode : undefined,
    });
  } catch (error: any) {
    console.error("resend-code API error:", error);
    return NextResponse.json(
      { status: 500, message: "Failed to resend code. Please try again." },
      { status: 500 }
    );
  }
}
