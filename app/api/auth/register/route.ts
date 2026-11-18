import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { DriverModel } from "@/models/Driver";
import { signJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getSystemSettings } from "@/lib/system-settings";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, password, role: requestedRole } = body;

    const role = requestedRole === "driver" ? "driver" : "customer";

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
          message: "An account with this email address already exists. Please log in.",
          errorMessage: "An account with this email address already exists. Please log in."
        },
        { status: 400 }
      );
    }

    // 2. Check if email verification is enforced (Drivers are exempt so they can log in directly to their dashboard)
    const systemSettings = await getSystemSettings();
    const isDriver = role === "driver";
    const requireVerification = !isDriver && Boolean(systemSettings.require_email_verification);

    let verificationCode: string | undefined = undefined;
    if (requireVerification) {
      verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 3. Create user (password will be automatically bcrypt-hashed in UserModel)
    const user = await UserModel.create({
      name: fullName,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : undefined,
      password: String(password),
      role,
      is_verified: isDriver ? true : !requireVerification,
      verification_code: verificationCode,
    });

    // 4. If driver, initialize their driver profile as incomplete / pending approval
    if (role === "driver") {
      await DriverModel.create({
        userId: user.id,
        licenseNumber: "",
        vehicleModel: "",
        vehiclePlate: "",
        vehicleCategory: "saloon",
        verificationStatus: "incomplete",
        isActive: false,
      });
    }

    // 5. If verification is required (passengers only when enabled by admin), send code
    if (requireVerification && verificationCode && !isDriver) {
      await sendVerificationCodeEmail(cleanEmail, fullName, verificationCode);

      return NextResponse.json({
        status: 200,
        requiresVerification: true,
        email: cleanEmail,
        role,
        devCode: process.env.NODE_ENV !== "production" ? verificationCode : undefined,
        message: "Verification code sent to your email address.",
      });
    }

    // 6. Otherwise, automatically issue JWT session token
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      status: 200,
      requiresVerification: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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
