'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Printer, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Mail, 
  Phone, 
  Download, 
  Home, 
  ShieldCheck, 
  Copy, 
  Check,
  Loader2
} from 'lucide-react';
import { StoredQuote } from '@/lib/quote-store';
import { useApp } from '@/components/context/AppContext';

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteRef = searchParams.get('ref') || 'OTS-DEMO123';
  const { formatPrice } = useApp();

  const [quote, setQuote] = useState<StoredQuote | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadQuote() {
      try {
        const res = await fetch(`/api/quotes/${quoteRef}`);
        const data = await res.json();
        if (data.status && data.quote) {
          setQuote(data.quote);
        }
      } catch (e) {
        console.error('Error fetching confirmed quote:', e);
      }
    }

    if (quoteRef) {
      loadQuote();
    }
  }, [quoteRef]);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(quoteRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-subtle">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
            Thank you for booking with OTS Taxi. A confirmation email with your journey voucher and receipt has been sent to your email address.
          </p>

          {/* Reference pill */}
          <div className="mt-5 inline-flex items-center space-x-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-400">Booking Reference:</span>
            <span className="text-base font-extrabold text-gray-900 font-mono tracking-wider">
              {quoteRef}
            </span>
            <button
              onClick={handleCopyRef}
              className="text-gray-400 hover:text-black p-1 transition-colors"
              title="Copy Reference"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Voucher Print Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8 print:border-none print:shadow-none">
          {/* Card Top Accent */}
          <div className="taxi-pattern h-2 w-full" />

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-5 gap-3">
              <div>
                <span className="text-xs uppercase font-extrabold text-ots-yellow bg-black px-2.5 py-1 rounded">
                  OTS TAXI VOUCHER
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">
                  Airport Transfer Itinerary
                </h2>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-gray-400 block">Payment Status</span>
                <span className="inline-flex items-center space-x-1 text-xs font-extrabold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PAID &amp; CONFIRMED</span>
                </span>
              </div>
            </div>

            {/* Journey Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Route &amp; Timings
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Pick-up Location</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {quote?.fromLocation || 'London Heathrow Airport (LHR)'}
                    </span>
                  </div>
                </div>

                {quote?.waypoints && quote.waypoints.length > 0 && (
                  <div className="ml-3 pl-3 border-l-2 border-dashed border-gray-300 space-y-1">
                    {quote.waypoints.map((w, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        Via Stop: <strong>{w}</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Drop-off Destination</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {quote?.toLocation || 'Central London, UK'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Pick-up Date</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>{quote?.pickUpDate || '2026-10-15'}</span>
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Pick-up Time</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>{quote?.pickUpTime || '12:00'}</span>
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Vehicle Tier</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1 mt-0.5">
                    <Car className="w-3.5 h-3.5 text-gray-500" />
                    <span>Standard Saloon</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger & Dispatch Info */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Passenger &amp; Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Lead Passenger: <strong>{quote?.passenger?.fullName || 'John Smith'}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>Email: <strong>{quote?.passenger?.email || 'customer@example.com'}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>Contact Phone: <strong>{quote?.passenger?.phone || '+44 7123 456789'}</strong></span>
                </div>
                {quote?.passenger?.flightNumber && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Flight: {quote.passenger.flightNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Airport Instructions Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-gray-800 space-y-2">
              <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Driver Meeting Instructions:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Your driver will wait inside the arrivals hall holding a personalized name board with your name.</li>
                <li>We monitor inbound flight radar live and include 45 minutes of free waiting time from touchdown.</li>
                <li>You will receive an SMS and WhatsApp with the driver&apos;s direct mobile number and vehicle registration prior to arrival.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Booking Voucher</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-ots-yellow animate-spin" />
          <p className="text-sm font-medium text-gray-600">Loading booking voucher...</p>
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
