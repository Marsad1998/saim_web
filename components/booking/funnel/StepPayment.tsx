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
  Info,
  Landmark,
  Building2,
  Copy,
  Check,
  ExternalLink
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
  const { currency, formatPrice, siteSettings } = useApp();

  const vehicleTier = quote.pricing?.vehicles?.find((v: any) => v.id === selectedVehicleId) || quote.pricing?.vehicles?.[0];
  const totalAmount = vehicleTier?.finalPrice || vehicleTier?.totalPrice || 45;

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'pay_by_bank' | 'stripe_card' | 'stripe_wallet' | 'cash_to_driver'>('pay_by_bank');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Option 1: Pay by Bank App (Open Banking / Faster Payments) */}
        <button
          type="button"
          onClick={() => setPaymentMethod('pay_by_bank')}
          className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
            paymentMethod === 'pay_by_bank'
              ? 'border-ots-yellow bg-yellow-50/30 shadow-md ring-1 ring-ots-yellow'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${paymentMethod === 'pay_by_bank' ? 'bg-ots-yellow text-black' : 'bg-gray-100 text-gray-600'}`}>
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-900 text-white px-2 py-0.5 rounded">
              Direct Bank
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-gray-900">Pay by Bank App</div>
            <div className="text-xs text-gray-500 mt-0.5">Instant Faster Payments</div>
          </div>
        </button>

        {/* Option 2: Card via Stripe */}
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

        {/* Option 3: Digital Wallets */}
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

        {/* Option 4: Pay Cash to Driver */}
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

        {/* CASE 0: Instant UK Bank Transfer / Open Banking Faster Payments */}
        {paymentMethod === 'pay_by_bank' ? (
          <div className="space-y-5 py-1">
            {/* Trust & UK Open Banking Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl space-y-3 shadow-md border border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs uppercase tracking-wider text-ots-yellow font-extrabold flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-ots-yellow" />
                  <span>UK Open Banking &amp; Faster Payments</span>
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Direct Settlement • 0% Surcharge
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                Direct UK Bank Transfer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Send your fare directly from your UK mobile banking app (Barclays, Monzo, Lloyds, NatWest, HSBC, Halifax, Santander, Revolut, etc.) to <strong>{siteSettings?.account_name || 'QUICK CAR MIDLANDS LTD'}</strong>. Funds transfer in seconds via UK Faster Payments.
              </p>

              {/* Supported UK Banks Badges */}
              <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-300">
                <span className="px-2 py-0.5 bg-white/10 rounded-md">Barclays</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">Lloyds Bank</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">Monzo</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">NatWest</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">HSBC UK</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">Halifax</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">Santander</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">Revolut</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-md">Virgin Money</span>
              </div>
            </div>

            {/* Official Beneficiary Bank Account Details Card */}
            <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Official Beneficiary Bank Account Details
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allDetails = `Beneficiary: ${siteSettings?.account_name || 'QUICK CAR MIDLANDS LTD'}\nBank: ${siteSettings?.bank_name || 'Clydesdale Bank / Virgin Money UK'}\nSort Code: ${siteSettings?.sort_code || '82-19-74'}\nAccount Number: ${siteSettings?.account_number || '50470328'}\nIBAN: ${siteSettings?.iban || 'GB91CLYD82197450470328'}\nBIC: ${siteSettings?.bic || 'CLYDGB21974'}\nReference: ${quote.quoteRef}\nAmount: ${formatPrice(totalAmount)}`;
                    handleCopy(allDetails, 'all');
                  }}
                  className="text-[11px] font-bold text-amber-900 hover:text-black bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                >
                  {copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'all' ? 'All Details Copied!' : 'Copy All Details'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* Account Name */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Name / Payee</span>
                    <span className="text-xs font-black text-slate-900">{siteSettings?.account_name || 'QUICK CAR MIDLANDS LTD'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(siteSettings?.account_name || 'QUICK CAR MIDLANDS LTD', 'name')}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                    title="Copy Name"
                  >
                    {copiedField === 'name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Bank Name */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank / Institution</span>
                    <span className="text-xs font-bold text-slate-900">{siteSettings?.bank_name || 'Clydesdale Bank / Virgin Money UK'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">UK Clearing</span>
                </div>

                {/* Account Type */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Type</span>
                    <span className="text-xs font-bold text-slate-900">{siteSettings?.account_type || 'Business'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Commercial</span>
                </div>

                {/* Sort Code */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sort Code</span>
                    <span className="text-sm font-black font-mono text-slate-900 tracking-wider">{siteSettings?.sort_code || '82-19-74'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(siteSettings?.sort_code || '82-19-74', 'sort_code')}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                    title="Copy Sort Code"
                  >
                    {copiedField === 'sort_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Account Number */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
                    <span className="text-sm font-black font-mono text-slate-900 tracking-wider">{siteSettings?.account_number || '50470328'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(siteSettings?.account_number || '50470328', 'account_number')}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                    title="Copy Account Number"
                  >
                    {copiedField === 'account_number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Exact Amount */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exact Fare Due</span>
                    <span className="text-sm font-black text-emerald-700">{formatPrice(totalAmount)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(totalAmount), 'amount')}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                    title="Copy Amount"
                  >
                    {copiedField === 'amount' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* IBAN */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs sm:col-span-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">IBAN (International / EU Transfers)</span>
                    <span className="text-xs font-bold font-mono text-slate-900">{siteSettings?.iban || 'GB91CLYD82197450470328'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(siteSettings?.iban || 'GB91CLYD82197450470328', 'iban')}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                    title="Copy IBAN"
                  >
                    {copiedField === 'iban' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* BIC */}
                <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">BIC / SWIFT</span>
                    <span className="text-xs font-bold font-mono text-slate-900">{siteSettings?.bic || 'CLYDGB21974'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(siteSettings?.bic || 'CLYDGB21974', 'bic')}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                    title="Copy BIC"
                  >
                    {copiedField === 'bic' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Crucial Reference Callout */}
              <div className="bg-amber-100/80 border-2 border-dashed border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 block">
                    Payment Reference (Mandatory)
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 tracking-wider">
                    {quote.quoteRef}
                  </span>
                  <p className="text-[11px] text-amber-900">
                    Please paste this Quote Ref into your banking app reference field so our automated accounting reconciles your payment immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(quote.quoteRef, 'ref')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 shrink-0 shadow"
                >
                  {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-ots-yellow" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'ref' ? 'Reference Copied!' : 'Copy Reference'}</span>
                </button>
              </div>
            </div>

            {/* Confirmation CTA */}
            <form onSubmit={handleFallbackSubmit} className="space-y-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-ots-yellow" />
                    <span>Confirming Bank Transfer Reservation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-ots-yellow" />
                    <span>Confirm Booking &amp; Pay by Bank Transfer ({formatPrice(totalAmount)})</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500">
                Clicking confirm secures your chauffeur reservation immediately. An official digital voucher with your driver details and full payment invoice will be dispatched to your email.
              </p>
            </form>
          </div>
        ) : stripeConfigured && clientSecret && stripePromise && paymentMethod === 'stripe_card' ? (
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
                className="w-full py-3.5 sm:py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-base rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                    <span className="whitespace-nowrap">Confirming Reservation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Confirm Booking (Pay Cash on Arrival)</span>
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
              className="w-full py-3.5 sm:py-4 px-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed mt-4 whitespace-nowrap"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                  <span className="whitespace-nowrap">Processing Payment via Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Pay &amp; Confirm Booking ({formatPrice(totalAmount)})</span>
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
          className="px-4 sm:px-6 py-2.5 sm:py-3.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center space-x-1.5 sm:space-x-2 disabled:opacity-50 whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Back to Details</span>
        </button>
      </div>
    </div>
  );
}
