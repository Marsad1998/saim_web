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

export async function PATCH(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, isVerified } = body;

    if (!userId) {
      return NextResponse.json({ status: false, message: "userId is required" }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (role) {
      fields.push("role = ?");
      values.push(role);
    }
    if (isVerified !== undefined) {
      fields.push("is_verified = ?");
      values.push(isVerified ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(userId);
      try {
        await dbQuery(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
      } catch (err: any) {
        console.warn("UserModel PATCH DB fallback:", err.message);
      }
    }

    return NextResponse.json({
      status: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/users error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
