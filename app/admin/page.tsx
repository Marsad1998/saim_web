'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Car, 
  Users, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search,
  Filter,
  UserCheck,
  MessageSquare,
  LogOut,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  ChevronDown
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, formatPrice } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'drivers' | 'inquiries'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [stats, setStats] = useState({
    totalBookings: 0,
    activeConfirmed: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    totalCustomers: 0,
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load Admin Data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, driversRes, inquiriesRes] = await Promise.all([
        fetch(`/api/admin/bookings?status=${statusFilter}`),
        fetch('/api/admin/drivers'),
        fetch('/api/admin/inquiries'),
      ]);

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        if (bData.status) {
          setBookings(bData.bookings || []);
          if (bData.stats) setStats(bData.stats);
        }
      }

      if (driversRes.ok) {
        const dData = await driversRes.json();
        if (dData.status) setDrivers(dData.drivers || []);
      }

      if (inquiriesRes.ok) {
        const iData = await inquiriesRes.json();
        if (iData.status) setInquiries(iData.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter]);

  // Update Booking Status or Assign Driver
  const handleUpdateBooking = async (quoteRef: string, updates: { status?: string; driverId?: string }) => {
    setActionLoading(quoteRef);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteRef, ...updates }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Failed to update booking:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Resolve Inquiry
  const handleResolveInquiry = async (id: number) => {
    try {
      await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'resolved' }),
      });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Bookings for search
  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.quote_ref?.toLowerCase().includes(term) ||
      b.from_location?.toLowerCase().includes(term) ||
      b.to_location?.toLowerCase().includes(term) ||
      b.passenger_name?.toLowerCase().includes(term) ||
      b.passenger_email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-[#f4f6f8] min-h-screen py-8 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header */}
        <div className="bg-[#141720] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-ots-yellow shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-ots-yellow text-black text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Operations Desk
              </span>
              <span className="text-xs text-gray-400">Live Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              OTS Taxi <span className="text-ots-yellow">Admin Portal</span>
            </h1>
            <p className="text-xs text-gray-400">
              Logged in as Administrator &bull; Manage live trips, fleet drivers, and customer support
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAdminData}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={() => {
                logout();
                router.push('/account/login');
              }}
              className="px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
              <Calendar className="w-4 h-4 text-ots-yellow" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stats.totalBookings}</div>
            <div className="text-[11px] text-gray-400">All registered quotes</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Confirmed Trips</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-green-700">{stats.activeConfirmed}</div>
            <div className="text-[11px] text-green-700 font-semibold">Active &amp; scheduled rides</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Paid Revenue</span>
              <DollarSign className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">£{stats.totalRevenue.toFixed(2)}</div>
            <div className="text-[11px] text-gray-400">Processed card payments</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Drivers</span>
              <Car className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">{stats.activeDrivers}</div>
            <div className="text-[11px] text-gray-400">Available on duty</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'bookings'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings &amp; Rides ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'drivers'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Fleet &amp; Drivers ({drivers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'inquiries'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Inquiries ({inquiries.length})</span>
          </button>
        </div>

        {/* TAB 1: Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Filter and Search Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search quote ref, passenger, airport..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['all', 'confirmed', 'assigned', 'in_progress', 'completed', 'quoted', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-ots-yellow text-black'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table */}
            {isLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-8 h-8 text-ots-yellow animate-spin mx-auto" />
                <p className="text-xs font-semibold text-gray-500 mt-2">Loading reservations from MySQL...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No bookings match your selected filter.
              </div>
            ) : (
              <div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-200">
                        <th className="p-4">Ref &amp; Date</th>
                        <th className="p-4">Route Details</th>
                        <th className="p-4">Customer Info</th>
                        <th className="p-4">Vehicle &amp; Fare</th>
                        <th className="p-4">Status &amp; Driver</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBookings.map((b) => (
                        <tr key={b.quote_ref} className="hover:bg-gray-50/70 transition-colors">
                          {/* Ref & Date */}
                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="font-mono font-bold text-gray-900 block text-sm">
                              {b.quote_ref}
                            </span>
                            <span className="text-gray-500 text-[11px] block mt-0.5">
                              {b.pickup_date} at {b.pickup_time}
                            </span>
                          </td>

                          {/* Route */}
                          <td className="p-4 align-top max-w-xs">
                            <div className="space-y-1">
                              <div className="text-gray-900 font-medium truncate" title={b.from_location}>
                                📍 {b.from_location}
                              </div>
                              <div className="text-gray-600 font-medium truncate" title={b.to_location}>
                                🏁 {b.to_location}
                              </div>
                              {b.flight_number && (
                                <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  Flight {b.flight_number} {b.terminal ? `(T${b.terminal})` : ''}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="font-bold text-gray-900 block">
                              {b.passenger_name || 'Guest'}
                            </span>
                            <span className="text-gray-500 text-[11px] block">
                              {b.passenger_phone || 'No phone'}
                            </span>
                            <span className="text-gray-400 text-[10px] block">
                              {b.passenger_email || ''}
                            </span>
                          </td>

                          {/* Vehicle & Price */}
                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="font-semibold text-gray-800 uppercase block text-[11px]">
                              {b.selected_vehicle_id}
                            </span>
                            <span className="text-sm font-extrabold text-gray-900 block mt-0.5">
                              £{Number(b.total_price || 0).toFixed(2)}
                            </span>
                            <span className={`text-[10px] font-bold ${
                              b.payment_status === 'completed' ? 'text-green-700' : 'text-amber-700'
                            }`}>
                              {b.payment_status === 'completed' ? '● Paid' : '○ Unpaid'}
                            </span>
                          </td>

                          {/* Status & Driver */}
                          <td className="p-4 align-top">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-2 ${
                              b.booking_status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : b.booking_status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : b.booking_status === 'assigned'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {b.booking_status}
                            </span>

                            {/* Driver Assignment Dropdown */}
                            <div className="mt-1">
                              <select
                                value={b.driver_id || ''}
                                onChange={(e) => handleUpdateBooking(b.quote_ref, { driverId: e.target.value })}
                                className="w-full text-[11px] p-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                              >
                                <option value="">-- Assign Driver --</option>
                                {drivers.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.driver_name || d.id} ({d.vehicle_plate})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleUpdateBooking(b.quote_ref, { status: 'completed' })}
                                title="Mark as Completed"
                                className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg border border-green-200"
                              >
                                Complete
                              </button>
                              <Link
                                href={`/booking-confirmation?ref=${b.quote_ref}`}
                                target="_blank"
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg border border-gray-200"
                              >
                                Voucher
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile App-like Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredBookings.map((b) => (
                    <div key={b.quote_ref} className="p-4 space-y-3 hover:bg-gray-50/50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-gray-900 text-sm">
                            {b.quote_ref}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.booking_status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : b.booking_status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : b.booking_status === 'assigned'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {b.booking_status}
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-gray-900">
                          £{Number(b.total_price || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{b.pickup_date} at {b.pickup_time}</span>
                        <span>•</span>
                        <span className="capitalize">{b.selected_vehicle_id}</span>
                      </div>

                      {/* Route */}
                      <div className="space-y-1.5 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">{b.from_location}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">{b.to_location}</span>
                        </div>
                      </div>

                      {/* Passenger & Driver Assign */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Passenger</span>
                          <span className="font-bold text-gray-900 truncate block">{b.passenger_name || 'Guest'}</span>
                          {b.passenger_phone && (
                            <a href={`tel:${b.passenger_phone}`} className="text-blue-600 font-mono text-[11px] block">
                              {b.passenger_phone}
                            </a>
                          )}
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Assigned Driver</span>
                          <select
                            value={b.driver_id || ''}
                            onChange={(e) => handleUpdateBooking(b.quote_ref, { driverId: e.target.value })}
                            className="w-full text-xs p-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none min-h-[38px] font-medium"
                          >
                            <option value="">-- Assign --</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.driver_name || d.id} ({d.vehicle_plate})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Mobile Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <Link
                          href={`/booking-confirmation?ref=${b.quote_ref}`}
                          target="_blank"
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg min-h-[36px] flex items-center"
                        >
                          View Voucher
                        </Link>

                        <button
                          onClick={() => handleUpdateBooking(b.quote_ref, { status: 'completed' })}
                          className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg min-h-[36px] flex items-center"
                        >
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Fleet & Drivers */}
        {activeTab === 'drivers' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Registered Driver Fleet</h2>
                <p className="text-xs text-gray-500">Licensed chauffeurs and airport transfer drivers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((d) => (
                <div key={d.id} className="p-4 border border-gray-200 rounded-xl space-y-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{d.driver_name || 'Driver'}</span>
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Car:</strong> {d.vehicle_model} ({d.vehicle_category})</div>
                    <div><strong>Plate:</strong> <span className="font-mono bg-white px-1.5 py-0.5 border rounded">{d.vehicle_plate}</span></div>
                    <div><strong>License:</strong> {d.license_number}</div>
                    {d.driver_phone && <div><strong>Phone:</strong> {d.driver_phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Contact Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Customer Support Inquiries</h2>
              <p className="text-xs text-gray-500">Messages sent via Contact Us form</p>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No customer inquiries received yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm">{inq.name}</span>
                        <span className="text-xs text-gray-400">&bull; {inq.email}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inq.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {inq.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">{inq.subject || 'General Inquiry'}</div>
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 max-w-3xl">
                        {inq.message}
                      </p>
                    </div>

                    {inq.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolveInquiry(inq.id)}
                        className="px-3 py-1.5 bg-ots-yellow hover:bg-yellow-400 text-black font-bold text-xs rounded-xl transition-colors whitespace-nowrap self-start md:self-center"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
