import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { UserModel } from "@/models/User";
import { dbQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwtToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role") as any;

    const users = await UserModel.getAll(roleFilter || undefined);

    return NextResponse.json({
      status: true,
      users: users || [],
    });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, role, password, isVerified } = body;

    if (!name || !email) {
      return NextResponse.json(
        { status: false, message: "Name and Email are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await UserModel.findByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { status: false, message: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    const newUser = await UserModel.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      role: role || "customer",
      password: password && password.trim().length > 0 ? password.trim() : "DefaultPass@123",
      is_verified: isVerified !== undefined ? Boolean(isVerified) : true,
    });

    return NextResponse.json({
      status: true,
      message: "User account created successfully.",
      user: newUser,
    });
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, name, email, phone, role, isVerified, password } = body;

    if (!userId) {
      return NextResponse.json({ status: false, message: "userId is required" }, { status: 400 });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;
    if (isVerified !== undefined) updates.is_verified = isVerified;
    if (password !== undefined && password.trim().length > 0) updates.password = password;

    const success = await UserModel.update(userId, updates);

    return NextResponse.json({
      status: success,
      message: success ? "User updated successfully" : "Failed to update user",
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/users error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId") || searchParams.get("id");

    if (!userId) {
      try {
        const body = await request.json();
        userId = body.userId || body.id;
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ status: false, message: "User ID is required" }, { status: 400 });
    }

    // Protect currently authenticated admin from deleting themselves
    if (admin.userId === userId || admin.email === userId) {
      return NextResponse.json({ status: false, message: "You cannot delete your own admin account." }, { status: 400 });
    }

    const success = await UserModel.delete(userId);

    return NextResponse.json({
      status: success,
      message: success ? "User account deleted successfully." : "Failed to delete user account.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/users error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
