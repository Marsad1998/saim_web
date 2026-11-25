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
  Loader2,
  Edit2,
  Building2
} from 'lucide-react';
import { StoredQuote } from '@/lib/quote-store';
import { useApp } from '@/components/context/AppContext';

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quoteRef = searchParams.get('ref') || 'QCM-DEMO123';
  const { formatPrice, siteSettings } = useApp();

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
    <div className="bg-[#f8f9fa] min-h-screen py-6 sm:py-10 md:py-16 overflow-x-hidden w-full print:bg-white print:py-0 print:m-0 print:min-h-0">
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 print:max-w-none print:px-0 print:mx-0 print:w-full">
        
        {/* Success Header (Screen only, hidden on print so voucher fits cleanly on 1 page) */}
        <div className="text-center mb-6 sm:mb-8 print:hidden px-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg animate-bounce-subtle">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Thank you for booking with {siteSettings?.brand_name || 'Quick Car Midlands Ltd'}. A confirmation email with your journey voucher and receipt has been sent to your email address.
          </p>

          {/* Reference pill - fully responsive flex-wrap */}
          <div className="mt-4 sm:mt-5 inline-flex flex-wrap items-center justify-center gap-2 bg-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-gray-200 shadow-sm max-w-full">
            <span className="text-[11px] sm:text-xs uppercase font-bold text-gray-400">Booking Reference:</span>
            <span className="text-sm sm:text-base font-extrabold text-gray-900 font-mono tracking-wider break-all">
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6 sm:mb-8 print:border print:border-gray-300 print:shadow-none print:rounded-xl print:m-0 print-page-break-avoid">
          {/* Card Top Accent (Signature Taxi Yellow/Black Checker) */}
          <div className="taxi-pattern h-2 w-full" />

          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 print:p-6 print:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-5 gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {siteSettings?.logo_light ? (
                    <img
                      src={siteSettings.logo_light}
                      alt={siteSettings.brand_name || "Quick Car Midlands Ltd"}
                      className="h-7 sm:h-8 w-auto object-contain"
                    />
                  ) : null}
                  <span className="text-[11px] sm:text-xs uppercase font-extrabold text-ots-yellow bg-black px-2.5 py-1 rounded print:bg-black print:text-ots-yellow">
                    {siteSettings?.brand_name || "QUICK CAR MIDLANDS"} VOUCHER
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-300 print:bg-gray-100 print:text-black">
                    REF: {quoteRef}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-gray-900">
                  Airport Transfer Itinerary
                </h2>
                <p className="text-xs text-gray-500">
                  Official Passenger Travel Voucher &amp; Dispatch Confirmation
                </p>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-2">
                <div>
                  <span className="text-[11px] sm:text-xs text-gray-400 block font-medium sm:text-right">Payment Status</span>
                  <span className={`inline-flex items-center space-x-1 text-[11px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                    quote?.paymentMethod === 'cash_to_driver'
                      ? 'text-amber-800 bg-amber-50 border-amber-300 print:bg-amber-50 print:text-amber-900'
                      : quote?.paymentMethod === 'pay_by_bank' || quote?.paymentMethod === 'bacs_transfer'
                      ? 'text-indigo-800 bg-indigo-50 border-indigo-300 print:bg-indigo-50 print:text-indigo-900'
                      : 'text-green-700 bg-green-50 border-green-300 print:bg-green-50 print:text-green-900'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                    <span className="truncate max-w-[190px] sm:max-w-none">
                      {quote?.paymentMethod === 'cash_to_driver'
                        ? 'CASH UPON ARRIVAL'
                        : quote?.paymentMethod === 'pay_by_bank' || quote?.paymentMethod === 'bacs_transfer'
                        ? 'PAY BY BANK'
                        : 'PAID & CONFIRMED'}
                    </span>
                  </span>
                </div>
                <div className="text-lg sm:text-2xl font-black text-gray-900 text-right">
                  {formatPrice(quote?.paidAmount || quote?.pricing?.totalPrice || 45)}
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Route &amp; Timings
              </h3>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3 border border-gray-200 print:bg-gray-50 print:border-gray-200">
                <div className="flex items-start space-x-2.5 sm:space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 mt-0.5 print:bg-green-100 print:text-green-800">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase block">Pick-up Location</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 break-words block leading-snug">
                      {quote?.fromLocation || 'London Heathrow Airport (LHR)'}
                    </span>
                  </div>
                </div>

                {quote?.waypoints && quote.waypoints.length > 0 && (
                  <div className="ml-3 pl-3 border-l-2 border-dashed border-gray-300 space-y-1">
                    {quote.waypoints.map((w, i) => (
                      <div key={i} className="text-xs text-gray-600 break-words">
                        Via Stop: <strong>{w}</strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-start space-x-2.5 sm:space-x-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 print:bg-red-100 print:text-red-700">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase block">Drop-off Destination</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 break-words block leading-snug">
                      {quote?.toLocation || 'Central London, UK'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-200 print:bg-gray-50 print:border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Pick-up Date</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1 mt-0.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate">{quote?.pickUpDate || '2026-10-15'}</span>
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-200 print:bg-gray-50 print:border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Pick-up Time</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1 mt-0.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{quote?.pickUpTime || '12:00'}</span>
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-xl border border-gray-200 col-span-2 sm:col-span-1 print:bg-gray-50 print:border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Vehicle Tier</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-1 mt-0.5 truncate">
                    <Car className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="capitalize truncate">{(quote as any)?.vehicleCategory || (quote as any)?.selectedVehicle?.name || quote?.selectedVehicleId || 'Standard Saloon'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Chauffeur & Vehicle Coming Card */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Assigned Chauffeur &amp; Incoming Vehicle
                </h3>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Driver Dispatched</span>
                </span>
              </div>

              <div className="bg-gradient-to-r from-gray-900 via-neutral-900 to-black text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  {/* Driver Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-ots-yellow text-black font-extrabold flex items-center justify-center text-base sm:text-lg flex-shrink-0 shadow-md">
                      {(quote?.assignedDriver?.name || 'C').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm sm:text-base font-bold text-white truncate">
                          {quote?.assignedDriver?.name || 'Private Chauffeur'}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-white/10 text-ots-yellow px-1.5 py-0.5 rounded">
                          {quote?.assignedDriver?.licenseNumber || 'PCO Licensed'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mt-1">
                        {quote?.assignedDriver?.phone && (
                          <a
                            href={`tel:${quote.assignedDriver.phone}`}
                            className="inline-flex items-center space-x-1 text-ots-yellow hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{quote.assignedDriver.phone}</span>
                          </a>
                        )}
                        <span className="hidden xs:inline">•</span>
                        <span className="text-[11px]">Airport Chauffeur</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle License Plate & Model Badge */}
                  <div className="sm:text-right bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-white/10">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Incoming Vehicle
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white block mt-0.5 truncate">
                      {quote?.assignedDriver?.vehicleModel || (quote as any)?.selectedVehicle?.name || 'Executive Vehicle'}
                      {quote?.assignedDriver?.vehicleYear ? ` (${quote.assignedDriver.vehicleYear})` : ''}
                    </span>
                    <div className="mt-1.5 flex flex-wrap items-center sm:justify-end gap-1.5">
                      <span className="font-mono text-xs font-black bg-[#ffdb00] text-black px-2 py-0.5 rounded shadow-sm border border-black/20 tracking-wider">
                        {quote?.assignedDriver?.vehiclePlate || 'LO71 ABC'}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold bg-neutral-800 px-2 py-0.5 rounded capitalize">
                        {quote?.assignedDriver?.vehicleCategory || quote?.selectedVehicleId || 'Saloon'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger & Dispatch Info */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Passenger &amp; Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div className="flex items-center space-x-2 text-gray-700 min-w-0">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Lead Passenger: <strong className="text-gray-900">{quote?.passenger?.fullName || 'John Smith'}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 min-w-0">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Email: <strong className="text-gray-900 break-all">{quote?.passenger?.email || 'customer@example.com'}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 min-w-0">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Contact Phone: <strong className="text-gray-900">{quote?.passenger?.phone || '+44 7123 456789'}</strong></span>
                </div>
                {quote?.passenger?.flightNumber && (
                  <div className="flex items-center space-x-2 text-gray-700 min-w-0">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                      Flight: <strong className="text-gray-900">{quote.passenger.flightNumber}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Bank Transfer Settlement Details (if Pay by Bank) */}
            {(quote?.paymentMethod === 'pay_by_bank' || quote?.paymentMethod === 'bacs_transfer') && (
              <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-xl p-3.5 sm:p-4 text-xs space-y-3 print:bg-indigo-50 print:border-indigo-300">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-indigo-950 flex items-center space-x-1.5 text-xs sm:text-sm">
                    <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Direct Bank Transfer Details (Faster Payments):</span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded-full">
                    Awaiting Faster Payment
                  </span>
                </div>
                <p className="text-indigo-900 text-[11px] leading-relaxed">
                  Please complete your transfer via your mobile banking app using the details below. Our operations desk will match your payment reference automatically.
                </p>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Payee</span>
                    <strong className="text-gray-900 text-xs block truncate">{siteSettings?.account_name || 'QUICK CAR MIDLANDS LTD'}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Sort Code</span>
                    <strong className="text-gray-900 text-xs font-mono block">{siteSettings?.sort_code || '82-19-74'}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Account No.</span>
                    <strong className="text-gray-900 text-xs font-mono block">{siteSettings?.account_number || '50470328'}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Reference</span>
                    <strong className="text-indigo-700 text-xs font-mono block truncate">{quoteRef}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 sm:col-span-2 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">Bank / Institution</span>
                    <strong className="text-gray-900 text-xs block truncate">{siteSettings?.bank_name || 'Clydesdale Bank / Virgin Money UK'}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100 sm:col-span-2 min-w-0">
                    <span className="text-[10px] text-gray-500 uppercase font-semibold block">IBAN</span>
                    <strong className="text-gray-900 text-[11px] sm:text-xs font-mono block break-all">{siteSettings?.iban || 'GB91CLYD82197450470328'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Airport Instructions Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 text-xs text-gray-800 space-y-2 print:bg-amber-50 print:border-amber-300">
              <div className="font-bold text-gray-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Driver Meeting Instructions:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-[11px] sm:text-xs leading-relaxed">
                <li>Your driver will wait inside the arrivals hall holding a personalized name board with your name.</li>
                <li>We monitor inbound flight radar live and include 45 minutes of free waiting time from touchdown.</li>
                <li>You will receive an SMS and WhatsApp with the driver&apos;s direct mobile number and vehicle registration prior to arrival.</li>
              </ul>
            </div>

            {/* Official Travel Voucher Footer */}
            <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2 print:text-gray-600">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-center sm:text-left">
                <span><strong>Office:</strong> {siteSettings?.support_phone || '0121 243 3112'}</span>
                <span className="hidden sm:inline">•</span>
                <span><strong>Tel / Mobile:</strong> {siteSettings?.emergency_whatsapp || '00447892609314'}</span>
                <span className="hidden sm:inline">•</span>
                <span className="break-all"><strong>Email:</strong> {siteSettings?.support_email || 'qcm023@gmail.com'}</span>
              </div>
              <div className="text-gray-400 print:text-gray-500 text-[10px] text-center sm:text-right">
                {siteSettings?.brand_name || 'Quick Car Midlands Ltd'} • Licensed UK Private Hire Operator
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <Link
            href="/"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center space-x-2 text-center"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>Return to Homepage</span>
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <Link
              href={`/manage-booking?ref=${encodeURIComponent(quoteRef)}&email=${encodeURIComponent(quote?.passenger?.email || '')}`}
              className="w-full sm:w-auto px-4 sm:px-5 py-3 border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center space-x-2 text-center"
            >
              <Edit2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span>Manage / Modify Booking</span>
            </Link>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 text-center"
            >
              <Printer className="w-4 h-4 flex-shrink-0" />
              <span>Print / Save Voucher</span>
            </button>
          </div>
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
