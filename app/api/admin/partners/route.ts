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

export async function POST(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { companyName, contactName, email, phone, partnerType, fleetSize, message, status, adminNotes } = body;

    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { status: false, message: "Company Name, Contact Name, and Email are required." },
        { status: 400 }
      );
    }

    const newPartner = await PartnerApplicationModel.create({
      companyName,
      contactName,
      email,
      phone,
      partnerType: partnerType || "corporate_account",
      fleetSize,
      message,
    });

    if (status && status !== "new") {
      await PartnerApplicationModel.updateStatus(newPartner.id!, status, adminNotes);
    }

    return NextResponse.json({
      status: true,
      message: "B2B Partner added successfully.",
      partner: newPartner,
    });
  } catch (error: any) {
    console.error("POST /api/admin/partners error:", error.message);
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
    const { id, companyName, contactName, email, phone, partnerType, fleetSize, message, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ status: false, message: "Partner ID is required" }, { status: 400 });
    }

    const updates: any = {};
    if (companyName !== undefined) updates.company_name = companyName;
    if (contactName !== undefined) updates.contact_name = contactName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (partnerType !== undefined) updates.partner_type = partnerType;
    if (fleetSize !== undefined) updates.fleet_size = fleetSize;
    if (message !== undefined) updates.message = message;
    if (status !== undefined) updates.status = status;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const success = await PartnerApplicationModel.update(Number(id), updates);

    return NextResponse.json({
      status: success,
      message: success ? "Partner application updated successfully." : "Failed to update partner application.",
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/partners error:", error.message);
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
      return NextResponse.json({ status: false, message: "Partner ID is required" }, { status: 400 });
    }

    const success = await PartnerApplicationModel.delete(Number(id));

    return NextResponse.json({
      status: success,
      message: success ? "Partner record deleted successfully." : "Failed to delete partner.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/partners error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
