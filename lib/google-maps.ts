/**
 * Google Maps API Service (Server & Client)
 * Supports Google Places Autocomplete, Distance Matrix, Geocoding, and Directions
 * with automatic fallback to local UK database when no API key is provided.
 */

export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    ""
  ).trim();
}

export function isGoogleMapsEnabled(): boolean {
  const key = getGoogleMapsApiKey();
  return Boolean(
    key &&
    key.length > 10 &&
    !key.includes("sample") &&
    !key.includes("your_") &&
    key !== "undefined"
  );
}

export interface GooglePlacePrediction {
  location: string;
  code: string;
  locationType: number; // 1 = Airport, 2 = Address/City
  placeId?: string;
  lat?: number;
  lng?: number;
  postcode?: string;
  source: "google" | "local";
}

/**
 * Server-side Google Places Autocomplete for UK addresses
 */
export async function searchGooglePlaces(phrase: string): Promise<GooglePlacePrediction[]> {
  const apiKey = getGoogleMapsApiKey();
  if (!isGoogleMapsEnabled() || !phrase || phrase.trim().length < 2) {
    return [];
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", phrase.trim());
    url.searchParams.set("components", "country:gb"); // Restrict to United Kingdom
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const data = await res.json();
    if (data.status !== "OK" || !Array.isArray(data.predictions)) {
      return [];
    }

    return data.predictions.map((p: any) => {
      const isAirport =
        p.types?.includes("airport") ||
        p.description?.toLowerCase().includes("airport") ||
        p.structured_formatting?.main_text?.toLowerCase().includes("airport");

      return {
        location: p.description,
        code: isAirport ? "AIRPORT" : "UK",
        locationType: isAirport ? 1 : 2,
        placeId: p.place_id,
        source: "google",
      };
    });
  } catch (error) {
    console.error("searchGooglePlaces error:", error);
    return [];
  }
}

export interface GoogleDistanceResult {
  distanceMiles: number;
  durationMinutes: number;
  status: "OK" | "FALLBACK";
}

/**
 * Server-side Google Distance Matrix API calculation
 */
export async function calculateGoogleDistanceMatrix(
  origin: string,
  destination: string
): Promise<GoogleDistanceResult | null> {
  const apiKey = getGoogleMapsApiKey();
  if (!isGoogleMapsEnabled()) {
    return null;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", origin);
    url.searchParams.set("destinations", destination);
    url.searchParams.set("units", "imperial"); // Returns miles
    url.searchParams.set("region", "gb");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "OK" || !data.rows?.[0]?.elements?.[0]) {
      return null;
    }

    const element = data.rows[0].elements[0];
    if (element.status !== "OK") {
      return null;
    }

    // Distance in meters converted to miles (1 meter = 0.000621371 miles)
    const distanceMeters = element.distance.value;
    const distanceMiles = Math.round((distanceMeters * 0.000621371) * 10) / 10;

    // Duration in seconds converted to minutes
    const durationSeconds = element.duration.value;
    const durationMinutes = Math.round(durationSeconds / 60);

    return {
      distanceMiles: Math.max(distanceMiles, 3.0),
      durationMinutes: Math.max(durationMinutes, 10),
      status: "OK",
    };
  } catch (error) {
    console.error("calculateGoogleDistanceMatrix error:", error);
    return null;
  }
}
