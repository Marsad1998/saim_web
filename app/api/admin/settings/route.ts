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
        google_client_id: settings.google_client_id || "",
        google_client_secret: settings.google_client_secret ? "••••••••" : "",
        google_maps_api_key: settings.google_maps_api_key || "",

        // Branding & Customization
        primary_color: settings.primary_color || "#FFCC00",
        primary_hover_color: settings.primary_hover_color || "#E6B800",
        secondary_color: settings.secondary_color || "#141720",
        brand_name: settings.brand_name || "Quick Car Midlands Ltd",
        brand_tagline: settings.brand_tagline || "Airport Transfers & Private Hire | Based in Birmingham",
        logo_dark: settings.logo_dark || "",
        logo_light: settings.logo_light || "",
        logo_icon: settings.logo_icon || "",

        // Support & Contact
        support_phone: settings.support_phone || "01212433112",
        support_email: settings.support_email || "qcm023@gmail.com",
        emergency_whatsapp: settings.emergency_whatsapp || "00447892609314",
        office_address: settings.office_address || "Birmingham, West Midlands, United Kingdom",
        company_number: settings.company_number || "12345678",
        vat_number: settings.vat_number || "GB 123 4567 89",
        copyright_text: settings.copyright_text || "© 2026 QUICK CAR MIDLANDS LTD. All Rights Reserved.",

        // Bank Account Details
        bank_name: settings.bank_name || "Clydesdale Bank / Virgin Money UK",
        account_name: settings.account_name || "QUICK CAR MIDLANDS LTD",
        account_type: settings.account_type || "Business",
        account_number: settings.account_number || "50470328",
        sort_code: settings.sort_code || "82-19-74",
        iban: settings.iban || "GB91CLYD82197450470328",
        bic: settings.bic || "CLYDGB21974",
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
    if (body.google_client_id !== undefined) updates.google_client_id = String(body.google_client_id).trim();
    if (body.google_client_secret && body.google_client_secret !== "••••••••") updates.google_client_secret = String(body.google_client_secret).trim();
    if (body.google_maps_api_key !== undefined) updates.google_maps_api_key = String(body.google_maps_api_key).trim();

    // Branding & Customization
    if (body.primary_color !== undefined) updates.primary_color = String(body.primary_color).trim();
    if (body.primary_hover_color !== undefined) updates.primary_hover_color = String(body.primary_hover_color).trim();
    if (body.secondary_color !== undefined) updates.secondary_color = String(body.secondary_color).trim();
    if (body.brand_name !== undefined) updates.brand_name = String(body.brand_name).trim();
    if (body.brand_tagline !== undefined) updates.brand_tagline = String(body.brand_tagline).trim();
    if (body.logo_dark !== undefined) updates.logo_dark = String(body.logo_dark).trim();
    if (body.logo_light !== undefined) updates.logo_light = String(body.logo_light).trim();
    if (body.logo_icon !== undefined) updates.logo_icon = String(body.logo_icon).trim();

    // Support & Company Details
    if (body.support_phone !== undefined) updates.support_phone = String(body.support_phone).trim();
    if (body.support_email !== undefined) updates.support_email = String(body.support_email).trim();
    if (body.emergency_whatsapp !== undefined) updates.emergency_whatsapp = String(body.emergency_whatsapp).trim();
    if (body.office_address !== undefined) updates.office_address = String(body.office_address).trim();
    if (body.company_number !== undefined) updates.company_number = String(body.company_number).trim();
    if (body.vat_number !== undefined) updates.vat_number = String(body.vat_number).trim();
    if (body.copyright_text !== undefined) updates.copyright_text = String(body.copyright_text).trim();

    // Bank Account Details
    if (body.bank_name !== undefined) updates.bank_name = String(body.bank_name).trim();
    if (body.account_name !== undefined) updates.account_name = String(body.account_name).trim();
    if (body.account_type !== undefined) updates.account_type = String(body.account_type).trim();
    if (body.account_number !== undefined) updates.account_number = String(body.account_number).trim();
    if (body.sort_code !== undefined) updates.sort_code = String(body.sort_code).trim();
    if (body.iban !== undefined) updates.iban = String(body.iban).trim();
    if (body.bic !== undefined) updates.bic = String(body.bic).trim();

    const updated = await updateSystemSettings(updates);

    return NextResponse.json({
      status: true,
      message: "Website and system settings updated successfully!",
      settings: {
        ...updated,
        smtp_pass: updated.smtp_pass ? "••••••••" : "",
        google_client_secret: updated.google_client_secret ? "••••••••" : "",
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/settings error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
