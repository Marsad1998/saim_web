import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { BookingModel } from "@/models/Booking";
import { dbQuery } from "@/lib/db";
import { sendBookingCancellationEmail, sendBookingModificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwtToken(token);
  if (!payload || !payload.userId) return null;
  return payload;
}

/**
 * Customer: Get single booking details (Supports logged in user or verified email match)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteRef: string }> }
) {
  try {
    const payload = await getAuthUser(request);
    const { quoteRef } = await params;
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    const booking = await BookingModel.getByRef(quoteRef);
    if (!booking) {
      return NextResponse.json({ status: false, message: "Booking not found" }, { status: 404 });
    }

    // Verify ownership via session OR matching email
    const isOwner = payload 
      ? (booking.user_id === payload.userId || booking.passenger_email?.toLowerCase() === payload.email?.toLowerCase())
      : (emailParam && booking.passenger_email?.toLowerCase() === emailParam.toLowerCase().trim());

    if (!isOwner) {
      return NextResponse.json({ status: false, message: "Unauthorized access to booking" }, { status: 401 });
    }

    return NextResponse.json({ status: true, booking });
  } catch (error: any) {
    console.error("GET /api/account/my-bookings/[quoteRef] error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}

/**
 * Customer: Cancel or Modify booking (Customer self-serve)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ quoteRef: string }> }
) {
  try {
    const payload = await getAuthUser(request);
    const { quoteRef } = await params;
    const body = await request.json();
    const { action, email, ...updates } = body;

    // Verify ownership first
    const booking = await BookingModel.getByRef(quoteRef);
    if (!booking) {
      return NextResponse.json({ status: false, message: "Booking not found" }, { status: 404 });
    }

    const isOwner = payload
      ? (booking.user_id === payload.userId || booking.passenger_email?.toLowerCase() === payload.email?.toLowerCase())
      : (email && booking.passenger_email?.toLowerCase() === String(email).toLowerCase().trim());

    if (!isOwner) {
      return NextResponse.json({ status: false, message: "Forbidden: Passenger email verification required" }, { status: 403 });
    }

    // Handle cancellation
    if (action === "cancel") {
      const pickupDateTime = new Date(`${booking.pickup_date}T${booking.pickup_time}`);
      const hoursUntilPickup = (pickupDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

      if (booking.booking_status === "completed") {
        return NextResponse.json(
          { status: false, message: "Cannot cancel a completed trip" },
          { status: 400 }
        );
      }

      if (booking.booking_status === "in_progress") {
        return NextResponse.json(
          { status: false, message: "Cannot cancel a trip in progress" },
          { status: 400 }
        );
      }

      if (booking.payment_status === "completed" && hoursUntilPickup < 24) {
        return NextResponse.json(
          { status: false, message: "Cancellations within 24 hours of pickup require contacting support" },
          { status: 400 }
        );
      }

      const cancelled = await BookingModel.update(quoteRef, {
        booking_status: "cancelled",
        payment_status: booking.payment_status === "completed" ? "refunded" : "cancelled",
      });

      if (!cancelled) {
        return NextResponse.json({ status: false, message: "Failed to cancel booking" }, { status: 500 });
      }

      const isRefundEligible = booking.payment_status === "completed" && hoursUntilPickup >= 24;

      // Dispatch confirmation email to passenger & admin
      await sendBookingCancellationEmail(
        { ...booking, booking_status: "cancelled" } as any,
        isRefundEligible
      ).catch(() => {});

      return NextResponse.json({
        status: true,
        message: "Booking cancelled successfully",
        refundEligible: isRefundEligible,
      });
    }

    // Handle modification (date/time, vehicle, passenger details)
    if (action === "modify") {
      const pickupDateTime = new Date(`${booking.pickup_date}T${booking.pickup_time}`);
      const hoursUntilPickup = (pickupDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

      if (["completed", "in_progress", "cancelled"].includes(booking.booking_status)) {
        return NextResponse.json(
          { status: false, message: `Cannot modify a ${booking.booking_status} booking` },
          { status: 400 }
        );
      }

      if (hoursUntilPickup < 2) {
        return NextResponse.json(
          { status: false, message: "Modifications within 2 hours of pickup require contacting our operations team" },
          { status: 400 }
        );
      }

      // Allowed fields for customer modification
      const allowedFields: Partial<typeof updates> = {};
      if (updates.pickup_date) allowedFields.pickup_date = updates.pickup_date;
      if (updates.pickup_time) allowedFields.pickup_time = updates.pickup_time;
      if (updates.return_date) allowedFields.return_date = updates.return_date;
      if (updates.return_time) allowedFields.return_time = updates.return_time;
      if (updates.passengers) allowedFields.passengers = Number(updates.passengers);
      if (updates.suitcases) allowedFields.suitcases = Number(updates.suitcases);
      if (updates.selected_vehicle_id) allowedFields.selected_vehicle_id = updates.selected_vehicle_id;
      if (updates.passenger_name) allowedFields.passenger_name = updates.passenger_name;
      if (updates.passenger_phone) allowedFields.passenger_phone = updates.passenger_phone;
      if (updates.flight_number) allowedFields.flight_number = updates.flight_number;
      if (updates.terminal) allowedFields.terminal = updates.terminal;
      if (updates.special_notes) allowedFields.special_notes = updates.special_notes;

      if (Object.keys(allowedFields).length === 0) {
        return NextResponse.json(
          { status: false, message: "No valid modification fields provided" },
          { status: 400 }
        );
      }

      // Recalculate price if date/time/vehicle/passengers changed
      const needsRecalc = !!(
        updates.pickup_date || updates.pickup_time ||
        updates.selected_vehicle_id || updates.passengers
      );

      if (needsRecalc) {
        const { VehicleModel } = await import("@/models/Vehicle");
        const fleet = await VehicleModel.getAll();
        const { calculateQuote } = await import("@/lib/pricing-engine");

        const pricing = calculateQuote({
          fromLocation: booking.from_location,
          toLocation: booking.to_location,
          fromCoords: booking.from_lat && booking.from_lng ? { lat: booking.from_lat, lng: booking.from_lng } : undefined,
          toCoords: booking.to_lat && booking.to_lng ? { lat: booking.to_lat, lng: booking.to_lng } : undefined,
          passengers: allowedFields.passengers || booking.passengers,
          waypoints: [],
          bookReturn: booking.book_return,
          selectedVehicleId: allowedFields.selected_vehicle_id || booking.selected_vehicle_id,
        }, fleet);

        const selectedVeh = pricing.vehicles.find((v) => v.id === (allowedFields.selected_vehicle_id || booking.selected_vehicle_id));
        if (selectedVeh) {
          allowedFields.total_price = selectedVeh.totalPrice;
        }
      }

      const updated = await BookingModel.update(quoteRef, allowedFields);
      if (!updated) {
        return NextResponse.json({ status: false, message: "Failed to update booking" }, { status: 500 });
      }

      const updatedBooking = await BookingModel.getByRef(quoteRef);
      if (updatedBooking) {
        const summary = Object.entries(allowedFields)
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
          .join(', ');
        await sendBookingModificationEmail(updatedBooking as any, summary).catch(() => {});
      }

      return NextResponse.json({
        status: true,
        message: "Booking updated successfully",
        booking: updatedBooking,
      });
    }

    return NextResponse.json(
      { status: false, message: "Invalid action. Use 'cancel' or 'modify'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("PATCH /api/account/my-bookings/[quoteRef] error:", error.message);
    return NextResponse.json({ status: false, message: "Server error" }, { status: 500 });
  }
}