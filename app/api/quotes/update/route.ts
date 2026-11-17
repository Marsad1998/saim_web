import { NextResponse } from "next/server";
import { quoteStore } from "@/lib/quote-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteRef, selectedVehicleId, selectedExtras, passenger, currency } = body;

    if (!quoteRef) {
      return NextResponse.json({ status: false, message: "Missing quote reference" }, { status: 400 });
    }

    const updated = await quoteStore.update(quoteRef, {
      ...(selectedVehicleId && { selectedVehicleId }),
      ...(selectedExtras && { selectedExtras }),
      ...(passenger && { passenger }),
      ...(currency && { currency }),
    });

    if (!updated) {
      return NextResponse.json({ status: false, message: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ status: true, quote: updated });
  } catch (error) {
    console.error("quotes/update error:", error);
    return NextResponse.json({ status: false, message: "Update failed" }, { status: 500 });
  }
}
