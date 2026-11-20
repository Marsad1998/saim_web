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
      sampleVehicles,
      isActive,
      sortOrder,
    } = body;

    if (!id || !name || !categoryName) {
      return NextResponse.json(
        { status: false, message: "ID, Name, and Category Name are required." },
        { status: 400 }
      );
    }

    const newVehicle = {
      id: id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
      name: name.trim(),
      categoryName: categoryName.trim(),
      image: image?.trim() || "https://cdn.otstaxi.com/assets/img/icon/hdiw/2-1.png",
      passengers: Number(passengers || 4),
      suitcases: Number(suitcases || 2),
      handLuggage: Number(handLuggage || 2),
      description: description?.trim() || "Reliable chauffeur and transfer vehicle.",
      features: Array.isArray(features) ? features : ["Air Conditioning", "Fixed Price", "Flight Tracking"],
      multiplier: Number(multiplier || 1.0),
      sampleVehicles: sampleVehicles?.trim() || name,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: Number(sortOrder || 0),
    };

    const success = await VehicleModel.create(newVehicle);

    return NextResponse.json({
      status: success,
      message: success ? "Vehicle class created successfully." : "Failed to create vehicle class.",
      vehicle: newVehicle,
    });
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
    if (sampleVehicles !== undefined) updates.sampleVehicles = sampleVehicles;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updates.sortOrder = Number(sortOrder);

    if (Object.keys(updates).length > 0) {
      await VehicleModel.update(id, updates);
    }

    return NextResponse.json({
      status: true,
      message: "Vehicle updated successfully",
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

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ status: false, message: "Vehicle ID is required" }, { status: 400 });
    }

    const success = await VehicleModel.delete(id);

    return NextResponse.json({
      status: success,
      message: success ? "Vehicle class deleted successfully." : "Failed to delete vehicle class.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/vehicles error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
