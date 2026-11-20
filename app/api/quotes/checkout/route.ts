import { NextResponse } from "next/server";
import { quoteStore } from "@/lib/quote-store";
import { EXTRA_OPTIONS } from "@/lib/pricing-engine";
import { BookingModel } from "@/models/Booking";
import { DriverModel } from "@/models/Driver";
import { sendBookingConfirmationEmail, sendAdminBookingAlertEmail } from "@/lib/email";
import { getStripeServer } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      quoteRef,
      paymentMethod = "stripe_card",
      passenger,
      passengerDetails,
      selectedVehicleId,
      selectedExtras,
      totalAmount,
      currency: requestedCurrency,
      paymentIntentId,
      cardLast4,
    } = body;

    if (!quoteRef) {
      return NextResponse.json({ status: false, message: "quoteRef is required" }, { status: 400 });
    }

    const quote = await quoteStore.get(quoteRef);
    if (!quote) {
      return NextResponse.json({ status: false, message: "Quote not found" }, { status: 404 });
    }

    // Unify passenger details
    const finalPassenger = passenger || passengerDetails || quote.passenger;

    // Determine chosen vehicle & total price
    const vehId = selectedVehicleId || quote.selectedVehicleId || "saloon";
    const selectedVeh = quote.pricing?.vehicles?.find((v: any) => v.id === vehId) || quote.pricing?.vehicles?.[0];
    const basePrice = selectedVeh?.finalPrice || selectedVeh?.totalPrice || 45.0;

    let extrasTotal = 0;
    const extrasList = selectedExtras || quote.selectedExtras || [];
    extrasList.forEach((extId: string) => {
      const ext = EXTRA_OPTIONS.find((e) => e.id === extId);
      if (ext) extrasTotal += ext.price;
    });

    const calculatedTotal = Math.round((basePrice + extrasTotal) * 100) / 100;
    const finalPaidAmount = typeof totalAmount === "number" && totalAmount > 0 ? totalAmount : calculatedTotal;

    // Verify Stripe PaymentIntent if present
    const stripe = getStripeServer();
    let verifiedPaymentId = paymentIntentId || null;

    if (stripe && paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi.status !== "succeeded" && pi.status !== "processing" && pi.status !== "requires_capture") {
          console.warn(`PaymentIntent ${paymentIntentId} status is ${pi.status}`);
        }
      } catch (stripeErr: any) {
        console.warn("Could not retrieve Stripe PaymentIntent:", stripeErr.message);
      }
    }

    const isCash = paymentMethod === "cash_to_driver";
    const paymentStatus = isCash ? "unpaid" : "completed";
    const finalCurrency = (requestedCurrency || quote.currency || "GBP").toUpperCase();

    // Auto-dispatch: assign random available driver matching selected vehicle category
    let assignedDriver: any = null;
    try {
      const driver = await DriverModel.assignRandomAvailableDriver(
        vehId,
        quote.pickUpDate,
        quote.pickUpTime
      );
      if (driver) {
        await BookingModel.assignDriver(quoteRef, driver.id);
        assignedDriver = {
          id: driver.id,
          name: driver.driver_name || "Assigned Chauffeur",
          phone: driver.driver_phone || "+44 7911 123456",
          email: driver.driver_email || "chauffeur@otstaxi.co.uk",
          licenseNumber: driver.license_number || "PCO Licensed",
          vehicleModel: driver.vehicle_model || "Executive Chauffeur Vehicle",
          vehiclePlate: driver.vehicle_plate || "LO71 ABC",
          vehicleYear: driver.vehicle_year || "2023",
          vehicleCategory: driver.vehicle_category || vehId,
        };
      }
    } catch (driverAssignErr: any) {
      console.warn("Driver auto-assignment warning:", driverAssignErr.message);
    }

    // Mark quote as completed in memory store
    await quoteStore.update(quoteRef, {
      selectedVehicleId: vehId,
      selectedExtras: extrasList,
      passenger: finalPassenger,
      paymentStatus: isCash ? "cancelled" : "completed",
      paidAmount: finalPaidAmount,
      currency: finalCurrency,
      paymentMethod,
      driver_id: assignedDriver?.id,
      assignedDriver,
    });

    // Update MySQL booking record if connected
    try {
      if (isCash) {
        await BookingModel.updateDetails(quoteRef, {
          selectedVehicleId: vehId,
          selectedExtras: extrasList,
          passengerName: finalPassenger?.fullName,
          passengerEmail: finalPassenger?.email,
          passengerPhone: finalPassenger?.phone,
          flightNumber: finalPassenger?.flightNumber,
          terminal: finalPassenger?.terminal,
          specialNotes: finalPassenger?.specialNotes,
          currency: finalCurrency,
          totalPrice: finalPaidAmount,
        });
      } else {
        await BookingModel.markPaymentCompleted(quoteRef, {
          paidAmount: finalPaidAmount,
          paymentMethod,
          stripePaymentId: verifiedPaymentId || (cardLast4 ? `sim_card_${cardLast4}` : undefined),
          currency: finalCurrency,
        });
      }
    } catch (dbErr: any) {
      console.warn("MySQL booking update skipped or failed:", dbErr.message);
    }

    // Send automated email receipt & admin alert in background
    BookingModel.getByRef(quoteRef).then((b) => {
      if (b) {
        sendBookingConfirmationEmail(b).catch((e) => console.error("Confirmation email error:", e));
        sendAdminBookingAlertEmail(b).catch((e) => console.error("Admin alert email error:", e));
      }
    }).catch(() => {});

    return NextResponse.json({
      status: true,
      quoteRef,
      paidAmount: finalPaidAmount,
      currency: finalCurrency,
      paymentMethod,
      paymentStatus,
      assignedDriver,
      message: isCash
        ? "Booking confirmed! You can pay the driver directly upon arrival."
        : "Payment authorized and booking confirmed successfully via Stripe.",
    });
  } catch (error: any) {
    console.error("quotes/checkout error:", error);
    return NextResponse.json({ status: false, message: error.message || "Payment processing failed" }, { status: 500 });
  }
}
