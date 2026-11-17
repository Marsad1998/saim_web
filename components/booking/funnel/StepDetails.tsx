'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Plane, 
  Clock, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { StoredQuote } from '@/lib/quote-store';
import { useApp } from '@/components/context/AppContext';

interface StepDetailsProps {
  quote: StoredQuote;
  onBack: () => void;
  onNext: (details: any) => void;
  initialData?: any;
}

export default function StepDetails({
  quote,
  onBack,
  onNext,
  initialData = {},
}: StepDetailsProps) {
  const { user } = useApp();
  const safeData = initialData || {};

  const [fullName, setFullName] = useState(safeData.fullName || user?.name || '');
  const [email, setEmail] = useState(safeData.email || user?.email || '');
  const [phoneCountry, setPhoneCountry] = useState(safeData.phoneCountry || '+44');
  const [phone, setPhone] = useState(safeData.phone || user?.phone || '');
  const [flightNumber, setFlightNumber] = useState(safeData.flightNumber || '');
  const [terminal, setTerminal] = useState(safeData.terminal || '');
  const [pickupBufferMinutes, setPickupBufferMinutes] = useState(safeData.pickupBufferMinutes || 45);
  const [specialNotes, setSpecialNotes] = useState(safeData.specialNotes || '');
  
  // Return flight if return journey
  const [returnFlightNumber, setReturnFlightNumber] = useState(safeData.returnFlightNumber || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isAirportPickup = Boolean(quote?.fromLocation?.toLowerCase()?.includes('airport'));
  const isAirportDropoff = Boolean(quote?.toLocation?.toLowerCase()?.includes('airport'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter lead passenger full name';
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Please enter a contact phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext({
      fullName,
      email,
      phone: `${phoneCountry} ${phone.trim()}`,
      flightNumber,
      terminal,
      pickupBufferMinutes,
      specialNotes,
      returnFlightNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Step 2: Passenger &amp; Journey Details
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Please provide the lead passenger contact details for driver dispatch and live updates.
        </p>
      </div>

      {/* Passenger details card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <User className="w-5 h-5 text-ots-yellow" />
          <span>Lead Passenger Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none ${
                  errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Email Address (for Booking Voucher) *
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Phone with dial code */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Mobile Phone Number (for Driver SMS &amp; WhatsApp) *
            </label>
            <div className="flex space-x-2">
              <select
                value={phoneCountry}
                onChange={(e) => setPhoneCountry(e.target.value)}
                className="w-28 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              >
                <option value="+44">🇬🇧 +44 (UK)</option>
                <option value="+1">🇺🇸 +1 (US)</option>
                <option value="+33">🇫🇷 +33 (FR)</option>
                <option value="+49">🇩🇪 +49 (DE)</option>
                <option value="+39">🇮🇹 +39 (IT)</option>
                <option value="+34">🇪🇸 +34 (ES)</option>
                <option value="+353">🇮🇪 +353 (IE)</option>
                <option value="+971">🇦🇪 +971 (UAE)</option>
                <option value="+91">🇮🇳 +91 (IN)</option>
                <option value="+61">🇦🇺 +61 (AU)</option>
              </select>
              <input
                type="tel"
                placeholder="7123 456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`flex-1 px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none ${
                  errors.phone ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Flight Tracking Details (Shown especially if airport route) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <Plane className="w-5 h-5 text-ots-yellow" />
          <span>Flight &amp; Airport Coordination</span>
        </h3>
        <p className="text-xs text-gray-500">
          Providing your flight number enables free live tracking so your driver adjusts automatically if your plane is delayed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Flight Number */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Inbound Flight Number
            </label>
            <input
              type="text"
              placeholder="e.g. BA123 / EK007"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none font-mono"
            />
          </div>

          {/* Terminal */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Arrival Terminal (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Terminal 2, North..."
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            />
          </div>

          {/* Buffer time */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Pick-up Buffer Time
            </label>
            <select
              value={pickupBufferMinutes}
              onChange={(e) => setPickupBufferMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            >
              <option value={15}>15 mins after landing (Hand luggage)</option>
              <option value={30}>30 mins after landing (Standard)</option>
              <option value={45}>45 mins after landing (Checked luggage)</option>
              <option value={60}>60 mins after landing (International)</option>
              <option value={90}>90 mins after landing (Extra buffer)</option>
            </select>
          </div>
        </div>

        {/* Return flight if return journey */}
        {quote.bookReturn && (
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Outbound Return Flight Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. BA456"
              value={returnFlightNumber}
              onChange={(e) => setReturnFlightNumber(e.target.value.toUpperCase())}
              className="w-full max-w-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none font-mono"
            />
          </div>
        )}
      </div>

      {/* Special Requests / Driver notes */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-3">
        <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-ots-yellow" />
          <span>Special Requirements or Driver Notes</span>
        </h3>
        <textarea
          rows={3}
          placeholder="Any special instructions for the driver (e.g. oversized bags, wheelchair assistance, baby pram, specific gate)..."
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-sm rounded-xl transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vehicles</span>
        </button>

        <button
          type="submit"
          className="px-8 py-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center space-x-2"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
