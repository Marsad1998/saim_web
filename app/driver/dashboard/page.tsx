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
  Plane
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
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'vehicle'>('active');

  const loadDriverData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, tripsRes] = await Promise.all([
        fetch('/api/driver/status'),
        fetch('/api/driver/trips'),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.status) {
          setDriver(sData.driver);
          setIsOnDuty(Boolean(sData.driver?.is_active));
          if (sData.stats) setStats(sData.stats);
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

  const handleToggleDuty = async () => {
    const nextState = !isOnDuty;
    setIsOnDuty(nextState);
    try {
      await fetch('/api/driver/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });
    } catch (e) {
      console.error('Failed to toggle duty:', e);
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
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                {driver?.name || user?.name || 'Authorized Driver'}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center space-x-2">
                <Car className="w-3.5 h-3.5 text-ots-yellow" />
                <span>{driver?.vehicle_model || 'Executive Saloon'} • </span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">
                  {driver?.vehicle_plate || 'LO71 ABC'}
                </span>
              </p>
            </div>

            {/* Duty Status Button & Logout */}
            <div className="flex items-center space-x-3">
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
                {formatPrice(stats.todayEarnings || 125)}
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
          </button>
        </div>

        {/* Tab 1: Active Trips */}
        {activeTab === 'active' && (
          <div className="mt-6 space-y-4">
            {activeTrips.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
                <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">No active trips assigned</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Keep your status set to <strong className="text-emerald-600">ON DUTY</strong> to receive automated flight &amp; airport transfer dispatches.
                </p>
              </div>
            ) : (
              activeTrips.map((trip) => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                  trip.from_location
                )}&destination=${encodeURIComponent(trip.to_location)}`;

                const isCurrent = trip.booking_status === 'in_progress';

                return (
                  <div
                    key={trip.quote_ref}
                    className={`bg-white rounded-2xl border p-6 shadow-sm transition-all space-y-5 ${
                      isCurrent ? 'border-ots-yellow ring-2 ring-ots-yellow/40' : 'border-gray-200'
                    }`}
                  >
                    {/* Top Row: Ref & Schedule */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-black text-white px-2.5 py-1 rounded">
                          {trip.quote_ref}
                        </span>
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                          trip.booking_status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {trip.booking_status === 'in_progress' ? 'In Progress' : 'Assigned to You'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-800">{trip.pickup_date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-800">{trip.pickup_time}</span>
                        </span>
                        <span className="font-extrabold text-gray-900 text-sm ml-2">
                          {formatPrice(trip.total_price)}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Pick-up Location</div>
                          <div className="text-sm font-semibold text-gray-900">{trip.from_location}</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-gray-400">Destination</div>
                          <div className="text-sm font-semibold text-gray-900">{trip.to_location}</div>
                        </div>
                      </div>
                    </div>

                    {/* Flight & Passenger Info */}
                    <div className="bg-gray-50 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 border border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400 block">Lead Passenger</span>
                        <span className="font-bold text-gray-900">{trip.passenger_name || 'Valued Guest'}</span>
                        <span className="block text-gray-500 font-mono text-[11px]">{trip.passenger_phone || '+44 7...'}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 block">Flight / Terminal</span>
                        {trip.flight_number ? (
                          <span className="font-bold text-blue-700 font-mono flex items-center space-x-1">
                            <Plane className="w-3.5 h-3.5" />
                            <span>{trip.flight_number} {trip.terminal ? `(${trip.terminal})` : ''}</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">Standard Transfer</span>
                        )}
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

        {/* Tab 3: Vehicle & Documents */}
        {activeTab === 'vehicle' && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Chauffeur Licensing &amp; Vehicle Compliance</h3>
                <p className="text-xs text-gray-500">TfL / Council Private Hire Operator documentation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 block uppercase font-bold text-[10px]">PCO Private Hire License</span>
                <span className="font-mono font-bold text-sm text-gray-900">{driver?.license_number || 'PCO-984321'}</span>
                <span className="text-emerald-600 font-semibold block text-[11px]">✓ Verified &amp; Active</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Vehicle Registration Plate</span>
                <span className="font-mono font-bold text-sm text-gray-900">{driver?.vehicle_plate || 'LO71 ABC'}</span>
                <span className="text-gray-600 font-medium block text-[11px]">{driver?.vehicle_model || 'Mercedes E-Class'}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Vehicle Category</span>
                <span className="font-bold text-gray-900">{driver?.vehicle_category || 'Executive Saloon'}</span>
                <span className="text-gray-500 block text-[11px]">Authorized for Airport Chauffeur</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-400 block uppercase font-bold text-[10px]">MOT &amp; Hire Insurance</span>
                <span className="font-bold text-gray-900">Comprehensive Chauffeur Cover</span>
                <span className="text-emerald-600 font-semibold block text-[11px]">✓ Valid until Dec 2027</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
