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

export async function PATCH(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, multiplier, isActive } = body;

    if (!id) {
      return NextResponse.json({ status: false, message: "Vehicle id is required" }, { status: 400 });
    }

    if (multiplier !== undefined) {
      await VehicleModel.updateMultiplier(id, Number(multiplier));
    }

    if (isActive !== undefined) {
      await VehicleModel.toggleActive(id, Boolean(isActive));
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
