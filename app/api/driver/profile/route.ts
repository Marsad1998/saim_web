import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { DriverModel } from "@/models/Driver";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ status: false, message: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const {
      licenseNumber,
      vehicleModel,
      vehiclePlate,
      vehicleCategory,
      pcoExpiry,
      insuranceNumber,
      sortCode,
      accountNumber,
    } = body;

    if (!licenseNumber || !vehicleModel || !vehiclePlate) {
      return NextResponse.json(
        { status: false, message: "Please fill in all required fields (PCO License, Vehicle Model, and Registration Plate)." },
        { status: 400 }
      );
    }

    let driver = await DriverModel.findByUserId(payload.userId);

    if (!driver) {
      // Create new driver record
      driver = await DriverModel.create({
        userId: payload.userId,
        licenseNumber,
        vehicleModel,
        vehiclePlate,
        vehicleCategory: vehicleCategory || "saloon",
        pcoExpiry,
        insuranceNumber,
        sortCode,
        accountNumber,
        verificationStatus: "approved",
        isActive: true,
      });
    } else {
      // Update existing driver record
      await DriverModel.update(driver.id, {
        licenseNumber,
        vehicleModel,
        vehiclePlate,
        vehicleCategory: vehicleCategory || "saloon",
        pcoExpiry,
        insuranceNumber,
        sortCode,
        accountNumber,
        verificationStatus: "approved",
        isActive: true,
      });
      driver = await DriverModel.findById(driver.id);
    }

    return NextResponse.json({
      status: true,
      message: "Chauffeur profile and vehicle documentation verified successfully! On-Duty status is now unlocked.",
      driver,
    });
  } catch (error: any) {
    console.error("POST /api/driver/profile error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to update profile." }, { status: 500 });
  }
}
