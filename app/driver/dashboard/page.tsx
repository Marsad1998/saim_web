'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  ShieldCheck, 
  DollarSign, 
  Star, 
  Power,
  ChevronRight,
  Plane,
  Lock,
  FileCheck,
  CreditCard,
  Save,
  Check
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, logout, formatPrice } = useApp();

  const [driver, setDriver] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    completedTrips: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    rating: 4.95,
  });
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'vehicle'>('active');

  // Chauffeur Onboarding / Profile Form State
  const [profileForm, setProfileForm] = useState({
    licenseNumber: '',
    pcoExpiry: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleCategory: 'saloon',
    insuranceNumber: '',
    sortCode: '',
    accountNumber: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDriverData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, tripsRes] = await Promise.all([
        fetch('/api/driver/status'),
        fetch('/api/driver/trips'),
      ]);

      if (statusRes.status === 401) {
        window.location.href = '/account/login?redirect=%2Fdriver%2Fdashboard';
        return;
      }

      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.status) {
          setDriver(sData.driver);
          setIsOnDuty(Boolean(sData.driver?.is_active));
          if (sData.stats) setStats(sData.stats);

          // Populate profile form if driver data exists
          if (sData.driver) {
            setProfileForm({
              licenseNumber: sData.driver.license_number || '',
              pcoExpiry: sData.driver.pco_expiry ? sData.driver.pco_expiry.split('T')[0] : '',
              vehicleModel: sData.driver.vehicle_model || '',
              vehiclePlate: sData.driver.vehicle_plate || '',
              vehicleCategory: sData.driver.vehicle_category || 'saloon',
              insuranceNumber: sData.driver.insurance_number || '',
              sortCode: sData.driver.sort_code || '',
              accountNumber: sData.driver.account_number || '',
            });
          }
        }
      }

      if (tripsRes.ok) {
        const tData = await tripsRes.json();
        if (tData.status && Array.isArray(tData.trips)) {
          setTrips(tData.trips);
        }
      }
    } catch (err) {
      console.error('Failed to load driver dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  const isProfileIncomplete = !driver?.license_number || driver?.verification_status === 'incomplete';

  const handleToggleDuty = async () => {
    if (isProfileIncomplete) {
      setActiveTab('vehicle');
      setProfileFeedback({
        type: 'error',
        text: 'Chauffeur verification required: Please complete your PCO license and vehicle registration below to go On-Duty.',
      });
      return;
    }

    const nextState = !isOnDuty;
    setIsOnDuty(nextState);
    try {
      const res = await fetch('/api/driver/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsOnDuty(!nextState);
        alert(data.message || 'Cannot change status');
      }
    } catch (e) {
      console.error('Failed to toggle duty:', e);
      setIsOnDuty(!nextState);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileFeedback(null);

    if (!profileForm.licenseNumber.trim() || !profileForm.vehicleModel.trim() || !profileForm.vehiclePlate.trim()) {
      setProfileFeedback({
        type: 'error',
        text: 'Please fill in your PCO License Number, Vehicle Model, and Registration Plate.',
      });
      setIsSavingProfile(false);
      return;
    }

    try {
      const res = await fetch('/api/driver/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        setProfileFeedback({
          type: 'success',
          text: data.message || 'Chauffeur profile and vehicle documentation updated successfully!',
        });
        if (data.driver) {
          setDriver(data.driver);
          setIsOnDuty(Boolean(data.driver.is_active));
        }
      } else {
        setProfileFeedback({
          type: 'error',
          text: data.message || 'Failed to update profile.',
        });
      }
    } catch (err: any) {
      console.error('Save profile error:', err);
      setProfileFeedback({
        type: 'error',
        text: 'Network error while saving profile. Please try again.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdateTripStatus = async (quoteRef: string, nextStatus: string) => {
    setUpdatingTripId(quoteRef);
    try {
      const res = await fetch('/api/driver/trips', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteRef, status: nextStatus }),
      });

      if (res.ok) {
        setTrips((prev) =>
          prev.map((t) => (t.quote_ref === quoteRef ? { ...t, booking_status: nextStatus } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update trip status:', err);
    } finally {
      setUpdatingTripId(null);
    }
  };

  const handleLogout = async () => {
    logout();
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/account/login');
  };

  const activeTrips = trips.filter((t) => t.booking_status !== 'completed' && t.booking_status !== 'cancelled');
  const completedTrips = trips.filter((t) => t.booking_status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4 bg-gray-50">
        <Loader2 className="w-10 h-10 text-ots-yellow animate-spin" />
        <p className="text-sm font-semibold text-gray-700">Connecting to Chauffeur Dispatch...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Top Header Card */}
        <div className="bg-[#141720] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-ots-yellow text-black px-2.5 py-0.5 rounded">
                  Chauffeur Portal
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  ID: {driver?.id || 'DRV-781'}
                </span>
                {driver?.verification_status && (
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    driver.verification_status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : driver.verification_status === 'pending_approval'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {driver.verification_status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                {driver?.name || user?.name || 'Authorized Driver'}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center space-x-2">
                <Car className="w-3.5 h-3.5 text-ots-yellow" />
                <span>{driver?.vehicle_model || (isProfileIncomplete ? 'Profile Incomplete' : 'Executive Saloon')} • </span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">
                  {driver?.vehicle_plate || (isProfileIncomplete ? 'NO PLATE' : 'LO71 ABC')}
                </span>
              </p>
            </div>

            {/* Duty Status Button & Logout */}
            <div className="flex items-center space-x-3">
              {isProfileIncomplete ? (
                <button
                  onClick={() => {
                    setActiveTab('vehicle');
                    setProfileFeedback({
                      type: 'error',
                      text: 'You must complete and submit your PCO & vehicle details below before going On-Duty.',
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 border shadow-sm bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-ots-yellow hover:text-white"
                  title="Complete profile to unlock On-Duty"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>🔒 Verification Required</span>
                </button>
              ) : (
                <button
                  onClick={handleToggleDuty}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 border shadow-sm ${
                    isOnDuty
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{isOnDuty ? '🟢 ON DUTY' : '🔴 OFF DUTY'}</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Today's Earnings</div>
              <div className="text-xl font-extrabold text-ots-yellow mt-1">
                {formatPrice(stats.todayEarnings || 0)}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Total Completed</div>
              <div className="text-xl font-extrabold text-white mt-1">
                {stats.completedTrips} Trips
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Active Jobs</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {activeTrips.length} Ready
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-neutral-400">Rating</div>
              <div className="text-xl font-extrabold text-amber-300 mt-1 flex items-center space-x-1">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>{stats.rating || 4.95}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Incomplete Warning Banner */}
        {isProfileIncomplete && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-950">
                  Chauffeur Onboarding Action Required: Complete Your Vehicle &amp; PCO Profile
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Welcome to OTS Taxi! Your driver account is active, but you cannot switch to <strong>On-Duty</strong> or accept passenger rides until your TfL/Council PCO license and vehicle registration are submitted.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('vehicle')}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-ots-yellow font-bold text-xs rounded-xl flex-shrink-0 transition shadow flex items-center space-x-1.5 self-start sm:self-center"
            >
              <span>Complete Profile</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mt-8 space-x-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'active'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <span>Assigned Trips ({activeTrips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'completed'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <span>Trip History</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicle')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'vehicle'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <span>Vehicle &amp; PCO License</span>
            {isProfileIncomplete && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Tab 1: Active Trips */}
        {activeTab === 'active' && (
          <div className="mt-6 space-y-4">
            {activeTrips.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3 shadow-sm">
                <Car className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No Active Trips Assigned</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {isOnDuty
                    ? 'You are On-Duty! New dispatch assignments will appear here automatically when passengers book.'
                    : 'You are currently Off-Duty. Toggle On-Duty at the top to receive ride assignments.'}
                </p>
              </div>
            ) : (
              activeTrips.map((trip) => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                  trip.from_location
                )}&destination=${encodeURIComponent(trip.to_location)}`;

                return (
                  <div
                    key={trip.quote_ref}
                    className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-md transition space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-md">
                          Ref: {trip.quote_ref}
                        </span>
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                          trip.booking_status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {trip.booking_status === 'in_progress' ? '🚗 In Progress' : '📋 Assigned'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Chauffeur Payout</span>
                        <span className="text-base font-black text-gray-900">
                          {formatPrice(trip.total_price)}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start space-x-2.5">
                        <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Pickup Location</span>
                          <span className="font-semibold text-gray-900">{trip.from_location}</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2.5">
                        <Navigation className="w-4 h-4 text-ots-yellow flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Dropoff Destination</span>
                          <span className="font-semibold text-gray-900">{trip.to_location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400 block">Date &amp; Time</span>
                        <span className="font-semibold text-gray-800">
                          {trip.pickup_date} at {trip.pickup_time}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block">Lead Passenger</span>
                        <span className="font-semibold text-gray-800">
                          {trip.passenger_name || 'VIP Client'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block">Vehicle Category</span>
                        <span className="font-semibold text-gray-800 capitalize">
                          {trip.vehicle_tier || 'Executive Saloon'}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block">Distance &amp; Time</span>
                        <span className="font-semibold text-gray-800">
                          {trip.distance_miles} miles • ~{trip.estimated_time_mins} mins
                        </span>
                      </div>
                    </div>

                    {trip.special_notes && (
                      <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200">
                        <strong>Driver Note:</strong> {trip.special_notes}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center space-x-2">
                        {trip.passenger_phone && (
                          <a
                            href={`tel:${trip.passenger_phone}`}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Call</span>
                          </a>
                        )}

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                        </a>
                      </div>

                      {/* State Transitions */}
                      <div>
                        {trip.booking_status === 'assigned' && (
                          <button
                            onClick={() => handleUpdateTripStatus(trip.quote_ref, 'in_progress')}
                            disabled={updatingTripId === trip.quote_ref}
                            className="px-5 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                          >
                            {updatingTripId === trip.quote_ref ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Start Trip / En Route</span>
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}

                        {trip.booking_status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateTripStatus(trip.quote_ref, 'completed')}
                            disabled={updatingTripId === trip.quote_ref}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                          >
                            {updatingTripId === trip.quote_ref ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Mark As Completed</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Trip History */}
        {activeTab === 'completed' && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-gray-900">Completed Transfers</h3>
            <p className="text-xs text-gray-500">Log of delivered passenger transfers and earned fares.</p>

            {completedTrips.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No completed trips logged yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {completedTrips.map((t) => (
                  <div key={t.quote_ref} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900">{t.from_location} ➔ {t.to_location}</div>
                      <div className="text-gray-400 text-[11px] mt-0.5">
                        Ref: {t.quote_ref} • {t.pickup_date} at {t.pickup_time}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-gray-900 text-sm">{formatPrice(t.total_price)}</span>
                      <span className="block text-[11px] text-emerald-600 font-semibold">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Vehicle & Documents / Onboarding Form */}
        {activeTab === 'vehicle' && (
          <div className="mt-6 space-y-6">
            
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isProfileIncomplete ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isProfileIncomplete ? <AlertCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Chauffeur Licensing &amp; Vehicle Compliance</h3>
                    <p className="text-xs text-gray-500">TfL / Local Council Private Hire Operator documentation.</p>
                  </div>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    driver?.verification_status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : driver?.verification_status === 'pending_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Status: {driver?.verification_status || 'Incomplete'}
                  </span>
                </div>
              </div>

              {profileFeedback && (
                <div className={`mt-4 p-4 rounded-xl text-xs flex items-center space-x-2 ${
                  profileFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {profileFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{profileFeedback.text}</span>
                </div>
              )}

              {/* Profile Completion Form */}
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* PCO License Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      PCO Private Hire License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PCO-984321"
                      value={profileForm.licenseNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                    />
                    <span className="text-[10px] text-gray-400 block mt-0.5">TfL or Local Authority Badge ID</span>
                  </div>

                  {/* PCO Expiry Date */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      PCO License Expiry Date
                    </label>
                    <input
                      type="date"
                      value={profileForm.pcoExpiry}
                      onChange={(e) => setProfileForm({ ...profileForm, pcoExpiry: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                    />
                  </div>

                  {/* Vehicle Model */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Vehicle Make &amp; Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mercedes-Benz E-Class 2023"
                      value={profileForm.vehicleModel}
                      onChange={(e) => setProfileForm({ ...profileForm, vehicleModel: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                    />
                  </div>

                  {/* Vehicle Plate */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Vehicle Registration Plate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LO71 ABC"
                      value={profileForm.vehiclePlate}
                      onChange={(e) => setProfileForm({ ...profileForm, vehiclePlate: e.target.value.toUpperCase() })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono uppercase font-bold focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                    />
                  </div>

                  {/* Vehicle Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Vehicle Service Category
                    </label>
                    <select
                      value={profileForm.vehicleCategory}
                      onChange={(e) => setProfileForm({ ...profileForm, vehicleCategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none bg-white"
                    >
                      <option value="saloon">Standard Saloon (Up to 4 Pax)</option>
                      <option value="estate">Estate / Station Wagon (Large Luggage)</option>
                      <option value="executive">Executive Class (Mercedes E-Class / BMW 5)</option>
                      <option value="mpv">MPV 6-Seater (Ford Galaxy / Sharan)</option>
                      <option value="minibus">8-Seater Minibus (Mercedes Vito / V-Class)</option>
                    </select>
                  </div>

                  {/* Private Hire Insurance Policy */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Hire &amp; Reward Insurance Policy No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INS-882914-UK"
                      value={profileForm.insuranceNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, insuranceNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                    />
                  </div>

                  {/* Payout Sort Code */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Bank Sort Code (For Weekly Payouts)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20-04-15"
                      value={profileForm.sortCode}
                      onChange={(e) => setProfileForm({ ...profileForm, sortCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                    />
                  </div>

                  {/* Payout Account Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12345678"
                      value={profileForm.accountNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, accountNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                    />
                  </div>

                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    All chauffeur details are reviewed in accordance with UK Private Hire Operator regulations.
                  </span>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save &amp; Submit Documents</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Compliance FAQ */}
            <div className="p-4 bg-gray-100 rounded-2xl text-xs text-gray-600 space-y-1">
              <span className="font-bold text-gray-800 block">Why do I need to complete this?</span>
              <p>
                To maintain London TfL &amp; UK Council compliance, only drivers with verified PCO licenses, vehicle registrations, and Hire &amp; Reward insurance are allowed to receive live dispatch requests. Once submitted, your profile will be authorized immediately.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}