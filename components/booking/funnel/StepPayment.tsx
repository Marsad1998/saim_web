'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Banknote,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { StoredQuote } from '@/lib/quote-store';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeRealPaymentElement from './StripeRealPaymentElement';

interface StepPaymentProps {
  quote: StoredQuote;
  selectedVehicleId: string;
  selectedExtras: string[];
  passengerDetails: any;
  onBack: () => void;
}

export default function StepPayment({
  quote,
  selectedVehicleId,
  selectedExtras,
  passengerDetails,
  onBack,
}: StepPaymentProps) {
  const router = useRouter();
  const { currency, formatPrice } = useApp();

  const vehicleTier = quote.pricing?.vehicles?.find((v: any) => v.id === selectedVehicleId) || quote.pricing?.vehicles?.[0];
  const totalAmount = vehicleTier?.finalPrice || vehicleTier?.totalPrice || 45;

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'stripe_wallet' | 'cash_to_driver'>('stripe_card');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Stripe real element state
  const [isStripeLoading, setIsStripeLoading] = useState(true);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<StripeJS | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Fallback form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(passengerDetails?.fullName || '');

  // Processing & Errors
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch or initialize Stripe PaymentIntent
  useEffect(() => {
    let isMounted = true;
    setIsStripeLoading(true);

    fetch('/api/quotes/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteRef: quote.quoteRef,
        selectedVehicleId,
        selectedExtras,
        currency,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.status && data.configured && data.clientSecret && data.publishableKey) {
          setStripeConfigured(true);
          setClientSecret(data.clientSecret);
          setStripePromise(loadStripe(data.publishableKey));
        } else {
          setStripeConfigured(false);
        }
      })
      .catch((err) => {
        console.warn('Could not initialize live Stripe session, using test mode fallback:', err);
        if (isMounted) setStripeConfigured(false);
      })
      .finally(() => {
        if (isMounted) setIsStripeLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [quote.quoteRef, selectedVehicleId, selectedExtras, currency]);

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const parts = val.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  // Process fallback or wallet or cash submission
  const handleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedTerms) {
      setErrorMessage('Please accept the Terms of Carriage and Privacy Policy to proceed');
      return;
    }

    if (paymentMethod === 'stripe_card') {
      if (!cardName.trim()) {
        setErrorMessage('Please enter name on card');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setErrorMessage('Please enter a valid 16-digit card number');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (cardCvc.length < 3) {
        setErrorMessage('Please enter a valid 3-digit CVC code');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/quotes/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteRef: quote.quoteRef,
          selectedVehicleId,
          selectedExtras,
          passengerDetails,
          totalAmount,
          currency,
          paymentMethod,
          cardLast4: cardNumber.replace(/\s/g, '').slice(-4) || '4242',
        }),
      });

      const data = await res.json();

      if (data.status) {
        router.push(`/booking-confirmation?ref=${quote.quoteRef}`);
      } else {
        setErrorMessage(data.message || 'Payment processing failed. Please verify details.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment checkout error:', err);
      setErrorMessage('An error occurred while confirming your booking. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-ots-yellow">
          <span>Final Step</span>
          <span>•</span>
          <span>Instant Confirmation</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mt-1">
          Step 3: Secure Payment &amp; Confirmation
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Select your preferred payment method. All online payments are encrypted and secured via Stripe.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Option 1: Card via Stripe */}
        <button
          type="button"
          onClick={() => setPaymentMethod('stripe_card')}
          className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
            paymentMethod === 'stripe_card'
              ? 'border-ots-yellow bg-yellow-50/30 shadow-md ring-1 ring-ots-yellow'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${paymentMethod === 'stripe_card' ? 'bg-ots-yellow text-black' : 'bg-gray-100 text-gray-600'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
              Stripe
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-gray-900">Credit / Debit Card</div>
            <div className="text-xs text-gray-500 mt-0.5">Visa, Mastercard, Amex</div>
          </div>
        </button>

        {/* Option 2: Digital Wallets */}
        <button
          type="button"
          onClick={() => setPaymentMethod('stripe_wallet')}
          className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
            paymentMethod === 'stripe_wallet'
              ? 'border-ots-yellow bg-yellow-50/30 shadow-md ring-1 ring-ots-yellow'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${paymentMethod === 'stripe_wallet' ? 'bg-ots-yellow text-black' : 'bg-gray-100 text-gray-600'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0070ba] text-white px-2 py-0.5 rounded">
              Express
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-gray-900">Apple / Google Pay</div>
            <div className="text-xs text-gray-500 mt-0.5">1-Click Fast Checkout</div>
          </div>
        </button>

        {/* Option 3: Pay Cash to Driver */}
        <button
          type="button"
          onClick={() => setPaymentMethod('cash_to_driver')}
          className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
            paymentMethod === 'cash_to_driver'
              ? 'border-ots-yellow bg-yellow-50/30 shadow-md ring-1 ring-ots-yellow'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${paymentMethod === 'cash_to_driver' ? 'bg-ots-yellow text-black' : 'bg-gray-100 text-gray-600'}`}>
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded">
              On Arrival
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-gray-900">Cash to Driver</div>
            <div className="text-xs text-gray-500 mt-0.5">Pay in vehicle upon arrival</div>
          </div>
        </button>
      </div>

      {/* Main Payment Container */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-gray-700">
              End-to-End 256-Bit SSL Encrypted
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Powered by</span>
            <span className="text-black font-extrabold tracking-normal text-sm bg-gray-100 px-2 py-0.5 rounded">
              stripe
            </span>
          </div>
        </div>

        {/* CASE 1: Live Real Stripe Elements (Card + Wallets) */}
        {stripeConfigured && clientSecret && stripePromise && paymentMethod === 'stripe_card' ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Live Stripe payment gateway active. Enter your payment details securely below.</span>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#FFCC00',
                    colorText: '#141720',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <StripeRealPaymentElement
                quoteRef={quote.quoteRef}
                totalAmount={totalAmount}
                passengerDetails={passengerDetails}
                selectedVehicleId={selectedVehicleId}
                selectedExtras={selectedExtras}
                agreedTerms={agreedTerms}
                onSuccess={() => router.push(`/booking-confirmation?ref=${quote.quoteRef}`)}
                onError={(err) => setErrorMessage(err)}
              />
            </Elements>
          </div>
        ) : paymentMethod === 'stripe_wallet' ? (
          /* CASE 2: Apple Pay / Google Pay Express Checkout */
          <div className="space-y-5 py-2">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-ots-yellow font-bold">
                  Express Digital Wallet
                </span>
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full font-mono text-gray-300">
                  Instant Pay
                </span>
              </div>
              <h3 className="text-lg font-bold">Pay with Apple Pay or Google Pay</h3>
              <p className="text-xs text-gray-300">
                Authenticate with Face ID, Touch ID, or your saved Google account. No need to manually type your 16-digit card number.
              </p>
            </div>

            <form onSubmit={handleFallbackSubmit} className="space-y-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-black hover:bg-gray-900 text-white font-extrabold text-base md:text-lg rounded-xl shadow-lg transition-all flex items-center justify-center space-x-3 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-ots-yellow" />
                    <span>Connecting to Digital Wallet...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">Pay</span>
                    <span>/</span>
                    <span className="font-sans font-bold">G Pay</span>
                    <span className="text-sm font-medium text-gray-300">({formatPrice(totalAmount)})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : paymentMethod === 'cash_to_driver' ? (
          /* CASE 3: Cash to Driver on Arrival */
          <div className="space-y-5 py-2">
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Banknote className="w-5 h-5 text-amber-700" />
                <span>Pay In Cash to Your Chauffeur</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                You can pay the full fare of <strong>{formatPrice(totalAmount)}</strong> in cash ({currency}) directly to your allocated driver upon reaching your destination or during meet &amp; greet. A booking voucher with driver coordinates will be sent to your email immediately.
              </p>
            </div>

            <form onSubmit={handleFallbackSubmit} className="space-y-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming Reservation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Booking &amp; Pay Cash on Arrival</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* CASE 4: Card Payment (Stripe Test Sandbox / Fallback Form) */
          <form onSubmit={handleFallbackSubmit} className="space-y-4">
            {/* Informational Sandbox Badge */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Stripe Business Sandbox Active:</span>
                <span className="block text-amber-800 mt-0.5">
                  You can use any test card (e.g. <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">4242 4242 4242 4242</code>) to complete and test reservations. Once your Stripe Secret &amp; Publishable keys are added to <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">.env.local</code>, real live card charges will process automatically.
                </span>
              </div>
            </div>

            {/* Accepted Cards */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-700">Accepted:</span>
                <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-[10px] text-blue-700">VISA</span>
                <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-[10px] text-red-600">MC</span>
                <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-[10px] text-blue-500">AMEX</span>
                <span className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-bold text-[10px] text-gray-700">MAESTRO</span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">Stripe Verified</span>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Name on Card *
                </label>
                <input
                  type="text"
                  placeholder="e.g. JOHN SMITH"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono text-center focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                    Security Code (CVC) *
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono text-center focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Pay Button for Fallback */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed mt-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Payment via Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay &amp; Confirm Booking ({formatPrice(totalAmount)})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Terms and Policies Agreement */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-yellow-500 focus:ring-ots-yellow border-gray-300"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            I agree to the <a href="/terms" target="_blank" className="font-bold text-gray-900 underline">Terms and Conditions</a>, and have read the <a href="/privacy-policy" target="_blank" className="font-bold text-gray-900 underline">Privacy Policy</a>. I understand that cancellations made at least 12 hours prior to pick-up receive a full 100% refund.
          </span>
        </label>
      </div>

      {/* Back Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-sm rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </button>
      </div>
    </div>
  );
}
