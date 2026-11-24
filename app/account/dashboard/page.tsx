'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  MapPin,
  Clock,
  Car,
  LogOut,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
  Shield,
  Phone,
  Mail,
  Lock,
  XCircle,
  Edit2,
  Bell
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

interface BookingItem {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  vehicle: string;
  passengers: number;
  suitcases?: number;
  price: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt?: string;
  assignedDriver?: {
    name: string;
    phone?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    vehicleYear?: string;
    vehicleCategory?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, logout, formatPrice } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Booking modification state
  const [modifyBooking, setModifyBooking] = useState<BookingItem | null>(null);
  const [modifyForm, setModifyForm] = useState({
    pickup_date: '',
    pickup_time: '',
    return_date: '',
    return_time: '',
    passengers: 1,
    suitcases: 1,
    selected_vehicle_id: 'saloon',
    passenger_name: '',
    passenger_phone: '',
    flight_number: '',
    terminal: '',
    special_notes: '',
  });
  const [isModifying, setIsModifying] = useState(false);
  const [modifyError, setModifyError] = useState<string | null>(null);

  // Booking cancellation state
  const [cancelBooking, setCancelBooking] = useState<BookingItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Vehicle options for modify modal
  const vehicleOptions = [
    { id: 'saloon', name: 'Standard Saloon (4 seats, 2 bags)' },
    { id: 'estate', name: 'Estate Car (4 seats, 4 bags)' },
    { id: 'executive-saloon', name: 'Executive Saloon (3 seats, 2 bags)' },
    { id: 'mpv', name: 'MPV 5-6 Seater (6 seats, 4 bags)' },
    { id: 'minibus-8', name: 'Minibus 8-9 Seater (8 seats, 8 bags)' },
  ];

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  // Fetch real bookings from MySQL
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/account/my-bookings')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/account/login?redirect=%2Faccount%2Fdashboard';
          return null;
        }
        return res.ok ? res.json() : Promise.reject('Failed to fetch');
      })
      .then((data) => {
        if (data && data.status && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        }
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    logout();
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/account/login');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setIsUpdatingProfile(true);

    try {
      const payload: any = { name, phone };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status) {
        setProfileMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
        if (data.user) {
          setUser(data.user);
        }
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setProfileMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleModifyBooking = (booking: BookingItem) => {
    setModifyBooking(booking);
    setModifyForm({
      pickup_date: booking.date,
      pickup_time: booking.time,
      return_date: '',
      return_time: '',
      passengers: booking.passengers,
      suitcases: booking.suitcases || 2,
      selected_vehicle_id: booking.vehicle.toLowerCase().replace(/ /g, '-'),
      passenger_name: '',
      passenger_phone: '',
      flight_number: '',
      terminal: '',
      special_notes: '',
    });
    setModifyError(null);
  };

  const handleCloseModify = () => {
    setModifyBooking(null);
    setModifyError(null);
  };

  const handleModifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyBooking) return;
    setIsModifying(true);
    setModifyError(null);

    try {
      const res = await fetch(`/api/account/my-bookings/${modifyBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'modify', ...modifyForm }),
      });

      const data = await res.json();
      if (data.status) {
        setBookings(bookings.map(b => b.id === modifyBooking.id ? data.booking : b));
        setModifyBooking(null);
        setProfileMessage({ type: 'success', text: 'Booking updated successfully!' });
      } else {
        setModifyError(data.message || 'Failed to update booking');
      }
    } catch (err: any) {
      setModifyError('Network error. Please try again.');
    } finally {
      setIsModifying(false);
    }
  };

  const handleCancelBooking = (booking: BookingItem) => {
    setCancelBooking(booking);
    setCancelError(null);
  };

  const handleCloseCancel = () => {
    setCancelBooking(null);
    setCancelError(null);
  };

  const handleCancelConfirm = async () => {
    if (!cancelBooking) return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/account/my-bookings/${cancelBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const data = await res.json();
      if (data.status) {
        setBookings(bookings.filter(b => b.id !== cancelBooking.id));
        setCancelBooking(null);
        setProfileMessage({
          type: 'success',
          text: data.refundEligible
            ? 'Booking cancelled successfully. Refund will be processed within 5-10 business days.'
            : 'Booking cancelled successfully.'
        });
      } else {
        setCancelError(data.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      setCancelError('Network error. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const displayName = user?.name || name || 'Valued Passenger';
  const displayEmail = user?.email || 'passenger@example.com';

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-ots-yellow text-black flex items-center justify-center font-extrabold text-2xl shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Welcome back, {displayName}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {displayEmail} &bull; Personal Account
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Transfer</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 space-x-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'bookings'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>My Bookings &amp; Transfers ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile &amp; Security</span>
          </button>
        </div>

        {/* TAB 1: Real Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  My Bookings &amp; Transfers
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live reservations stored in your database account
                </p>
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
              </span>
            </div>

            {isLoading ? (
              <div className="p-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-ots-yellow animate-spin mx-auto" />
                <p className="text-sm font-semibold text-gray-500">Loading your live bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-50 text-ots-yellow rounded-full flex items-center justify-center mx-auto">
                  <Car className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-base">No bookings found</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    You haven’t booked any airport transfers yet. Plan your next trip with guaranteed fixed prices.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Your First Transfer</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <div key={b.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                      {/* Left: Ref & Status */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-extrabold text-gray-900 text-base">
                            {b.id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            b.status === 'Confirmed'
                              ? 'bg-green-100 text-green-800'
                              : b.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {b.status}
                          </span>
                          {b.paymentStatus === 'completed' && (
                            <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              Paid
                            </span>
                          )}
                        </div>

                        {/* Route */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2 text-gray-800">
                            <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span className="font-semibold">{b.from}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-800">
                            <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                            <span className="font-semibold">{b.to}</span>
                          </div>
                        </div>

                        {/* Assigned Driver & Vehicle Details */}
                        {b.assignedDriver && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-gray-900">{b.assignedDriver.name}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600">{b.assignedDriver.vehicleModel}</span>
                            <span className="font-mono text-[11px] font-black bg-[#ffdb00] text-black px-2 py-0.5 rounded shadow-sm border border-black/10">
                              {b.assignedDriver.vehiclePlate}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Date, Time & Vehicle */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{b.date}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{b.time}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                          <Car className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{b.vehicle}</span>
                        </div>
                      </div>

                      {/* Right: Price & View Voucher + Actions */}
                      <div className="flex items-center justify-between lg:justify-end space-x-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Fare</span>
                          <span className="text-lg font-extrabold text-gray-900">
                            {formatPrice(b.price)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/booking-confirmation?ref=${b.id}`}
                            className="px-4 py-2 bg-gray-100 hover:bg-ots-yellow hover:text-black text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Voucher</span>
                          </Link>

                          {['Quoted', 'Confirmed'].includes(b.status) && (
                            <>
                              <button
                                onClick={() => handleModifyBooking(b)}
                                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                                title="Modify booking"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Modify</span>
                              </button>
                              <button
                                onClick={() => handleCancelBooking(b)}
                                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                                title="Cancel booking"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Profile & Security Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Details &amp; Password</h2>
            <p className="text-xs text-gray-500 mb-6">
              Update your contact information or change your account security password
            </p>

            {profileMessage && (
              <div className={`p-4 rounded-xl text-sm mb-6 flex items-center space-x-2 ${
                profileMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                    required
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7123 456789"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span>Change Password (Optional)</span>
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password to verify"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-6 py-3 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow transition-colors flex items-center space-x-2"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile Changes</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Modify Booking Modal */}
        {modifyBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Modify Booking</h3>
                <button onClick={handleCloseModify} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500">Booking: <span className="font-mono font-bold">{modifyBooking.id}</span></p>

              {modifyError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {modifyError}
                </div>
              )}

              <form onSubmit={handleModifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Date</label>
                  <input
                    type="date"
                    value={modifyForm.pickup_date}
                    onChange={(e) => setModifyForm({...modifyForm, pickup_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Time</label>
                  <input
                    type="time"
                    value={modifyForm.pickup_time}
                    onChange={(e) => setModifyForm({...modifyForm, pickup_time: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Passengers</label>
                  <select
                    value={modifyForm.passengers}
                    onChange={(e) => setModifyForm({...modifyForm, passengers: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  >
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle Type</label>
                  <select
                    value={modifyForm.selected_vehicle_id}
                    onChange={(e) => setModifyForm({...modifyForm, selected_vehicle_id: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  >
                    {vehicleOptions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Passenger Name</label>
                  <input
                    type="text"
                    value={modifyForm.passenger_name}
                    onChange={(e) => setModifyForm({...modifyForm, passenger_name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Passenger Phone</label>
                  <input
                    type="tel"
                    value={modifyForm.passenger_phone}
                    onChange={(e) => setModifyForm({...modifyForm, passenger_phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Flight Number (optional)</label>
                  <input
                    type="text"
                    value={modifyForm.flight_number}
                    onChange={(e) => setModifyForm({...modifyForm, flight_number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Terminal (optional)</label>
                  <input
                    type="text"
                    value={modifyForm.terminal}
                    onChange={(e) => setModifyForm({...modifyForm, terminal: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Special Notes (optional)</label>
                  <textarea
                    value={modifyForm.special_notes}
                    onChange={(e) => setModifyForm({...modifyForm, special_notes: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModify}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isModifying}
                    className="flex-1 px-4 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow transition-colors flex items-center justify-center space-x-2"
                  >
                    {isModifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Booking Modal */}
        {cancelBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
                <button onClick={handleCloseCancel} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500">Booking: <span className="font-mono font-bold">{cancelBooking.id}</span></p>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-2">
                <p className="text-sm font-semibold text-yellow-800">Are you sure you want to cancel this booking?</p>
                <p className="text-xs text-yellow-700">
                  {cancelBooking.paymentStatus === 'completed'
                    ? 'This booking has been paid. A refund will be processed if cancelled more than 24 hours before pickup.'
                    : 'This booking has not been paid yet. No charges will apply.'}
                </p>
              </div>

              {cancelError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {cancelError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleCloseCancel}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow transition-colors flex items-center justify-center space-x-2"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Cancel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
