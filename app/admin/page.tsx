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
  ChevronDown,
  Settings,
  Send,
  Lock,
  ToggleLeft,
  ToggleRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, formatPrice } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'drivers' | 'inquiries' | 'settings'>('bookings');
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

  // SMTP & System Settings State
  const [settings, setSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '"OTS Taxi UK" <no-reply@otstaxi.co.uk>',
    admin_email: 'admin@otstaxi.co.uk',
    require_email_verification: false,
    require_driver_approval: true,
    google_client_id: '',
    google_client_secret: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load Admin Data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, driversRes, inquiriesRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/bookings?status=${statusFilter}`),
        fetch('/api/admin/drivers'),
        fetch('/api/admin/inquiries'),
        fetch('/api/admin/settings'),
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

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.status && sData.settings) {
          setSettings(sData.settings);
          if (sData.settings.admin_email) setTestRecipient(sData.settings.admin_email);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage({ type: 'success', text: data.message || 'Settings saved successfully!' });
      } else {
        setSettingsMessage({ type: 'error', text: data.message || 'Failed to save settings.' });
      }
    } catch {
      setSettingsMessage({ type: 'error', text: 'Connection failed.' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setSettingsMessage(null);
    try {
      const res = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          test_recipient: testRecipient || settings.admin_email,
        }),
      });
      const data = await res.json();
      if (data.status) {
        setSettingsMessage({ type: 'success', text: data.message || 'Test email dispatched successfully!' });
      } else {
        setSettingsMessage({ type: 'error', text: data.message || 'SMTP test connection failed.' });
      }
    } catch {
      setSettingsMessage({ type: 'error', text: 'Failed to test SMTP.' });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    setActionLoading(driverId);
    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          verificationStatus: 'approved',
          isActive: true,
        }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (e) {
      console.error('Failed to approve driver:', e);
    } finally {
      setActionLoading(null);
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

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center space-x-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'settings'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>SMTP &amp; Security Settings</span>
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
              {drivers.map((d) => {
                const isVerified = d.verification_status === 'approved' || (Boolean(d.license_number) && d.verification_status !== 'incomplete');
                const isPending = d.verification_status === 'pending_approval' || (Boolean(d.license_number) && !d.is_active);

                return (
                  <div key={d.id} className="p-4 border border-gray-200 rounded-xl space-y-3 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">{d.driver_name || 'Chauffeur'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isVerified
                          ? 'bg-green-100 text-green-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isVerified ? '✓ Approved' : isPending ? '⏳ Pending Approval' : 'Incomplete Profile'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>Car:</strong> {d.vehicle_model || 'Not set'} ({d.vehicle_category || 'Saloon'})</div>
                      <div><strong>Plate:</strong> <span className="font-mono bg-white px-1.5 py-0.5 border rounded">{d.vehicle_plate || 'PENDING'}</span></div>
                      <div><strong>License:</strong> {d.license_number || 'Awaiting submission'}</div>
                      {d.driver_phone && <div><strong>Phone:</strong> {d.driver_phone}</div>}
                    </div>

                    {!isVerified && d.license_number && (
                      <button
                        onClick={() => handleApproveDriver(d.id)}
                        disabled={actionLoading === d.id}
                        className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                      >
                        {actionLoading === d.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Approve Chauffeur</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
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

        {/* TAB 4: SMTP & Security Policy Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
            <div>
              <div className="flex items-center space-x-2 text-ots-yellow bg-black px-3 py-1 rounded inline-flex text-xs font-bold uppercase tracking-wider mb-2">
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Controls</span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">SMTP Server &amp; Registration Security Policies</h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure outgoing transactional emails and require email verification for new accounts.
              </p>
            </div>

            {settingsMessage && (
              <div className={`p-4 rounded-xl text-xs flex items-center space-x-2.5 ${
                settingsMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {settingsMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-medium">{settingsMessage.text}</span>
              </div>
            )}

            {/* SECTION 1: REGISTRATION POLICIES */}
            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Account Verification Policies</span>
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-amber-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-900 block">
                    Require Email Verification for New Registrations
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    When enabled, no customer or driver can activate their account without confirming a 6-digit email code.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      require_email_verification: !prev.require_email_verification,
                    }))
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
                    settings.require_email_verification
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {settings.require_email_verification ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ENFORCED (Active)</span>
                    </>
                  ) : (
                    <span>DISABLED (Instant Access)</span>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-amber-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-900 block">
                    Driver Onboarding PCO &amp; Vehicle Approval
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Drivers can view their dashboard upon sign-up, but On-Duty remains locked until chauffeur profile is completed.
                  </span>
                </div>
                <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                  ✓ Always Required
                </span>
              </div>
            </div>

            {/* SECTION 2: SMTP SERVER CONFIGURATION FORM */}
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-ots-yellow" />
                  <span>SMTP Mail Server Configuration</span>
                </h3>

                {/* Quick Presets */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase">Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        smtp_host: 'smtp.gmail.com',
                        smtp_port: 587,
                      }))
                    }
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition text-[11px]"
                  >
                    Gmail
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        smtp_host: 'smtp.sendgrid.net',
                        smtp_port: 587,
                        smtp_user: 'apikey',
                      }))
                    }
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition text-[11px]"
                  >
                    SendGrid
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        smtp_host: 'smtp.resend.com',
                        smtp_port: 465,
                        smtp_user: 'resend',
                      }))
                    }
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition text-[11px]"
                  >
                    Resend
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. smtp.gmail.com or smtp.sendgrid.net"
                    value={settings.smtp_host}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="587"
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value, 10) || 587 })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    SMTP Username / Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. notifications@otstaxi.co.uk"
                    value={settings.smtp_user}
                    onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    SMTP Password / App Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Enter SMTP password"
                    value={settings.smtp_pass}
                    onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Tip: For Gmail, use an app-specific password from Google Security settings.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    From Sender Header *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='"OTS Taxi UK" <no-reply@otstaxi.co.uk>'
                    value={settings.smtp_from}
                    onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                    Admin Notification Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@otstaxi.co.uk"
                    value={settings.admin_email}
                    onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                  />
                </div>
              </div>

              {/* SECTION 3: GOOGLE OAUTH CONFIGURATION */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <h3 className="text-sm font-extrabold text-gray-900">Google OAuth 2.0 (&ldquo;Continue with Google&rdquo;)</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Allow passengers to sign in or register instantly with 1-click using their Google account.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                      Google Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789-xxxx.apps.googleusercontent.com"
                      value={settings.google_client_id}
                      onChange={(e) => setSettings({ ...settings, google_client_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">
                      Google Client Secret
                    </label>
                    <input
                      type="password"
                      placeholder="e.g. GOCSPX-xxxxxxxxxxxx"
                      value={settings.google_client_secret}
                      onChange={(e) => setSettings({ ...settings, google_client_secret: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold block">Authorized Redirect URI (for Google Cloud Console):</span>
                    <code className="font-mono text-[11px] text-blue-700 select-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/google/callback` : '/api/auth/google/callback'}
                    </code>
                  </div>
                </div>
              </div>

              {/* SAVE & TEST ACTION BUTTONS */}
              <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save All Settings &amp; Credentials</span>
                    </>
                  )}
                </button>

                {/* Test Email Section */}
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    placeholder="Test recipient email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs w-48 sm:w-60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={isTestingSmtp}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {isTestingSmtp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
