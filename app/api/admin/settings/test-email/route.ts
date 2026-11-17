import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getSystemSettings } from "@/lib/system-settings";
import { sendTestSmtpEmail } from "@/lib/email";

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

    const body = await request.json().catch(() => ({}));
    const currentSettings = await getSystemSettings();

    const host = body.smtp_host || currentSettings.smtp_host;
    const port = parseInt(body.smtp_port, 10) || currentSettings.smtp_port;
    const user = body.smtp_user || currentSettings.smtp_user;
    const pass = body.smtp_pass && body.smtp_pass !== "••••••••" ? body.smtp_pass : currentSettings.smtp_pass;
    const from = body.smtp_from || currentSettings.smtp_from;
    const recipient = body.test_recipient || currentSettings.admin_email || payload.email;

    if (!host || !user || !pass) {
      return NextResponse.json({
        status: false,
        message: "SMTP host, user, and password are required to test connection.",
      }, { status: 400 });
    }

    const result = await sendTestSmtpEmail(recipient, {
      host,
      port,
      user,
      pass,
      from,
    });

    return NextResponse.json({
      status: result.success,
      message: result.message,
    });
  } catch (error: any) {
    console.error("POST /api/admin/settings/test-email error:", error.message);
    return NextResponse.json({
      status: false,
      message: error.message || "Failed to test SMTP connection.",
    }, { status: 500 });
  }
}
