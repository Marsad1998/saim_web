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
  ShieldCheck,
  X,
  ExternalLink,
  FileText,
  Check,
  AlertTriangle,
  Building2,
  CreditCard,
  Award,
  Eye
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

  // Driver Verification & Dossier Modal State
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [adminStatusForm, setAdminStatusForm] = useState({
    verificationStatus: 'incomplete',
    isActive: false,
    adminNotes: '',
  });
  const [isUpdatingDriver, setIsUpdatingDriver] = useState(false);
  const [driverUpdateSuccess, setDriverUpdateSuccess] = useState<string | null>(null);

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

      if (bookingsRes.status === 401 || driversRes.status === 401) {
        window.location.href = '/account/login?redirect=%2Fadmin';
        return;
      }

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

  const openDriverDossier = (driver: any) => {
    setSelectedDriver(driver);
    setAdminStatusForm({
      verificationStatus: driver.verification_status || 'incomplete',
      isActive: Boolean(driver.is_active),
      adminNotes: driver.admin_notes || '',
    });
    setDriverUpdateSuccess(null);
    setIsDossierModalOpen(true);
  };

  const handleSaveDriverStatus = async () => {
    if (!selectedDriver) return;
    setIsUpdatingDriver(true);
    setDriverUpdateSuccess(null);
    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: selectedDriver.id,
          verificationStatus: adminStatusForm.verificationStatus,
          isActive: adminStatusForm.isActive,
          adminNotes: adminStatusForm.adminNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setDriverUpdateSuccess(`Chauffeur status updated to ${adminStatusForm.verificationStatus.toUpperCase()}`);
        if (data.driver) {
          setSelectedDriver({ ...selectedDriver, ...data.driver });
        } else {
          setSelectedDriver({
            ...selectedDriver,
            verification_status: adminStatusForm.verificationStatus,
            is_active: adminStatusForm.isActive,
            admin_notes: adminStatusForm.adminNotes,
          });
        }
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to update driver status.');
      }
    } catch (err) {
      console.error('Failed to update driver status:', err);
      alert('Network error while saving driver status.');
    } finally {
      setIsUpdatingDriver(false);
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {drivers.map((d) => {
                const score = d.completion_score !== undefined && d.completion_score !== null ? Number(d.completion_score) : (d.license_number ? 75 : 0);
                const isVerified = d.verification_status === 'approved';
                const isPending = d.verification_status === 'pending_approval' || (score === 100 && !isVerified);

                return (
                  <div key={d.id} className="p-5 border border-gray-200 rounded-2xl space-y-4 bg-white shadow-sm hover:shadow-md transition">
                    
                    {/* Header: Name, Score Badge, Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="font-extrabold text-gray-900 text-sm block">{d.driver_name || 'Chauffeur'}</span>
                        <span className="text-[11px] text-gray-400 font-mono">ID: {d.id}</span>
                        {d.driver_email && <span className="text-[11px] text-gray-500 block truncate">{d.driver_email}</span>}
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isVerified ? '✓ Approved' : isPending ? '⏳ Pending Approval' : 'Incomplete'}
                        </span>
                        <div className="flex items-center space-x-1 mt-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Score:</span>
                          <span className={`text-xs font-black ${
                            score === 100 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          score === 100 ? 'bg-emerald-500' : score >= 50 ? 'bg-ots-yellow' : 'bg-red-400'
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>

                    {/* 4 Steps Breakdown */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className={`p-1.5 rounded-lg border flex items-center space-x-1.5 ${
                        d.step1_completed || d.address ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                        <span>{(d.step1_completed || d.address) ? '✓' : '○'}</span>
                        <span>Personal (25%)</span>
                      </div>

                      <div className={`p-1.5 rounded-lg border flex items-center space-x-1.5 ${
                        d.step2_completed || d.license_number ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                        <span>{(d.step2_completed || d.license_number) ? '✓' : '○'}</span>
                        <span>PCO Badge (25%)</span>
                      </div>

                      <div className={`p-1.5 rounded-lg border flex items-center space-x-1.5 ${
                        d.step3_completed || d.vehicle_plate ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                        <span>{(d.step3_completed || d.vehicle_plate) ? '✓' : '○'}</span>
                        <span>Vehicle (25%)</span>
                      </div>

                      <div className={`p-1.5 rounded-lg border flex items-center space-x-1.5 ${
                        d.step4_completed || (d.sort_code && d.account_number) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                        <span>{(d.step4_completed || (d.sort_code && d.account_number)) ? '✓' : '○'}</span>
                        <span>Bank / Ins. (25%)</span>
                      </div>
                    </div>

                    {/* Vehicle & PCO License Info */}
                    <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div><strong>Vehicle:</strong> {d.vehicle_model || 'Not provided'} ({d.vehicle_category || 'Saloon'})</div>
                      <div><strong>Reg Plate:</strong> <span className="font-mono bg-white px-1.5 py-0.5 border rounded font-bold">{d.vehicle_plate || 'PENDING'}</span></div>
                      <div><strong>PCO License:</strong> {d.license_number || 'Awaiting submission'}</div>
                      {d.pco_expiry && <div><strong>PCO Expiry:</strong> {d.pco_expiry}</div>}
                      {d.driver_phone && <div><strong>Phone:</strong> {d.driver_phone}</div>}
                    </div>

                    {/* Uploaded Documents Links */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Compliance Documents:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {d.doc_pco_badge && (
                          <a
                            href={d.doc_pco_badge}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-semibold inline-flex items-center space-x-1"
                          >
                            <span>📄 PCO Badge</span>
                          </a>
                        )}
                        {d.doc_phv_mot && (
                          <a
                            href={d.doc_phv_mot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-semibold inline-flex items-center space-x-1"
                          >
                            <span>📄 PHV MOT</span>
                          </a>
                        )}
                        {d.doc_insurance && (
                          <a
                            href={d.doc_insurance}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-semibold inline-flex items-center space-x-1"
                          >
                            <span>📄 Insurance</span>
                          </a>
                        )}
                        {!d.doc_pco_badge && !d.doc_phv_mot && !d.doc_insurance && (
                          <span className="text-[11px] text-gray-400 italic">No files uploaded yet</span>
                        )}
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => openDriverDossier(d)}
                        className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 min-h-[40px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-ots-yellow" />
                        <span>Inspect Dossier &amp; Verify Docs</span>
                      </button>

                      {!isVerified ? (
                        <button
                          onClick={() => handleApproveDriver(d.id)}
                          disabled={actionLoading === d.id}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 min-h-[38px]"
                        >
                          {actionLoading === d.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Quick Approve (Activate On-Duty)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="w-full py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center border border-emerald-200 flex items-center justify-center space-x-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified &amp; Cleared for Dispatches</span>
                        </div>
                      )}
                    </div>

                    {d.admin_notes && (
                      <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                        <span className="font-bold">Admin Note:</span> {d.admin_notes}
                      </div>
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

      {/* DRIVER DOSSIER & DOCUMENT VERIFICATION MODAL */}
      {isDossierModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gray-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-ots-yellow text-gray-900 font-extrabold flex items-center justify-center text-lg shadow-md flex-shrink-0">
                  {selectedDriver.driver_name ? selectedDriver.driver_name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-white">
                      {selectedDriver.driver_name || 'Chauffeur Profile'}
                    </h3>
                    <span className="font-mono text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md">
                      {selectedDriver.id}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center space-x-3 mt-1 flex-wrap">
                    {selectedDriver.driver_email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{selectedDriver.driver_email}</span>
                      </span>
                    )}
                    {selectedDriver.driver_phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{selectedDriver.driver_phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsDossierModalOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-gray-800 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

              {/* Success alert if just saved */}
              {driverUpdateSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{driverUpdateSuccess}</span>
                </div>
              )}

              {/* Progress & Compliance Bar Banner */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-sm">Compliance Profile Completion</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedDriver.completion_score === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedDriver.completion_score >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDriver.completion_score || 0}% Complete
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    4-step regulatory chauffeur verification standard
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedDriver.verification_status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedDriver.verification_status === 'pending_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedDriver.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedDriver.verification_status === 'approved'
                      ? '✓ Approved'
                      : selectedDriver.verification_status === 'pending_approval'
                      ? '⏳ Pending Approval'
                      : selectedDriver.verification_status === 'rejected'
                      ? '✕ Rejected'
                      : 'Incomplete'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedDriver.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedDriver.is_active ? '🟢 Dispatch Enabled' : '🔒 Dispatch Locked'}
                  </span>
                </div>
              </div>

              {/* 4 Cards Grid of Chauffeur Dossier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Card 1: Personal & Identity */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-gray-900 font-bold border-b border-gray-100 pb-2">
                    <UserCheck className="w-4 h-4 text-ots-yellow" />
                    <span>1. Personal &amp; Identity</span>
                  </div>
                  <div className="space-y-1.5 text-gray-700">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Residential Address</span>
                      <span className="font-medium text-gray-900">{selectedDriver.address || <span className="text-gray-400 italic">Not provided</span>}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">National Insurance (NI) Number</span>
                      <span className="font-mono font-bold text-gray-900">{selectedDriver.ni_number || <span className="text-gray-400 italic font-normal">Not provided</span>}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Emergency Contact</span>
                      <span className="font-medium text-gray-900">{selectedDriver.emergency_contact || <span className="text-gray-400 italic">Not provided</span>}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Chauffeur Authority & PCO Licensing */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-gray-900 font-bold border-b border-gray-100 pb-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>2. PCO &amp; DVLA Licensing</span>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">PCO Badge Number</span>
                        <span className="font-mono font-bold text-gray-900">{selectedDriver.license_number || <span className="text-gray-400 italic font-normal">Pending</span>}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">PCO Expiry Date</span>
                        <span className="font-medium text-gray-900">{selectedDriver.pco_expiry ? selectedDriver.pco_expiry.split('T')[0] : <span className="text-gray-400 italic">Not set</span>}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">DVLA Driver License No</span>
                      <span className="font-mono font-bold text-gray-900">{selectedDriver.dvla_license_number || <span className="text-gray-400 italic font-normal">Pending</span>}</span>
                    </div>
                    <div className="pt-1 space-y-1.5 border-t border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Uploaded Licenses:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedDriver.doc_pco_badge ? (
                          <a
                            href={selectedDriver.doc_pco_badge}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View PCO Badge</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">PCO Badge file not uploaded</span>
                        )}

                        {selectedDriver.doc_dvla_license && (
                          <a
                            href={selectedDriver.doc_dvla_license}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View DVLA License</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Vehicle Specification & MOT */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-gray-900 font-bold border-b border-gray-100 pb-2">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>3. Vehicle Specification &amp; MOT</span>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Make &amp; Model</span>
                        <span className="font-bold text-gray-900">{selectedDriver.vehicle_model || 'Not provided'}</span>
                        {selectedDriver.vehicle_year && <span className="text-gray-500 text-[11px] ml-1">({selectedDriver.vehicle_year})</span>}
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Plate</span>
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-400 text-black font-mono font-black rounded border border-black shadow-sm text-xs tracking-wider">
                          {selectedDriver.vehicle_plate || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Service Category</span>
                      <span className="capitalize font-medium text-gray-900">{selectedDriver.vehicle_category || 'Saloon'}</span>
                    </div>
                    <div className="pt-1 space-y-1.5 border-t border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Council Inspection Certificate:</span>
                      {selectedDriver.doc_phv_mot ? (
                        <a
                          href={selectedDriver.doc_phv_mot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View PHV MOT / Council Disc</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">MOT file not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 4: Insurance & Payout Banking */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-gray-900 font-bold border-b border-gray-100 pb-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>4. Insurance &amp; Payout Banking</span>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Insurance Policy No</span>
                        <span className="font-mono font-bold text-gray-900">{selectedDriver.insurance_number || <span className="text-gray-400 italic font-normal">Pending</span>}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Insurance Expiry</span>
                        <span className="font-medium text-gray-900">{selectedDriver.insurance_expiry ? selectedDriver.insurance_expiry.split('T')[0] : <span className="text-gray-400 italic">Not set</span>}</span>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Payout Banking Details</span>
                      <div className="flex items-center space-x-4 mt-1">
                        <div>
                          <span className="text-gray-400 text-[10px]">Bank:</span>{' '}
                          <span className="font-medium text-gray-900">{selectedDriver.bank_name || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px]">Sort Code:</span>{' '}
                          <span className="font-mono font-bold text-gray-900">{selectedDriver.sort_code || 'Pending'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px]">Account:</span>{' '}
                          <span className="font-mono font-bold text-gray-900">{selectedDriver.account_number || 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 space-y-1.5 border-t border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Insurance Certificate:</span>
                      {selectedDriver.doc_insurance ? (
                        <a
                          href={selectedDriver.doc_insurance}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Insurance Certificate</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Insurance file not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* CARD 5: ADMIN DECISION & STATUS OVERRIDE PANEL */}
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/50 space-y-4">
                <div className="flex items-center space-x-2 text-gray-900 font-extrabold text-sm border-b border-amber-200/80 pb-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Admin Compliance Decision &amp; Dispatch Authorization</span>
                </div>

                <div className="space-y-4">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Verification Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'approved', label: 'Approved', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                        { val: 'pending_approval', label: 'Pending Review', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                        { val: 'incomplete', label: 'Incomplete', color: 'border-gray-400 bg-gray-50 text-gray-800' },
                        { val: 'rejected', label: 'Rejected', color: 'border-red-500 bg-red-50 text-red-800' },
                      ].map((item) => {
                        const isSelected = adminStatusForm.verificationStatus === item.val;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              setAdminStatusForm({
                                ...adminStatusForm,
                                verificationStatus: item.val,
                                isActive: item.val === 'approved' ? true : adminStatusForm.isActive,
                              });
                            }}
                            className={`p-2.5 rounded-xl border-2 font-bold text-xs text-center transition flex items-center justify-center space-x-1.5 ${
                              isSelected
                                ? `${item.color} shadow-sm ring-2 ring-black/5`
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <span>{isSelected ? '●' : '○'}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-amber-200">
                    <div>
                      <span className="font-bold text-gray-900 block text-xs">
                        Allow Live On-Duty Mode &amp; Dispatching
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        When enabled, chauffeur can toggle On-Duty and receive passenger trip dispatches.
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                      <input
                        type="checkbox"
                        checked={adminStatusForm.isActive}
                        onChange={(e) => setAdminStatusForm({ ...adminStatusForm, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Compliance Audit Notes / Admin Feedback
                    </label>
                    <textarea
                      rows={2}
                      value={adminStatusForm.adminNotes}
                      onChange={(e) => setAdminStatusForm({ ...adminStatusForm, adminNotes: e.target.value })}
                      placeholder="e.g. TfL PCO badge verified against register. Approved for executive saloon transfers."
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-ots-yellow"
                    />
                  </div>

                  {/* Action Save Button */}
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDossierModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDriverStatus}
                      disabled={isUpdatingDriver}
                      className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isUpdatingDriver ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-ots-yellow" />
                          <span>Save Verification &amp; Update Status</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
