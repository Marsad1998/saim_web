import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { VehicleModel, DEFAULT_VEHICLE_FLEET } from "@/models/Vehicle";

export const dynamic = "force-dynamic";

function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwtToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const vehicles = await VehicleModel.getAll();

    return NextResponse.json({
      status: true,
      vehicles: vehicles && vehicles.length > 0 ? vehicles : DEFAULT_VEHICLE_FLEET,
    });
  } catch (error: any) {
    console.warn("GET /api/admin/vehicles error:", error.message);
    return NextResponse.json({
      status: true,
      vehicles: DEFAULT_VEHICLE_FLEET,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Vehicle fleet is fixed to the 5 official categories from the rate list
    return NextResponse.json(
      { 
        status: false, 
        message: "Vehicle fleet is fixed to the 5 official categories from your rate card. Rates and capacities can be adjusted anytime via Edit Details." 
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/vehicles error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      id, 
      name,
      categoryName,
      image,
      passengers,
      suitcases,
      handLuggage,
      description,
      features,
      multiplier, 
      ratePerMile,
      minimumFare,
      sampleVehicles,
      isActive,
      sortOrder,
    } = body;

    if (!id) {
      return NextResponse.json({ status: false, message: "Vehicle id is required" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (categoryName !== undefined) updates.categoryName = categoryName;
    if (image !== undefined) updates.image = image;
    if (passengers !== undefined) updates.passengers = Number(passengers);
    if (suitcases !== undefined) updates.suitcases = Number(suitcases);
    if (handLuggage !== undefined) updates.handLuggage = Number(handLuggage);
    if (description !== undefined) updates.description = description;
    if (features !== undefined) updates.features = features;
    if (multiplier !== undefined) updates.multiplier = Number(multiplier);
    if (ratePerMile !== undefined) updates.ratePerMile = Number(ratePerMile);
    if (minimumFare !== undefined) updates.minimumFare = Number(minimumFare);
    if (sampleVehicles !== undefined) updates.sampleVehicles = sampleVehicles;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);

    if (Object.keys(updates).length > 0) {
      await VehicleModel.update(id, updates);
    }

    return NextResponse.json({
      status: true,
      message: "Vehicle details and rates updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/vehicles error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Protect official core classes from deletion
    return NextResponse.json(
      { 
        status: false, 
        message: "Official vehicle classes from your rate card cannot be deleted. You can toggle them Active/Inactive instead." 
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("DELETE /api/admin/vehicles error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
