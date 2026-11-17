import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingModel } from "@/models/Booking";
import { dbQuery } from "@/lib/db";
import { sendBookingConfirmationEmail, sendAdminBookingAlertEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe =
  stripeSecretKey && stripeSecretKey !== "sk_test_sample_key"
    ? new Stripe(stripeSecretKey, { apiVersion: "2024-09-30.acacia" as any })
    : null;

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    // 1. Verify webhook signature if live Stripe credentials are provided
    if (stripe && webhookSecret && webhookSecret !== "whsec_sample_key" && signature) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error("❌ Stripe Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // Test mode / sample keys fallback
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
      }
    }

    console.log(`🔔 Stripe Webhook received: [${event.type}]`);

    // 2. Handle specific Stripe events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const quoteRef = paymentIntent.metadata?.quoteRef;
        const amountReceived = paymentIntent.amount_received
          ? paymentIntent.amount_received / 100
          : 0;

        if (quoteRef) {
          console.log(`💳 Payment succeeded for Quote: ${quoteRef} (£${amountReceived})`);
          await BookingModel.markPaymentCompleted(quoteRef, {
            paidAmount: amountReceived,
            paymentMethod: "stripe_card",
            stripePaymentId: paymentIntent.id,
          });

          // Trigger automated confirmation email
          const booking = await BookingModel.getByRef(quoteRef);
          if (booking) {
            sendBookingConfirmationEmail(booking).catch((e) => console.error("Email error:", e));
            sendAdminBookingAlertEmail(booking).catch((e) => console.error("Admin email error:", e));
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const quoteRef = paymentIntent.metadata?.quoteRef;
        const errorMessage = paymentIntent.last_payment_error?.message || "Payment declined";

        if (quoteRef) {
          console.warn(`⚠️ Payment failed for Quote ${quoteRef}: ${errorMessage}`);
          await dbQuery(
            "UPDATE bookings SET special_notes = CONCAT(COALESCE(special_notes, ''), '\n[Payment Failed: ', ?) WHERE quote_ref = ?",
            [errorMessage, quoteRef]
          );
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;

        if (paymentIntentId) {
          console.log(`↩️ Refund processed for PaymentIntent: ${paymentIntentId}`);
          await dbQuery(
            `UPDATE bookings 
             SET payment_status = 'refunded', booking_status = 'cancelled'
             WHERE stripe_payment_id = ?`,
            [paymentIntentId]
          );
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook handler error:", error.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
