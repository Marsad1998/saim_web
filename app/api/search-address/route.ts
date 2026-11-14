import { NextResponse } from "next/server";
import { searchLocations } from "@/lib/locations-data";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phrase = body.phrase || "";

    const results = searchLocations(phrase);

    return NextResponse.json(results);
  } catch (error) {
    console.error("search-address error:", error);
    return NextResponse.json({ error: "Failed to search locations" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  return NextResponse.json(searchLocations(q));
}
