import { NextResponse } from "next/server";
import { quoteStore } from "@/lib/quote-store";
import { EXTRA_OPTIONS } from "@/lib/pricing-engine";
import { getStripeServer, getStripePublishableKey } from "@/lib/stripe";
import { CurrencyCode, convertFromGbp } from "@/lib/currency";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quoteRef, selectedVehicleId, selectedExtras = [], currency: requestedCurrency } = body;

    if (!quoteRef) {
      return NextResponse.json({ status: false, message: "quoteRef is required" }, { status: 400 });
    }

    const quote = await quoteStore.get(quoteRef);
    if (!quote) {
      return NextResponse.json({ status: false, message: "Quote not found" }, { status: 404 });
    }

    // Determine chosen vehicle & total price
    const vehId = selectedVehicleId || quote.selectedVehicleId || "saloon";
    const selectedVeh = quote.pricing?.vehicles?.find((v: any) => v.id === vehId) || quote.pricing?.vehicles?.[0];
    const basePrice = selectedVeh?.finalPrice || selectedVeh?.totalPrice || 45.0;

    let extrasTotal = 0;
    const extrasList = selectedExtras.length > 0 ? selectedExtras : (quote.selectedExtras || []);
    extrasList.forEach((extId: string) => {
      const ext = EXTRA_OPTIONS.find((e) => e.id === extId);
      if (ext) extrasTotal += ext.price;
    });

    const totalGbp = Math.round((basePrice + extrasTotal) * 100) / 100;
    const targetCurrency = (requestedCurrency || quote.currency || "GBP").toUpperCase() as CurrencyCode;
    const finalAmount = convertFromGbp(totalGbp, targetCurrency);
    const stripeCurrency = targetCurrency.toLowerCase();

    // Check if Stripe is live/configured
    const stripe = getStripeServer();
    const pubKey = getStripePublishableKey();

    if (stripe && pubKey) {
      try {
        const settings = await getSystemSettings();
        const brandName = settings.brand_name || "Quick Car Midlands Ltd";

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(finalAmount * 100), // in smallest currency unit (pence/cents)
          currency: stripeCurrency,
          automatic_payment_methods: {
            enabled: true,
          },
          description: `${brandName} Booking Transfer - Ref: ${quote.quoteRef}`,
          metadata: {
            quoteRef: quote.quoteRef,
            from: quote.fromLocation,
            to: quote.toLocation,
            passengerName: quote.passenger?.fullName || "Guest Passenger",
            passengerEmail: quote.passenger?.email || "",
            vehicle: selectedVeh?.name || vehId,
            currency: targetCurrency,
          },
        });

        return NextResponse.json({
          status: true,
          configured: true,
          publishableKey: pubKey,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: finalAmount,
          currency: targetCurrency,
        });
      } catch (stripeErr: any) {
        console.error("Stripe create-payment-intent API error:", stripeErr.message);
        // Fall back gracefully to mock mode if Stripe throws e.g. invalid key
        return NextResponse.json({
          status: true,
          configured: false,
          amount: finalAmount,
          currency: targetCurrency,
          fallbackReason: stripeErr.message,
        });
      }
    }

    // Fallback mode when keys are test placeholders or not set yet
    return NextResponse.json({
      status: true,
      configured: false,
      amount: finalAmount,
      currency: targetCurrency,
      message: "Stripe test mode active",
    });
  } catch (error: any) {
    console.error("create-payment-intent route error:", error);
    return NextResponse.json({ status: false, message: error.message || "Failed to create payment session" }, { status: 500 });
  }
}
