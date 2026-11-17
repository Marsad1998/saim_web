import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { quoteStore } from "@/lib/quote-store";

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

    const vehicleNames: Record<string, string> = {
      saloon: "Standard Saloon",
      estate: "Estate Car",
      "executive-saloon": "Executive Saloon (Mercedes E-Class)",
      mpv: "People Carrier / MPV",
      "minibus-8": "8-Seater Minibus",
      "executive-mpv": "Executive MPV (Mercedes V-Class)",
    };

    let bookings: any[] = [];

    try {
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

      if (rows && rows.length > 0) {
        bookings = rows.map((b) => ({
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
      }
    } catch (dbErr: any) {
      console.warn("MySQL my-bookings query fallback:", dbErr.message);
    }

    // Fallback to in-memory quotes if DB returned empty or wasn't available
    if (bookings.length === 0) {
      const memQuotes = await quoteStore.listByUserOrEmail(payload.userId, payload.email);
      bookings = memQuotes.map((q) => ({
        id: q.quoteRef,
        from: q.fromLocation,
        to: q.toLocation,
        date: q.pickUpDate,
        time: q.pickUpTime,
        vehicle: vehicleNames[q.selectedVehicleId || ""] || q.selectedVehicleId || "Standard Saloon",
        passengers: q.passengers,
        price: Number(q.paidAmount || q.pricing?.vehicles?.find((v: any) => v.id === q.selectedVehicleId)?.price || 0),
        currency: q.currency || "GBP",
        status: q.paymentStatus === "completed" ? "Confirmed" : "Quoted",
        paymentStatus: q.paymentStatus,
        createdAt: q.createdAt,
      }));
    }

    return NextResponse.json({
      status: true,
      bookings,
    });
  } catch (error: any) {
    console.error("GET /api/account/my-bookings error:", error.message);
    return NextResponse.json({ status: true, bookings: [] });
  }
}
