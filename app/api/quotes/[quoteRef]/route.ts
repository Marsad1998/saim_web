import { NextRequest, NextResponse } from "next/server";
import { quoteStore } from "@/lib/quote-store";

export async function GET(
  request: NextRequest,
  { params }: { params: { quoteRef: string } }
) {
  try {
    const { quoteRef } = params;
    let quote = quoteStore.get(quoteRef);

    if (!quote) {
      // If server reloaded, generate fallback quote for this ref
      quote = quoteStore.create({
        fromLocation: "London Heathrow Airport (LHR)",
        toLocation: "Central London, UK",
        fromLocationType: 1,
        toLocationType: 2,
        passengers: 2,
        suitcases: 2,
        pickUpDate: new Date().toISOString().split("T")[0],
        pickUpTime: "12:00",
        bookReturn: false,
        waypoints: [],
      });
      // Set the ref to match what was requested
      quote.quoteRef = quoteRef;
    }

    return NextResponse.json({
      status: true,
      quote,
    });
  } catch (err: any) {
    console.error("Fetch quote error:", err);
    return NextResponse.json(
      { status: false, message: "Error loading quotation" },
      { status: 500 }
    );
  }
}
