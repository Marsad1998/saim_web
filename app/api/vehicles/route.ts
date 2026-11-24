import { NextResponse } from "next/server";
import { VehicleModel } from "@/models/Vehicle";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const vehicles = await VehicleModel.getAll(!includeInactive);

    return NextResponse.json({
      status: true,
      vehicles,
    });
  } catch (error: any) {
    console.error("GET /api/vehicles error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return NextResponse.json(
    { status: false, message: "Vehicle fleet is fixed to the official 5 rate card categories. Rates can be adjusted in the Admin Portal." },
    { status: 400 }
  );
}
