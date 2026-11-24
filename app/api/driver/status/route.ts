import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { DriverModel } from "@/models/Driver";
import { BookingModel } from "@/models/Booking";
import { dbQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ status: false, message: "Invalid session" }, { status: 401 });
    }

    const isDemoDriver =
      payload.userId === "usr_driver_1" ||
      payload.userId === "usr_driver_2" ||
      payload.email?.toLowerCase().includes("driver@quickcarmidlands.co.uk") ||
      payload.email?.toLowerCase().includes("driver@driver.com");

    // Lookup driver profile by user_id
    let driver = await DriverModel.findByUserId(payload.userId);

    // Fallback if record not yet linked in MySQL
    if (!driver) {
      if (isDemoDriver) {
        driver = {
          id: `drv_${payload.userId.slice(-6)}`,
          user_id: payload.userId,
          license_number: "PCO-984321",
          vehicle_model: "Mercedes-Benz E-Class",
          vehicle_plate: "LO71 ABC",
          vehicle_category: "saloon",
          verification_status: "approved",
          is_active: true,
        };
      } else {
        // Real new registered driver: start completely empty & off-duty
        driver = {
          id: `drv_${payload.userId.slice(-6)}`,
          user_id: payload.userId,
          license_number: "",
          vehicle_model: "",
          vehicle_plate: "",
          vehicle_category: "saloon",
          verification_status: "incomplete",
          is_active: false,
        };
      }
    }

    // Query stats: today's completed trips & total earnings
    let completedCount = 0;
    let totalEarnings = 0;
    try {
      const statsRows = await dbQuery<any[]>(
        `SELECT COUNT(*) as count, SUM(total_price) as earnings 
         FROM bookings 
         WHERE driver_id = ? AND booking_status = 'completed'`,
        [driver.id]
      );
      if (statsRows && statsRows[0]) {
        completedCount = Number(statsRows[0].count) || 0;
        totalEarnings = Number(statsRows[0].earnings) || 0;
      }
    } catch (e) {}

    return NextResponse.json({
      status: true,
      driver: {
        ...driver,
        name: payload.name || "Chauffeur",
        email: payload.email,
      },
      stats: {
        completedTrips: completedCount || (isDemoDriver ? 14 : 0),
        totalEarnings: totalEarnings || (isDemoDriver ? 840.50 : 0),
        todayEarnings: isDemoDriver ? 125.00 : 0,
        rating: isDemoDriver ? 4.95 : 5.0,
      },
    });
  } catch (error: any) {
    console.error("GET /api/driver/status error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const { isActive } = body;

    let driver = await DriverModel.findByUserId(payload.userId);
    if (!driver) {
      return NextResponse.json({ status: false, message: "Driver record not found" }, { status: 404 });
    }

    // Enforce profile completion before allowing driver to go ON DUTY
    if (isActive && (!driver.license_number || driver.verification_status === "incomplete")) {
      return NextResponse.json({
        status: false,
        requiresProfileCompletion: true,
        message: "Profile incomplete! Please enter your PCO license number and vehicle registration plate to unlock On-Duty status."
      }, { status: 400 });
    }

    await DriverModel.toggleActive(driver.id, Boolean(isActive));

    return NextResponse.json({
      status: true,
      isActive: Boolean(isActive),
      message: isActive ? "Driver is now ON DUTY" : "Driver is now OFF DUTY",
    });
  } catch (error: any) {
    console.error("PATCH /api/driver/status error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
