import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { DriverModel } from "@/models/Driver";
import { UserModel } from "@/models/User";

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

    const drivers = await DriverModel.getAll();

    return NextResponse.json({
      status: true,
      drivers,
    });
  } catch (error: any) {
    console.error("GET /api/admin/drivers error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, licenseNumber, vehicleModel, vehiclePlate, vehicleCategory } = body;

    if (!name || !email || !licenseNumber || !vehiclePlate) {
      return NextResponse.json(
        { status: false, message: "Name, Email, License, and Vehicle Plate are required." },
        { status: 400 }
      );
    }

    // 1. Create User account for driver if not exists
    let user = await UserModel.findByEmail(email);
    if (!user) {
      user = await UserModel.create({
        name,
        email,
        phone,
        password: "DriverPassword@123",
        role: "driver",
      });
    }

    // 2. Register Driver in drivers table
    const driver = await DriverModel.create({
      userId: user.id,
      licenseNumber,
      vehicleModel: vehicleModel || "Skoda Octavia",
      vehiclePlate,
      vehicleCategory: vehicleCategory || "saloon",
      isActive: true,
    });

    return NextResponse.json({
      status: true,
      driver,
      message: "Driver onboarded successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/drivers error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to onboard driver" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ status: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { driverId, verificationStatus, isActive, adminNotes } = body;

    if (!driverId) {
      return NextResponse.json({ status: false, message: "driverId is required" }, { status: 400 });
    }

    await DriverModel.update(driverId, {
      verificationStatus,
      isActive,
      adminNotes,
    });

    const updatedDriver = await DriverModel.findById(driverId);

    return NextResponse.json({
      status: true,
      message: "Driver compliance status updated successfully.",
      driver: updatedDriver,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/drivers error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to update driver" }, { status: 500 });
  }
}
