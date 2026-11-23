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
        brand_name: s.brand_name || "Quick Car Midlands Ltd",
        brand_tagline: s.brand_tagline || "Airport Transfers & Private Hire | Based in Birmingham",
        logo_dark: s.logo_dark || "",
        logo_light: s.logo_light || "",
        logo_icon: s.logo_icon || "",
        support_phone: s.support_phone || "+44 (0) 121 285 5000",
        support_email: s.support_email || "bookings@quickcarmidlands.co.uk",
        emergency_whatsapp: s.emergency_whatsapp || "+44 7123 456789",
        office_address: s.office_address || "Birmingham, West Midlands, United Kingdom",
        company_number: s.company_number || "12345678",
        vat_number: s.vat_number || "GB 123 4567 89",
        copyright_text: s.copyright_text || "© 2026 Quick Car Midlands Ltd. All Rights Reserved.",
        google_maps_api_key: s.google_maps_api_key || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
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
        brand_name: "Quick Car Midlands Ltd",
        brand_tagline: "Airport Transfers & Private Hire | Based in Birmingham",
        logo_dark: "",
        logo_light: "",
        logo_icon: "",
        support_phone: "+44 (0) 121 285 5000",
        support_email: "bookings@quickcarmidlands.co.uk",
        emergency_whatsapp: "+44 7123 456789",
        office_address: "Birmingham, West Midlands, United Kingdom",
        company_number: "12345678",
        vat_number: "GB 123 4567 89",
        copyright_text: "© 2026 Quick Car Midlands Ltd. All Rights Reserved.",
        google_maps_api_key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
      },
    });
  }
}
