import { NextRequest, NextResponse } from "next/server";
import { PartnerApplicationModel } from "@/models/PartnerApplication";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { companyName, contactName, email, phone, partnerType, fleetSize, message } = body;

    if (!companyName || !contactName || !email || !partnerType) {
      return NextResponse.json(
        { status: false, message: "Company name, contact name, email, and partnership type are required." },
        { status: 400 }
      );
    }

    const application = await PartnerApplicationModel.create({
      companyName,
      contactName,
      email,
      phone,
      partnerType,
      fleetSize,
      message,
    });

    return NextResponse.json({
      status: true,
      message: "Partnership application received successfully. Our B2B fleet & account team will contact you shortly.",
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error("POST /api/partners error:", error.message);
    return NextResponse.json(
      { status: false, message: "Failed to submit partnership application. Please try again." },
      { status: 500 }
    );
  }
}
