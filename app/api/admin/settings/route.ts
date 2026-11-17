import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getSystemSettings, updateSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ status: false, message: "Admin privileges required" }, { status: 403 });
    }

    const settings = await getSystemSettings();

    return NextResponse.json({
      status: true,
      settings: {
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        smtp_pass: settings.smtp_pass ? "••••••••" : "",
        smtp_from: settings.smtp_from,
        admin_email: settings.admin_email,
        require_email_verification: Boolean(settings.require_email_verification),
        require_driver_approval: Boolean(settings.require_driver_approval),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/settings error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ status: false, message: "Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const updates: any = {};

    if (body.smtp_host !== undefined) updates.smtp_host = String(body.smtp_host).trim();
    if (body.smtp_port !== undefined) updates.smtp_port = parseInt(body.smtp_port, 10) || 587;
    if (body.smtp_user !== undefined) updates.smtp_user = String(body.smtp_user).trim();
    if (body.smtp_pass && body.smtp_pass !== "••••••••") updates.smtp_pass = String(body.smtp_pass);
    if (body.smtp_from !== undefined) updates.smtp_from = String(body.smtp_from).trim();
    if (body.admin_email !== undefined) updates.admin_email = String(body.admin_email).trim();
    if (body.require_email_verification !== undefined) updates.require_email_verification = Boolean(body.require_email_verification);
    if (body.require_driver_approval !== undefined) updates.require_driver_approval = Boolean(body.require_driver_approval);

    const updated = await updateSystemSettings(updates);

    return NextResponse.json({
      status: true,
      message: "System and SMTP settings updated successfully!",
      settings: {
        ...updated,
        smtp_pass: updated.smtp_pass ? "••••••••" : "",
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/settings error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
