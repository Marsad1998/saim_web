'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  Mail,
  Phone,
  Plane,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  ArrowRight,
  Loader2,
  Printer,
  ChevronLeft,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

function ManageBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { siteSettings, formatPrice } = useApp();

  const initialRef = searchParams.get('ref') || '';
  const initialEmail = searchParams.get('email') || '';

  // Lookup state
  const [quoteRef, setQuoteRef] = useState(initialRef);
  const [email, setEmail] = useState(initialEmail);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Loaded booking state
  const [booking, setBooking] = useState<any | null>(null);

  // Modify modal state
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [modifyError, setModifyError] = useState<string | null>(null);
  const [modifySuccess, setModifySuccess] = useState<string | null>(null);
  const [modifyForm, setModifyForm] = useState({
    pickup_date: '',
    pickup_time: '',
    passengers: 1,
    suitcases: 2,
    selected_vehicle_id: 'saloon',
    passenger_name: '',
    passenger_phone: '',
    flight_number: '',
    terminal: '',
    special_notes: '',
  });

  // Cancel modal state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const vehicleOptions = [
    { id: 'saloon', name: 'Standard Saloon (4 Seats, 2 Bags)' },
    { id: 'estate', name: 'Estate Car (4 Seats, 4 Bags)' },
    { id: 'executive-saloon', name: 'Executive Saloon (3 Seats, 2 Bags)' },
    { id: 'mpv', name: 'MPV 5-6 Seater (6 Seats, 4 Bags)' },
    { id: 'minibus-8', name: 'Minibus 8-9 Seater (8 Seats, 8 Bags)' },
  ];

  const fetchBooking = async (ref: string, em: string) => {
    if (!ref.trim()) {
      setSearchError('Please provide a valid Booking Reference');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setBooking(null);

    try {
      const url = `/api/account/my-bookings/${encodeURIComponent(ref.trim())}${
        em.trim() ? `?email=${encodeURIComponent(em.trim())}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status && data.booking) {
        setBooking(data.booking);
        setHasSearched(true);
        // Pre-fill modify form
        setModifyForm({
          pickup_date: data.booking.pickup_date || '',
          pickup_time: data.booking.pickup_time || '',
          passengers: data.booking.passengers || 1,
          suitcases: data.booking.suitcases || 2,
          selected_vehicle_id: data.booking.selected_vehicle_id || 'saloon',
          passenger_name: data.booking.passenger_name || '',
          passenger_phone: data.booking.passenger_phone || '',
          flight_number: data.booking.flight_number || '',
          terminal: data.booking.terminal || '',
          special_notes: data.booking.special_notes || '',
        });
      } else {
        setSearchError(data.message || 'Booking not found. Please verify your reference and email address.');
        setHasSearched(true);
      }
    } catch (err: any) {
      setSearchError('Network error connecting to booking service. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchBooking(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooking(quoteRef, email);
  };

  const handleModifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setIsModifying(true);
    setModifyError(null);
    setModifySuccess(null);

    try {
      const res = await fetch(`/api/account/my-bookings/${booking.quote_ref}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'modify',
          email: booking.passenger_email || email,
          ...modifyForm,
        }),
      });

      const data = await res.json();
      if (data.status && data.booking) {
        setBooking(data.booking);
        setModifySuccess('Your journey has been updated successfully! Confirmation sent to your email.');
        setTimeout(() => {
          setIsModifyOpen(false);
          setModifySuccess(null);
        }, 1800);
      } else {
        setModifyError(data.message || 'Failed to update booking');
      }
    } catch (err) {
      setModifyError('Network error while saving modifications.');
    } finally {
      setIsModifying(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!booking) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/account/my-bookings/${booking.quote_ref}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          email: booking.passenger_email || email,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setBooking({ ...booking, booking_status: 'cancelled', payment_status: data.refundEligible ? 'refunded' : booking.payment_status });
        setCancelSuccess(data.refundEligible 
          ? 'Booking successfully cancelled. A full refund has been initiated to your original payment method.'
          : 'Booking cancelled. Operations team notified.');
        setTimeout(() => {
          setIsCancelOpen(false);
          setCancelSuccess(null);
        }, 2200);
      } else {
        setCancelError(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      setCancelError('Network error while processing cancellation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'assigned':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase tracking-wider">Confirmed</span>;
      case 'in_progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs uppercase tracking-wider">In Progress</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-xs uppercase tracking-wider">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold text-xs uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs uppercase tracking-wider">{status}</span>;
    }
  };

  // Check 24 hour threshold for cancellation policy notice
  let hoursUntilPickup = 999;
  if (booking?.pickup_date && booking?.pickup_time) {
    try {
      const pickupTime = new Date(`${booking.pickup_date}T${booking.pickup_time}`);
      hoursUntilPickup = (pickupTime.getTime() - Date.now()) / (1000 * 60 * 60);
    } catch (e) {}
  }
  const isRefundEligible = hoursUntilPickup >= 24;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-black transition">
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link href="/account/login" className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            Chauffeur &amp; Customer Portal Login &rarr;
          </Link>
        </div>

        {/* Title Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-ots-yellow bg-black px-3 py-1 rounded inline-block mb-3">
            Self-Serve Passenger Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Manage Your Booking
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
            View your journey details, make schedule or vehicle modifications, or cancel your booking with instant confirmation.
          </p>
        </div>

        {/* Search / Lookup Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  Booking Reference Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. OTS-2026-XXXX or REF123"
                    value={quoteRef}
                    onChange={(e) => setQuoteRef(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black font-mono font-bold text-gray-900 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  Lead Passenger Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="passenger@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-gray-900"
                  />
                </div>
              </div>
            </div>

            {searchError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto px-6 py-3 bg-black hover:bg-neutral-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-ots-yellow" />
                    <span>Searching Booking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-ots-yellow" />
                    <span>Retrieve Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loaded Booking Details Display */}
        {booking && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-10 transition-all animate-fade-in">
            {/* Top Accent Bar */}
            <div className="taxi-pattern h-2 w-full" />

            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Header: Ref, Status, Price */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-5 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-extrabold bg-gray-100 text-gray-900 px-3 py-1 rounded-lg border border-gray-300">
                      {booking.quote_ref}
                    </span>
                    {getStatusBadge(booking.booking_status)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-2">
                    Airport Transfer Itinerary
                  </h2>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-gray-400 block font-medium">Total Fare</span>
                  <div className="text-2xl font-black text-gray-900">
                    {formatPrice(booking.total_price)}
                  </div>
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                    booking.payment_status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : booking.payment_status === 'refunded'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    Payment: {booking.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Journey Route & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Schedule &amp; Timings
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-800">
                    <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Date: <strong>{booking.pickup_date}</strong></span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-800">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Time: <strong>{booking.pickup_time}</strong></span>
                  </div>
                  {booking.flight_number && (
                    <div className="flex items-center space-x-3 text-sm text-gray-800">
                      <Plane className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>Flight No: <strong className="font-mono">{booking.flight_number}</strong> {booking.terminal ? `(Terminal ${booking.terminal})` : ''}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Vehicle &amp; Party
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-800">
                    <Car className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Vehicle Class: <strong className="capitalize">{booking.selected_vehicle_id}</strong></span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-800">
                    <User className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Passengers: <strong>{booking.passengers} Pax</strong> / Suitcases: <strong>{booking.suitcases || 2} Bags</strong></span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-800">
                    <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Passenger: <strong>{booking.passenger_name}</strong> ({booking.passenger_phone})</span>
                  </div>
                </div>
              </div>

              {/* Route Locations */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-gray-400 block">Pickup Location</span>
                    <span className="text-sm font-semibold text-gray-900">{booking.from_location}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-gray-400 block">Destination</span>
                    <span className="text-sm font-semibold text-gray-900">{booking.to_location}</span>
                  </div>
                </div>
              </div>

              {/* Special Notes if any */}
              {booking.special_notes && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
                  <strong>Special Instructions:</strong> {booking.special_notes}
                </div>
              )}

              {/* Action Buttons: Modify or Cancel */}
              {booking.booking_status !== 'cancelled' && booking.booking_status !== 'completed' && (
                <div className="border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-gray-500">
                    {hoursUntilPickup < 2 ? (
                      <span className="text-amber-700 font-semibold">
                        Within 2 hours of departure: please contact our dispatch team directly for changes.
                      </span>
                    ) : (
                      <span>Free modifications available online up to 2 hours before pickup.</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button
                      onClick={() => setIsModifyOpen(true)}
                      disabled={hoursUntilPickup < 2}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-ots-yellow" />
                      <span>Modify Booking</span>
                    </button>

                    <button
                      onClick={() => setIsCancelOpen(true)}
                      className="flex-1 sm:flex-none px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                </div>
              )}

              {booking.booking_status === 'cancelled' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center space-x-3">
                  <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                  <div>
                    <strong>This booking was cancelled.</strong>
                    <p className="text-xs text-red-700 mt-0.5">
                      If you require a new transfer, please book directly on our website or contact our 24/7 helpline.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* MODAL: Modify Booking */}
        {isModifyOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 my-8">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <Edit2 className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-gray-900 text-base">Modify Booking Details</h3>
                </div>
                <button onClick={() => setIsModifyOpen(false)} className="text-gray-400 hover:text-black">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {modifyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {modifyError}
                </div>
              )}

              {modifySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{modifySuccess}</span>
                </div>
              )}

              <form onSubmit={handleModifySubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Pickup Date</label>
                    <input
                      type="date"
                      required
                      value={modifyForm.pickup_date}
                      onChange={(e) => setModifyForm({ ...modifyForm, pickup_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Pickup Time</label>
                    <input
                      type="time"
                      required
                      value={modifyForm.pickup_time}
                      onChange={(e) => setModifyForm({ ...modifyForm, pickup_time: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vehicle Category</label>
                  <select
                    value={modifyForm.selected_vehicle_id}
                    onChange={(e) => setModifyForm({ ...modifyForm, selected_vehicle_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {vehicleOptions.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Passengers</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={modifyForm.passengers}
                      onChange={(e) => setModifyForm({ ...modifyForm, passengers: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Suitcases</label>
                    <input
                      type="number"
                      min={0}
                      max={8}
                      value={modifyForm.suitcases}
                      onChange={(e) => setModifyForm({ ...modifyForm, suitcases: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Flight Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. BA123"
                      value={modifyForm.flight_number}
                      onChange={(e) => setModifyForm({ ...modifyForm, flight_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Airport Terminal</label>
                    <input
                      type="text"
                      placeholder="e.g. T2 / T3"
                      value={modifyForm.terminal}
                      onChange={(e) => setModifyForm({ ...modifyForm, terminal: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Special Notes / Requests</label>
                  <textarea
                    rows={2}
                    placeholder="Child seat request, extra luggage notes, or driver instructions..."
                    value={modifyForm.special_notes}
                    onChange={(e) => setModifyForm({ ...modifyForm, special_notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModifyOpen(false)}
                    className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isModifying}
                    className="px-5 py-2 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-xl transition flex items-center space-x-1.5 shadow"
                  >
                    {isModifying ? <Loader2 className="w-3.5 h-3.5 animate-spin text-ots-yellow" /> : null}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Cancel Booking */}
        {isCancelOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-center space-x-2 text-red-600 border-b pb-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-extrabold text-base text-gray-900">Cancel Booking?</h3>
              </div>

              {cancelError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {cancelError}
                </div>
              )}

              {cancelSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  {cancelSuccess}
                </div>
              )}

              <p className="text-xs text-gray-600">
                Are you sure you want to cancel booking <strong>{booking?.quote_ref}</strong>?
              </p>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                <strong className="text-gray-900 block">Cancellation &amp; Refund Policy:</strong>
                {isRefundEligible ? (
                  <p className="text-emerald-700">
                    ✓ You are cancelling more than 24 hours prior to departure. You are eligible for a <strong>100% full refund</strong>.
                  </p>
                ) : (
                  <p className="text-amber-800">
                    ⚠️ You are cancelling within 24 hours of scheduled departure. A cancellation fee may apply in accordance with terms of carriage.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCancelOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-xs"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubmit}
                  disabled={isCancelling}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition flex items-center space-x-1.5 shadow text-xs"
                >
                  {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-[#f8f9fa]">
          <Loader2 className="w-10 h-10 text-ots-yellow animate-spin" />
          <p className="text-sm font-medium text-gray-600">Loading booking manager...</p>
        </div>
      }
    >
      <ManageBookingContent />
    </Suspense>
  );
}
