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
  try {
    const body = await request.json();
    const { id, name, categoryName, image, passengers, suitcases, handLuggage, description, features, multiplier, sampleVehicles, sortOrder } = body;

    if (!id || !name || !multiplier) {
      return NextResponse.json(
        { status: false, message: "Vehicle ID, Name, and Multiplier are required." },
        { status: 400 }
      );
    }

    const success = await VehicleModel.create({
      id,
      name,
      categoryName: categoryName || name,
      image: image || "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
      passengers: Number(passengers) || 4,
      suitcases: Number(suitcases) || 2,
      handLuggage: Number(handLuggage) || 2,
      description: description || "",
      features: Array.isArray(features) ? features : [],
      multiplier: Number(multiplier),
      sampleVehicles: sampleVehicles || "",
      sortOrder: Number(sortOrder) || 1,
    });

    if (success) {
      return NextResponse.json({
        status: true,
        message: "Vehicle created successfully in database.",
      });
    }

    return NextResponse.json({ status: false, message: "Failed to create vehicle" }, { status: 500 });
  } catch (error: any) {
    console.error("POST /api/vehicles error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
