"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { useApp } from "@/components/context/AppContext";

interface StripeRealPaymentElementProps {
  quoteRef: string;
  totalAmount: number;
  passengerDetails: any;
  selectedVehicleId: string;
  selectedExtras: string[];
  agreedTerms: boolean;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function StripeRealPaymentElement({
  quoteRef,
  totalAmount,
  passengerDetails,
  selectedVehicleId,
  selectedExtras,
  agreedTerms,
  onSuccess,
  onError,
}: StripeRealPaymentElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { currency, formatPrice } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedTerms) {
      setErrorMessage("Please accept the Terms of Carriage and Privacy Policy to proceed");
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const returnUrl = `${window.location.origin}/booking-confirmation?ref=${quoteRef}`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              name: passengerDetails?.fullName || "Valued Passenger",
              email: passengerDetails?.email,
              phone: passengerDetails?.phone,
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment authorization failed");
        onError(error.message || "Payment authorization failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
        // Complete checkout in backend
        await fetch("/api/quotes/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteRef,
            paymentMethod: "stripe_card",
            paymentIntentId: paymentIntent.id,
            passengerDetails,
            selectedVehicleId,
            selectedExtras,
            totalAmount,
            currency,
          }),
        });

        onSuccess();
      }
    } catch (err: any) {
      console.error("Stripe confirm error:", err);
      setErrorMessage(err.message || "Unexpected payment error occurred");
      onError(err.message || "Unexpected payment error");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: {
              applePay: "auto",
              googlePay: "auto",
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base md:text-lg rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Authorizing Payment via Stripe...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay &amp; Confirm Booking ({formatPrice(totalAmount)})</span>
          </>
        )}
      </button>
    </form>
  );
}
