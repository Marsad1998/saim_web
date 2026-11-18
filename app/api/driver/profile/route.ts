import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { DriverModel, computeDriverProgress } from "@/models/Driver";

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
      address,
      niNumber,
      emergencyContact,
      licenseNumber,
      pcoExpiry,
      dvlaLicenseNumber,
      vehicleModel,
      vehiclePlate,
      vehicleYear,
      vehicleCategory,
      insuranceNumber,
      insuranceExpiry,
      bankName,
      sortCode,
      accountNumber,
      docPcoBadge,
      docDvlaLicense,
      docPhvMot,
      docInsurance,
      stepSubmitted, // Optional step identifier: 1, 2, 3, or 4
    } = body;

    let driver = await DriverModel.findByUserId(payload.userId);

    const updatePayload: any = {
      ...(address !== undefined && { address }),
      ...(niNumber !== undefined && { niNumber }),
      ...(emergencyContact !== undefined && { emergencyContact }),
      ...(licenseNumber !== undefined && { licenseNumber }),
      ...(pcoExpiry !== undefined && { pcoExpiry }),
      ...(dvlaLicenseNumber !== undefined && { dvlaLicenseNumber }),
      ...(vehicleModel !== undefined && { vehicleModel }),
      ...(vehiclePlate !== undefined && { vehiclePlate }),
      ...(vehicleYear !== undefined && { vehicleYear }),
      ...(vehicleCategory !== undefined && { vehicleCategory }),
      ...(insuranceNumber !== undefined && { insuranceNumber }),
      ...(insuranceExpiry !== undefined && { insuranceExpiry }),
      ...(bankName !== undefined && { bankName }),
      ...(sortCode !== undefined && { sortCode }),
      ...(accountNumber !== undefined && { accountNumber }),
      ...(docPcoBadge !== undefined && { docPcoBadge }),
      ...(docDvlaLicense !== undefined && { docDvlaLicense }),
      ...(docPhvMot !== undefined && { docPhvMot }),
      ...(docInsurance !== undefined && { docInsurance }),
    };

    if (!driver) {
      driver = await DriverModel.create({
        userId: payload.userId,
        ...updatePayload,
      });
    } else {
      await DriverModel.update(driver.id, updatePayload);
      driver = await DriverModel.findById(driver.id);
    }

    // Determine verification status based on completion score
    const progress = computeDriverProgress(driver || {});
    let nextVerificationStatus = driver?.verification_status || "incomplete";

    if (progress.isComplete) {
      if (nextVerificationStatus === "incomplete") {
        nextVerificationStatus = "pending_approval";
      }
    } else {
      nextVerificationStatus = "incomplete";
    }

    if (driver) {
      await DriverModel.update(driver.id, {
        completionScore: progress.score,
        verificationStatus: nextVerificationStatus,
        isActive: nextVerificationStatus === "approved" ? driver.is_active : false,
      });
      driver = await DriverModel.findById(driver.id);
    }

    return NextResponse.json({
      status: true,
      message: progress.isComplete
        ? "All 4 steps completed! Your chauffeur compliance profile is submitted for approval."
        : `Step saved successfully! Profile progress is now ${progress.score}%.`,
      driver,
      progress,
    });
  } catch (error: any) {
    console.error("POST /api/driver/profile error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to update profile." }, { status: 500 });
  }
}
