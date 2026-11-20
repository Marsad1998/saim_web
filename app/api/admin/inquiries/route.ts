import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { ContactInquiryModel } from "@/models/ContactInquiry";

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

    const inquiries = await ContactInquiryModel.getAll();

    return NextResponse.json({
      status: true,
      inquiries,
    });
  } catch (error: any) {
    console.error("GET /api/admin/inquiries error:", error.message);
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
    const { id, status, action } = body;

    if (!id) {
      return NextResponse.json({ status: false, message: "Inquiry ID required" }, { status: 400 });
    }

    if (action === "delete") {
      await ContactInquiryModel.delete(id);
      return NextResponse.json({ status: true, message: "Inquiry deleted" });
    }

    if (status) {
      await ContactInquiryModel.updateStatus(id, status);
      return NextResponse.json({ status: true, message: `Inquiry status updated to ${status}` });
    }

    return NextResponse.json({ status: false, message: "No action specified" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/admin/inquiries error:", error.message);
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
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ status: false, message: "Inquiry ID required" }, { status: 400 });
    }

    const success = await ContactInquiryModel.delete(Number(id));

    return NextResponse.json({
      status: success,
      message: success ? "Inquiry deleted successfully." : "Failed to delete inquiry.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/inquiries error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
