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
      // Query bookings by user_id or passenger_email with assigned driver details
      const rows = await dbQuery<any[]>(
        `SELECT b.quote_ref, b.from_location, b.to_location, b.pickup_date, b.pickup_time,
                b.selected_vehicle_id, b.passengers, b.total_price, b.currency,
                b.booking_status, b.payment_status, b.created_at, b.driver_id,
                d.vehicle_model as driver_vehicle_model,
                d.vehicle_plate as driver_vehicle_plate,
                d.vehicle_year as driver_vehicle_year,
                d.vehicle_category as driver_vehicle_category,
                u.name as driver_name,
                u.phone as driver_phone
         FROM bookings b
         LEFT JOIN drivers d ON b.driver_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE b.user_id = ? OR b.passenger_email = ?
         ORDER BY b.created_at DESC`,
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
          assignedDriver: b.driver_id ? {
            name: b.driver_name || "Assigned Chauffeur",
            phone: b.driver_phone,
            vehicleModel: b.driver_vehicle_model,
            vehiclePlate: b.driver_vehicle_plate,
            vehicleYear: b.driver_vehicle_year,
            vehicleCategory: b.driver_vehicle_category,
          } : undefined,
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
        assignedDriver: q.assignedDriver,
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
