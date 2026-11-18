import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { PartnerApplicationModel } from "@/models/PartnerApplication";

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
    const statusFilter = searchParams.get("status") as any;

    const partners = await PartnerApplicationModel.getAll(statusFilter || undefined);

    return NextResponse.json({
      status: true,
      partners: partners || [],
    });
  } catch (error: any) {
    console.error("GET /api/admin/partners error:", error.message);
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
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ status: false, message: "id and status are required" }, { status: 400 });
    }

    const success = await PartnerApplicationModel.updateStatus(Number(id), status, adminNotes);

    return NextResponse.json({
      status: success,
      message: success ? "Partner application updated successfully." : "Failed to update partner application.",
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/partners error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
