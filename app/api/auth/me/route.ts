import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { UserModel } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Attempt to fetch fresh user profile from MySQL
    let user = await UserModel.findById(payload.userId);
    if (!user) {
      // Fallback to verified JWT payload claims if DB is unreachable or user not cached
      user = {
        id: payload.userId,
        name: payload.name || "Customer",
        email: payload.email,
        phone: null,
        role: payload.role || "customer",
      };
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error.message);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
