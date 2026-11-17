import { NextResponse } from "next/server";
import { ContactInquiryModel } from "@/models/ContactInquiry";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { status: 400, errorMessage: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Persist to MySQL via ContactInquiryModel
    await ContactInquiryModel.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json({
      status: 200,
      message: "Message received successfully. Our team will contact you shortly.",
    });
  } catch (error) {
    console.error("contact API error:", error);
    return NextResponse.json(
      { status: 500, errorMessage: "An error occurred while sending your message. Please try again." },
      { status: 500 }
    );
  }
}
