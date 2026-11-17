import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { dbQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ status: false, message: "Invalid session" }, { status: 401 });
    }

    // Query bookings by user_id or passenger_email
    const rows = await dbQuery<any[]>(
      `SELECT quote_ref, from_location, to_location, pickup_date, pickup_time,
              selected_vehicle_id, passengers, total_price, currency,
              booking_status, payment_status, created_at
       FROM bookings 
       WHERE user_id = ? OR passenger_email = ?
       ORDER BY created_at DESC`,
      [payload.userId, payload.email.toLowerCase()]
    );

    const vehicleNames: Record<string, string> = {
      saloon: "Standard Saloon",
      estate: "Estate Car",
      "executive-saloon": "Executive Saloon (Mercedes E-Class)",
      mpv: "People Carrier / MPV",
      "minibus-8": "8-Seater Minibus",
      "executive-mpv": "Executive MPV (Mercedes V-Class)",
    };

    const bookings = (rows || []).map((b) => ({
      id: b.quote_ref,
      from: b.from_location,
      to: b.to_location,
      date: b.pickup_date,
      time: b.pickup_time,
      vehicle: vehicleNames[b.selected_vehicle_id] || b.selected_vehicle_id,
      passengers: b.passengers,
      price: Number(b.total_price),
      currency: b.currency || "GBP",
      status: b.booking_status === "confirmed" ? "Confirmed" : b.booking_status === "completed" ? "Completed" : "Quoted",
      paymentStatus: b.payment_status,
      createdAt: b.created_at,
    }));

    return NextResponse.json({
      status: true,
      bookings,
    });
  } catch (error: any) {
    console.error("GET /api/account/my-bookings error:", error.message);
    return NextResponse.json({ status: false, message: "Failed to fetch bookings" }, { status: 500 });
  }
}
