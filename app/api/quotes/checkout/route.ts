import { NextResponse } from "next/server";
import { quoteStore } from "@/lib/quote-store";
import { EXTRA_OPTIONS } from "@/lib/pricing-engine";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey && stripeSecretKey !== "sk_test_sample_key"
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-09-30.acacia" as any })
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteRef, paymentMethod = "stripe", passenger, cardDetails } = body;

    const quote = quoteStore.get(quoteRef);
    if (!quote) {
      return NextResponse.json({ status: false, message: "Quote not found" }, { status: 404 });
    }

    // Save passenger details if supplied
    if (passenger) {
      quoteStore.update(quoteRef, { passenger });
    }

    // Calculate final total including selected vehicle and extras
    const selectedVeh = quote.pricing.vehicles.find((v) => v.id === (quote.selectedVehicleId || "saloon"));
    let basePrice = selectedVeh ? selectedVeh.totalPrice : 45.0;

    let extrasTotal = 0;
    (quote.selectedExtras || []).forEach((extId) => {
      const ext = EXTRA_OPTIONS.find((e) => e.id === extId);
      if (ext) extrasTotal += ext.price;
    });

    const finalAmountGbp = Math.round((basePrice + extrasTotal) * 100) / 100;

    // If Stripe is configured and live keys are set, create a real PaymentIntent
    let stripeClientSecret: string | null = null;
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmountGbp * 100), // in pence
        currency: "gbp",
        metadata: {
          quoteRef: quote.quoteRef,
          from: quote.fromLocation,
          to: quote.toLocation,
          passengerName: passenger?.fullName || "Guest",
        },
      });
      stripeClientSecret = paymentIntent.client_secret;
    }

    // Mark quote as completed
    quoteStore.update(quoteRef, {
      paymentStatus: "completed",
      paidAmount: finalAmountGbp,
      paymentMethod,
    });

    return NextResponse.json({
      status: true,
      quoteRef,
      paidAmount: finalAmountGbp,
      clientSecret: stripeClientSecret,
      message: "Payment processed successfully",
    });
  } catch (error) {
    console.error("quotes/checkout error:", error);
    return NextResponse.json({ status: false, message: "Payment processing failed" }, { status: 500 });
  }
}
