import { NextResponse } from "next/server";
import { quoteStore } from "@/lib/quote-store";
import { searchLocations } from "@/lib/locations-data";
import { isGoogleMapsEnabled, calculateGoogleDistanceMatrix } from "@/lib/google-maps";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fromLocation = (
      body.pickup ||
      body.fromDestination ||
      body.from ||
      body.airport ||
      "London Heathrow Airport (LHR)"
    ).trim();

    const toLocation = (
      body.dropoff ||
      body.toDestination ||
      body.to ||
      body.destination ||
      "Central London, London, UK"
    ).trim();

    // Coordinates resolution
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

    const fromLocationType = body.fromLocationType || (fromLocation.toLowerCase().includes("airport") ? 1 : 2);
    const toLocationType = body.toLocationType || (toLocation.toLowerCase().includes("airport") ? 1 : 2);

    // If Google Maps is active, get real road distance & traffic duration
    let distanceMiles: number | undefined;
    let estimatedTimeMins: number | undefined;

    if (isGoogleMapsEnabled()) {
      const googleMatrix = await calculateGoogleDistanceMatrix(fromLocation, toLocation);
      if (googleMatrix) {
        distanceMiles = googleMatrix.distanceMiles;
        estimatedTimeMins = googleMatrix.durationMinutes;
      }
    }

    const quote = await quoteStore.create({
      fromLocation,
      toLocation,
      fromLocationType,
      toLocationType,
      fromCoords,
      toCoords,
      passengers: parseInt(body.passengers) || 1,
      suitcases: parseInt(body.suitcases) || 1,
      pickUpDate: body.pickupDate || body.pickUpDate || new Date().toISOString().split("T")[0],
      pickUpTime: body.pickupTime || body.pickUpTime || "12:00",
      bookReturn: Boolean(body.isReturn || body.bookReturn),
      returnDate: body.returnDate,
      returnTime: body.returnTime,
      waypoints: Array.isArray(body.waypoints) ? body.waypoints : [],
      distanceMiles,
      estimatedTimeMins,
      currency: (body.currency || "GBP").toUpperCase(),
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
