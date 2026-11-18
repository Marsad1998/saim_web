import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const s = await getSystemSettings();

    return NextResponse.json({
      status: true,
      settings: {
        primary_color: s.primary_color || "#FFCC00",
        primary_hover_color: s.primary_hover_color || "#E6B800",
        secondary_color: s.secondary_color || "#141720",
        brand_name: s.brand_name || "OTS Taxi",
        brand_tagline: s.brand_tagline || "UK Airport Transfer & Taxi Booking | Fixed Price Cabs",
        logo_dark: s.logo_dark || "",
        logo_light: s.logo_light || "",
        logo_icon: s.logo_icon || "",
        support_phone: s.support_phone || "+44 (0) 208 004 0000",
        support_email: s.support_email || "support@otstaxi.co.uk",
        emergency_whatsapp: s.emergency_whatsapp || "+44 7123 456789",
        office_address: s.office_address || "Heathrow Terminal 2 Concourse, London TW6 1EW, United Kingdom",
        company_number: s.company_number || "06783060",
        vat_number: s.vat_number || "GB 123 4567 89",
        copyright_text: s.copyright_text || "© 2026 OTS Taxi Limited. All Rights Reserved.",
      },
    });
  } catch (error: any) {
    console.error("GET /api/settings error:", error.message);
    return NextResponse.json({
      status: false,
      settings: {
        primary_color: "#FFCC00",
        primary_hover_color: "#E6B800",
        secondary_color: "#141720",
        brand_name: "OTS Taxi",
        brand_tagline: "UK Airport Transfer & Taxi Booking | Fixed Price Cabs",
        logo_dark: "",
        logo_light: "",
        logo_icon: "",
        support_phone: "+44 (0) 208 004 0000",
        support_email: "support@otstaxi.co.uk",
        emergency_whatsapp: "+44 7123 456789",
        office_address: "Heathrow Terminal 2 Concourse, London TW6 1EW, United Kingdom",
        company_number: "06783060",
        vat_number: "GB 123 4567 89",
        copyright_text: "© 2026 OTS Taxi Limited. All Rights Reserved.",
      },
    });
  }
}
