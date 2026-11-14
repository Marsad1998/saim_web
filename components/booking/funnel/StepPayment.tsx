'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { StoredQuote } from '@/lib/quote-store';

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
  const { formatPrice } = useApp();

  const vehicleTier = quote.pricing?.vehicles?.find(v => v.id === selectedVehicleId) || quote.pricing?.vehicles?.[0];
  const totalAmount = vehicleTier?.finalPrice || 0;

  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(passengerDetails?.fullName || '');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formatting helpers
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

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreedTerms) {
      setErrorMessage('Please accept the Terms of Carriage and Privacy Policy to proceed');
      return;
    }

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
      setErrorMessage('Please enter a valid 3-digit CVC security code');
      return;
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
          cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
        }),
      });

      const data = await res.json();

      if (data.status) {
        router.push(`/booking-confirmation?ref=${quote.quoteRef}`);
      } else {
        setErrorMessage(data.message || 'Payment authorization failed. Please verify card details.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment checkout error:', err);
      setErrorMessage('An error occurred during payment processing. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Step 3: Secure Payment &amp; Confirmation
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Complete your payment securely with Stripe. Your booking is confirmed instantly.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payment Method Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-ots-yellow" />
            <h3 className="text-base font-bold text-gray-900">Credit or Debit Card</h3>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5 text-green-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Accepted cards banner */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-600">
          <span>We accept Visa, Mastercard, American Express &amp; Apple Pay</span>
          <div className="font-bold text-gray-800 tracking-wider">STRIPE SECURE</div>
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
                placeholder="4000 1234 5678 9010"
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
                placeholder="MM/YY"
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
      </div>

      {/* Terms and Policies */}
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

      {/* Navigation Buttons */}
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

        <button
          type="submit"
          disabled={isProcessing}
          className="px-8 py-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Pay &amp; Confirm Booking ({formatPrice(totalAmount)})</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
