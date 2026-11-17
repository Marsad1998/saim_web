import { NextResponse } from "next/server";
import { searchLocations, SearchLocationItem } from "@/lib/locations-data";
import { isGoogleMapsEnabled, searchGooglePlaces } from "@/lib/google-maps";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phrase = (body.phrase || body.query || "").trim();

    if (!phrase) {
      // Return top UK airports by default
      return NextResponse.json(searchLocations("Airport").slice(0, 8));
    }

    // 1. Try Google Places if API Key is configured
    if (isGoogleMapsEnabled()) {
      const googleResults = await searchGooglePlaces(phrase);
      if (googleResults.length > 0) {
        return NextResponse.json(googleResults);
      }
    }

    // 2. Fallback: Search pre-populated UK database
    const localMatches = searchLocations(phrase);

    if (localMatches.length > 0) {
      return NextResponse.json(localMatches);
    }

    // 3. Fallback: If no exact match in preset list, return custom location entry
    // so user can select their custom address and proceed without being blocked
    const customResult: SearchLocationItem = {
      location: phrase,
      code: "UK",
      locationType: phrase.toLowerCase().includes("airport") ? 1 : 2,
      lat: 51.5074,
      lng: -0.1278,
    };

    return NextResponse.json([customResult]);
  } catch (error) {
    console.error("search-address error:", error);
    return NextResponse.json({ error: "Failed to search locations" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || searchParams.get("phrase") || "";
  
  if (!q) {
    return NextResponse.json(searchLocations("Airport").slice(0, 8));
  }

  if (isGoogleMapsEnabled()) {
    const googleResults = await searchGooglePlaces(q);
    if (googleResults.length > 0) {
      return NextResponse.json(googleResults);
    }
  }

  const localMatches = searchLocations(q);
  if (localMatches.length > 0) {
    return NextResponse.json(localMatches);
  }

  return NextResponse.json([
    {
      location: q,
      code: "UK",
      locationType: 2,
      lat: 51.5074,
      lng: -0.1278,
    },
  ]);
}
