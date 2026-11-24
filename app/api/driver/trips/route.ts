import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { DriverModel } from "@/models/Driver";
import { BookingModel, IBooking } from "@/models/Booking";
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

    const driver = await DriverModel.findByUserId(payload.userId);
    const driverId = driver ? driver.id : `drv_${payload.userId.slice(-6)}`;

    let trips: IBooking[] = [];
    try {
      trips = await BookingModel.getByDriverId(driverId);
    } catch (e) {}

    // Only provide sample dispatched transfers for the demo driver
    if (trips.length === 0 && isDemoDriver) {
      trips = [
        {
          quote_ref: "QCM-892104",
          from_location: "London Heathrow Airport (LHR), Terminal 5",
          to_location: "The Savoy, Strand, London WC2R 0EZ",
          from_location_type: 1,
          to_location_type: 2,
          pickup_date: "Today",
          pickup_time: "18:30",
          book_return: false,
          passengers: 2,
          suitcases: 2,
          distance_miles: 16.5,
          estimated_time_mins: 42,
          waypoints: [],
          selected_vehicle_id: "executive-saloon",
          selected_extras: ["meet_and_greet"],
          passenger_name: "Sir David Attenborough",
          passenger_email: "passenger@example.com",
          passenger_phone: "+44 7911 123456",
          flight_number: "BA1492",
          terminal: "Terminal 5",
          pickup_buffer_mins: 45,
          special_notes: "Meet inside arrivals hall with name board: ATTENBOROUGH",
          total_price: 78.50,
          currency: "GBP",
          payment_status: "completed",
          payment_method: "stripe_card",
          driver_id: driverId,
          booking_status: "assigned",
        },
        {
          quote_ref: "QCM-774190",
          from_location: "Central London (Mayfair)",
          to_location: "Gatwick Airport (LGW), South Terminal",
          from_location_type: 2,
          to_location_type: 1,
          pickup_date: "Tomorrow",
          pickup_time: "07:15",
          book_return: false,
          passengers: 3,
          suitcases: 3,
          distance_miles: 34.2,
          estimated_time_mins: 65,
          waypoints: [],
          selected_vehicle_id: "executive-saloon",
          selected_extras: [],
          passenger_name: "Lady Eleanor Vance",
          passenger_email: "eleanor@example.com",
          passenger_phone: "+44 7700 900123",
          special_notes: "Two large suitcases and one golf bag",
          total_price: 112.00,
          currency: "GBP",
          payment_status: "completed",
          payment_method: "stripe_card",
          driver_id: driverId,
          booking_status: "assigned",
        },
      ];
    }

    return NextResponse.json({
      status: true,
      trips,
    });
  } catch (error: any) {
    console.error("GET /api/driver/trips error:", error.message);
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
    const { quoteRef, status } = body;

    if (!quoteRef || !status) {
      return NextResponse.json({ status: false, message: "quoteRef and status required" }, { status: 400 });
    }

    // Allowed status transitions for driver
    const allowed = ["assigned", "in_progress", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ status: false, message: "Invalid status" }, { status: 400 });
    }

    await BookingModel.updateStatus(quoteRef, status as any);

    return NextResponse.json({
      success: true,
      quoteRef,
      tripStatus: status,
      message: `Trip status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("PATCH /api/driver/trips error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}
