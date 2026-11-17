import { NextResponse } from "next/server";
import { quoteStore } from "@/lib/quote-store";
import { searchLocations } from "@/lib/locations-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fromLocation = body.fromDestination || body.from || body.airport || "London Heathrow Airport (LHR)";
    const toLocation = body.toDestination || body.to || body.destination || "Central London, London, UK";

    // Attempt to lookup coordinates from our preset locations if not provided
    let fromCoords = body.fromCoords;
    let toCoords = body.toCoords;

    if (!fromCoords) {
      const match = searchLocations(fromLocation)[0];
      if (match) fromCoords = { lat: match.lat, lng: match.lng };
    }

    if (!toCoords) {
      const match = searchLocations(toLocation)[0];
      if (match) toCoords = { lat: match.lat, lng: match.lng };
    }

    const quote = await quoteStore.create({
      fromLocation,
      toLocation,
      fromLocationType: body.fromLocationType || 1,
      toLocationType: body.toLocationType || 2,
      fromCoords,
      toCoords,
      passengers: parseInt(body.passengers) || 1,
      suitcases: parseInt(body.suitcases) || 1,
      pickUpDate: body.pickUpDate || "14/10/2026",
      pickUpTime: body.pickUpTime || "15:00",
      bookReturn: Boolean(body.bookReturn),
      returnDate: body.returnDate,
      returnTime: body.returnTime,
      waypoints: Array.isArray(body.waypoints) ? body.waypoints : [],
    });

    return NextResponse.json({
      status: true,
      quoteRef: quote.quoteRef,
      quote,
    });
  } catch (error) {
    console.error("quotes/create error:", error);
    return NextResponse.json(
      { status: false, message: "A technical problem occurred, please try again." },
      { status: 500 }
    );
  }
}
