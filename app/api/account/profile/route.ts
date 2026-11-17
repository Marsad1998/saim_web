import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME, hashPassword, verifyPassword } from "@/lib/auth";
import { UserModel } from "@/models/User";
import { dbQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ status: false, message: "Invalid session" }, { status: 401 });
    }

    const user = await UserModel.findById(payload.userId);

    return NextResponse.json({
      status: true,
      user: {
        id: user?.id || payload.userId,
        name: user?.name || payload.name || "Valued Passenger",
        email: user?.email || payload.email,
        phone: user?.phone || "",
        role: user?.role || payload.role || "customer",
        createdAt: user?.created_at || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("GET /api/account/profile error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ status: false, message: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    // 1. Update basic profile
    if (name || phone !== undefined) {
      await UserModel.updateProfile(payload.userId, { name, phone });
    }

    // 2. Change password if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { status: false, message: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const user = await UserModel.findByEmail(payload.email);
      if (!user || !user.password_hash) {
        return NextResponse.json({ status: false, message: "User not found" }, { status: 404 });
      }

      const isMatch = await verifyPassword(currentPassword, user.password_hash);
      if (!isMatch) {
        return NextResponse.json({ status: false, message: "Current password is incorrect." }, { status: 400 });
      }

      const newHash = await hashPassword(newPassword);
      await dbQuery("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, payload.userId]);
    }

    const updatedUser = await UserModel.findById(payload.userId);

    return NextResponse.json({
      status: true,
      message: "Profile updated successfully.",
      user: updatedUser
        ? {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
          }
        : undefined,
    });
  } catch (error: any) {
    console.error("PUT /api/account/profile error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to update profile" }, { status: 500 });
  }
}
