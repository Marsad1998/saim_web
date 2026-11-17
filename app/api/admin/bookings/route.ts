import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { BookingModel } from "@/models/Booking";

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

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "all";

    // 1. Fetch bookings
    let query = `
      SELECT b.*, 
             d.vehicle_plate, d.vehicle_model,
             u.name as driver_name, u.phone as driver_phone
      FROM bookings b
      LEFT JOIN drivers d ON b.driver_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
    `;
    const params: any[] = [];

    if (statusFilter !== "all") {
      query += ` WHERE b.booking_status = ?`;
      params.push(statusFilter);
    }

    query += ` ORDER BY b.created_at DESC LIMIT 100`;

    const rows = await dbQuery<any[]>(query, params);

    // 2. Fetch overall stats
    const statsRows = await dbQuery<any[]>(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN booking_status = 'confirmed' OR booking_status = 'completed' THEN 1 ELSE 0 END) as active_confirmed,
        SUM(CASE WHEN payment_status = 'completed' THEN total_price ELSE 0 END) as total_revenue,
        (SELECT COUNT(*) FROM drivers WHERE is_active = 1) as active_drivers,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers
      FROM bookings
    `);

    const stats = {
      totalBookings: statsRows[0]?.total_bookings || 0,
      activeConfirmed: statsRows[0]?.active_confirmed || 0,
      totalRevenue: Number(statsRows[0]?.total_revenue || 0),
      activeDrivers: statsRows[0]?.active_drivers || 0,
      totalCustomers: statsRows[0]?.total_customers || 0,
    };

    return NextResponse.json({
      status: true,
      stats,
      bookings: rows || [],
    });
  } catch (error: any) {
    console.error("GET /api/admin/bookings error:", error.message);
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
    const { quoteRef, status, driverId } = body;

    if (!quoteRef) {
      return NextResponse.json({ status: false, message: "Missing quote reference" }, { status: 400 });
    }

    if (status && driverId !== undefined) {
      await BookingModel.updateStatus(quoteRef, status, driverId || undefined);
    } else if (status) {
      await BookingModel.updateStatus(quoteRef, status);
    } else if (driverId) {
      await dbQuery("UPDATE bookings SET driver_id = ?, booking_status = 'assigned' WHERE quote_ref = ?", [
        driverId,
        quoteRef,
      ]);
    }

    return NextResponse.json({
      status: true,
      message: `Booking ${quoteRef} updated successfully`,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/bookings error:", error.message);
    return NextResponse.json({ status: false, message: "Update failed" }, { status: 500 });
  }
}
