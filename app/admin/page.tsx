'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard,
  Calendar,
  Car,
  Users,
  MessageSquare,
  Settings,
  ShieldCheck,
  Shield,
  LogOut,
  RefreshCw,
  Clock,
  Search,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
  Check,
  Eye,
  DollarSign,
  Globe,
  Lock,
  Send,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Sliders,
  Award,
  CreditCard,
  UserCheck,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  Briefcase
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, formatPrice } = useApp();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'bookings' | 'drivers' | 'partners' | 'users' | 'vehicles' | 'inquiries' | 'settings'
  >('dashboard');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<string>('all');

  const [liveClock, setLiveClock] = useState<string>('');

  // Main Data States
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeConfirmed: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    totalCustomers: 0,
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

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

  // Driver Dossier & Verification Modal State
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [adminStatusForm, setAdminStatusForm] = useState({
    verificationStatus: 'incomplete',
    isActive: false,
    adminNotes: '',
  });
  const [isUpdatingDriver, setIsUpdatingDriver] = useState(false);
  const [driverUpdateSuccess, setDriverUpdateSuccess] = useState<string | null>(null);

  // Real-time London Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Admin Data across all endpoints
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, driversRes, inquiriesRes, settingsRes, usersRes, vehiclesRes, partnersRes] = await Promise.all([
        fetch(`/api/admin/bookings?status=${statusFilter}`),
        fetch('/api/admin/drivers'),
        fetch('/api/admin/inquiries'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/users'),
        fetch('/api/admin/vehicles'),
        fetch('/api/admin/partners'),
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

      if (usersRes && usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.status && uData.users) setUsers(uData.users);
      }

      if (vehiclesRes && vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        if (vData.status && vData.vehicles) setVehicles(vData.vehicles);
      }

      if (partnersRes && partnersRes.ok) {
        const pData = await partnersRes.json();
        if (pData.status && pData.partners) setPartners(pData.partners);
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

  // Open Driver Dossier Modal
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

  // Save Driver Verification from Modal
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

  // Quick Approve Driver
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

  // Update User Role or Verification
  const handleUpdateUser = async (userId: string, updates: { role?: string; isVerified?: boolean }) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  // Update Vehicle Multiplier or Active State
  const handleUpdateVehicle = async (id: string, updates: { multiplier?: number; isActive?: boolean }) => {
    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Failed to update vehicle:', err);
    }
  };

  // Resolve Customer Inquiry
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

  // Update Partner Application Status
  const handleUpdatePartnerStatus = async (id: number, status: string, adminNotes?: string) => {
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, adminNotes }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Failed to update partner:', err);
    }
  };

  // Save SMTP Settings
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

  // Send Test Email
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
      if (res.ok) {
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

  // Computed Counters
  const pendingDriversCount = useMemo(() => {
    return drivers.filter(d => d.verification_status === 'pending_approval' || (Number(d.completion_score) === 100 && d.verification_status !== 'approved')).length;
  }, [drivers]);

  const unassignedBookingsCount = useMemo(() => {
    return bookings.filter(b => (b.booking_status === 'confirmed' || b.booking_status === 'quoted') && !b.driver_id).length;
  }, [bookings]);

  const unresolvedInquiriesCount = useMemo(() => {
    return inquiries.filter(i => i.status !== 'resolved').length;
  }, [inquiries]);

  const pendingPartnersCount = useMemo(() => {
    return partners.filter(p => p.status === 'new' || p.status === 'under_review').length;
  }, [partners]);

  // Filtered Bookings for search
  const filteredBookings = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return bookings.filter((b) => {
      return (
        b.quote_ref?.toLowerCase().includes(term) ||
        b.from_location?.toLowerCase().includes(term) ||
        b.to_location?.toLowerCase().includes(term) ||
        b.passenger_name?.toLowerCase().includes(term) ||
        b.passenger_email?.toLowerCase().includes(term)
      );
    });
  }, [bookings, searchTerm]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((u) => {
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesSearch = 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, searchTerm]);

  // Filtered Partners
  const filteredPartners = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return partners.filter((p) => {
      const matchesStatus = partnerStatusFilter === 'all' || p.status === partnerStatusFilter;
      const matchesSearch =
        p.company_name?.toLowerCase().includes(term) ||
        p.contact_name?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.partner_type?.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [partners, partnerStatusFilter, searchTerm]);

  // Navigation Links Definition
  const navigationItems = [
    {
      group: 'OPERATIONS DESK',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
        { id: 'bookings', label: 'Bookings & Dispatch', icon: Calendar, badge: bookings.length > 0 ? bookings.length : null },
        { id: 'drivers', label: 'Fleet & Chauffeurs', icon: ShieldCheck, badge: pendingDriversCount > 0 ? `${pendingDriversCount} pending` : null, badgeColor: 'bg-amber-500' },
      ],
    },
    {
      group: 'MANAGEMENT & FLEET',
      items: [
        { id: 'partners', label: 'B2B & Partners', icon: Briefcase, badge: pendingPartnersCount > 0 ? `${pendingPartnersCount} new` : (partners.length > 0 ? partners.length : null), badgeColor: 'bg-blue-500' },
        { id: 'users', label: 'Users & Customers', icon: Users, badge: users.length > 0 ? users.length : null },
        { id: 'vehicles', label: 'Vehicles & Pricing', icon: Car, badge: vehicles.length > 0 ? `${vehicles.length} classes` : null },
        { id: 'inquiries', label: 'Support Inquiries', icon: MessageSquare, badge: unresolvedInquiriesCount > 0 ? unresolvedInquiriesCount : null, badgeColor: 'bg-red-500' },
      ],
    },
    {
      group: 'CONFIGURATION',
      items: [
        { id: 'settings', label: 'SMTP & Integrations', icon: Settings, badge: null },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-[#0e1118] text-slate-100 font-sans overflow-hidden">
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR (Desktop Fixed + Mobile Drawer) */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#121622] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: OTS TAXI Brand */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-ots-yellow text-gray-950 font-black flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform">
                OTS
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-extrabold text-white text-base tracking-wider">OTS</span>
                  <span className="font-light text-ots-yellow text-base tracking-wider">TAXI</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Admin OS &bull; Live
                  </span>
                </div>
              </div>
            </Link>

            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] text-xs">
            {navigationItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
                  {group.group}
                </span>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all text-left min-h-[42px] ${
                        isActive
                          ? 'bg-ots-yellow text-gray-950 shadow-md font-extrabold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gray-950' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          isActive 
                            ? 'bg-black text-ots-yellow' 
                            : item.badgeColor ? `${item.badgeColor} text-white` : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0e1118]/80 space-y-3">
          <div className="flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-gray-950 font-black flex items-center justify-center text-sm shadow">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-white text-xs truncate block">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {user?.email || 'admin@otstaxi.co.uk'}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/"
              target="_blank"
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-center space-x-1 transition text-[11px]"
            >
              <Globe className="w-3.5 h-3.5 text-ots-yellow" />
              <span>Website</span>
            </Link>

            <button
              onClick={() => {
                logout();
                window.location.href = '/account/login';
              }}
              className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/40 rounded-xl font-bold flex items-center justify-center space-x-1 transition text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f6fa] text-slate-800">
        
        {/* TOP APP BAR */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 shadow-sm z-10">
          
          {/* Left: Mobile hamburger & Active Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Admin Operations</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-black text-slate-900 capitalize tracking-wide">
                {activeTab === 'dashboard' ? 'Overview Cockpit' : activeTab}
              </span>
            </div>
          </div>

          {/* Center: Global Search Input */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookings, chauffeurs, passengers..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ots-yellow focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Right: Actions, Live Clock, Refresh */}
          <div className="flex items-center space-x-2.5">
            {/* Live London Time */}
            {liveClock && (
              <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-xl text-slate-600 font-mono text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{liveClock} UK</span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              title="Refresh Data"
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center min-w-[36px] min-h-[36px]"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-ots-yellow' : ''}`} />
            </button>

            {/* Admin Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ops Ready</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE BODY (Scrollable Container) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* ══════════════════════════════════════════════════════════════
              VIEW 1: OVERVIEW DASHBOARD (Cockpit)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Operational Alerts Banner (if any) */}
              {(pendingDriversCount > 0 || unassignedBookingsCount > 0 || unresolvedInquiriesCount > 0 || pendingPartnersCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {pendingDriversCount > 0 && (
                    <div 
                      onClick={() => setActiveTab('drivers')}
                      className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <span className="font-extrabold text-xs block">{pendingDriversCount} Chauffeur Approvals</span>
                          <span className="text-[11px] text-amber-700">Dossiers ready for verification</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-amber-700" />
                    </div>
                  )}

                  {unassignedBookingsCount > 0 && (
                    <div 
                      onClick={() => setActiveTab('bookings')}
                      className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-100/70 transition shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Car className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <span className="font-extrabold text-xs block">{unassignedBookingsCount} Unassigned Trips</span>
                          <span className="text-[11px] text-blue-700">Awaiting driver dispatch</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-blue-700" />
                    </div>
                  )}

                  {pendingPartnersCount > 0 && (
                    <div 
                      onClick={() => setActiveTab('partners')}
                      className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-indigo-100/70 transition shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Briefcase className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div>
                          <span className="font-extrabold text-xs block">{pendingPartnersCount} Partner Requests</span>
                          <span className="text-[11px] text-indigo-700">B2B &amp; agency onboarding</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-indigo-700" />
                    </div>
                  )}

                  {unresolvedInquiriesCount > 0 && (
                    <div 
                      onClick={() => setActiveTab('inquiries')}
                      className="p-3.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-purple-100/70 transition shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <MessageSquare className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div>
                          <span className="font-extrabold text-xs block">{unresolvedInquiriesCount} Inquiries</span>
                          <span className="text-[11px] text-purple-700">Customer requests awaiting reply</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-purple-700" />
                    </div>
                  )}
                </div>
              )}

              {/* KPI Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
                    <Calendar className="w-4 h-4 text-ots-yellow" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalBookings}</div>
                  <div className="text-[11px] text-slate-400">All registered quotes</div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Confirmed Trips</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.activeConfirmed}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Active &amp; scheduled rides</div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gross Paid Revenue</span>
                    <DollarSign className="w-4 h-4 text-ots-yellow" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">£{Number(stats.totalRevenue || 0).toFixed(2)}</div>
                  <div className="text-[11px] text-slate-400">Completed payments</div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Drivers</span>
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-600">{drivers.filter(d => d.is_active).length} / {drivers.length}</div>
                  <div className="text-[11px] text-slate-400">Licensed fleet cleared on duty</div>
                </div>
              </div>

              {/* Split Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Live Dispatch Queue */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">Live Dispatch Desk</h2>
                      <p className="text-xs text-slate-500">Upcoming scheduled airport transfers and assigned chauffeurs</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-bold text-ots-yellow hover:text-amber-600 flex items-center space-x-1"
                    >
                      <span>View All ({bookings.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No active bookings in the system yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {bookings.slice(0, 5).map((b) => (
                        <div key={b.quote_ref} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-slate-900 text-xs">{b.quote_ref}</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                b.booking_status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                b.booking_status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                                b.booking_status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {b.booking_status}
                              </span>
                              <span className="text-slate-400 text-xs">&bull; {b.pickup_date} at {b.pickup_time}</span>
                            </div>
                            <div className="text-xs text-slate-600 flex items-center space-x-1.5 truncate">
                              <span className="font-bold text-slate-800 truncate">{b.from_location}</span>
                              <span className="text-slate-400">&rarr;</span>
                              <span className="font-bold text-slate-800 truncate">{b.to_location}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Passenger: <strong className="text-slate-700">{b.passenger_name || 'Guest'}</strong> &bull; Fare: <strong className="text-slate-900">£{Number(b.total_price || 0).toFixed(2)}</strong>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <select
                              value={b.driver_id || ''}
                              onChange={(e) => handleUpdateBooking(b.quote_ref, { driverId: e.target.value })}
                              className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none min-h-[36px] font-semibold"
                            >
                              <option value="">-- Assign Chauffeur --</option>
                              {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.driver_name || d.id} ({d.vehicle_plate})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 1 Col: Fleet & System Health */}
                <div className="space-y-6">
                  
                  {/* Fleet Compliance Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Chauffeur Compliance</h3>
                        <p className="text-[11px] text-slate-400">TfL / Council verification overview</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('drivers')}
                        className="text-xs font-bold text-ots-yellow hover:text-amber-600"
                      >
                        Manage
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100">
                        <span className="font-bold">Verified &amp; Approved</span>
                        <span className="font-black text-emerald-700">
                          {drivers.filter(d => d.verification_status === 'approved').length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-100">
                        <span className="font-bold">Pending Review (100% Score)</span>
                        <span className="font-black text-amber-700">
                          {pendingDriversCount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-200">
                        <span className="font-bold">Incomplete Applications</span>
                        <span className="font-black text-slate-800">
                          {drivers.filter(d => d.verification_status !== 'approved' && Number(d.completion_score) < 100).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Environment Status */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3 text-xs">
                    <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                      System Status
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Database Engine</span>
                        <span className="font-mono font-bold text-emerald-600">MySQL / Active Sync</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>SMTP Email Server</span>
                        <span className={`font-mono font-bold ${settings.smtp_user ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {settings.smtp_user ? 'Configured' : 'Needs Config'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Dispatch Engine</span>
                        <span className="font-mono font-bold text-emerald-600">Online &bull; 24/7</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 2: BOOKINGS & DISPATCH
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              
              {/* Header and Filter Toolbar */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Bookings &amp; Airport Transfers</h2>
                  <p className="text-xs text-slate-500">Manage client ride reservations, passenger contacts, and driver dispatch</p>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'confirmed', 'assigned', 'in_progress', 'completed', 'quoted', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition whitespace-nowrap min-h-[34px] ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings Table View */}
              {filteredBookings.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-xs">
                  No bookings found matching your selected filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                        <th className="p-4">Ref &amp; Date</th>
                        <th className="p-4">Route</th>
                        <th className="p-4">Passenger</th>
                        <th className="p-4">Vehicle &amp; Fare</th>
                        <th className="p-4">Status &amp; Driver</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.map((b) => (
                        <tr key={b.quote_ref} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="font-mono font-black text-slate-900 block text-sm">{b.quote_ref}</span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">{b.pickup_date} at {b.pickup_time}</span>
                          </td>

                          <td className="p-4 align-top max-w-xs">
                            <div className="space-y-1">
                              <div className="flex items-start space-x-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span className="font-medium text-slate-900 truncate block">{b.from_location}</span>
                              </div>
                              <div className="flex items-start space-x-1.5">
                                <MapPin className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="font-medium text-slate-900 truncate block">{b.to_location}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="font-bold text-slate-900 block">{b.passenger_name || 'Guest'}</span>
                            {b.passenger_email && <span className="text-slate-400 text-[11px] block truncate">{b.passenger_email}</span>}
                            {b.passenger_phone && <span className="text-blue-600 text-[11px] block font-mono">{b.passenger_phone}</span>}
                          </td>

                          <td className="p-4 align-top whitespace-nowrap">
                            <span className="font-black text-slate-900 text-sm block">£{Number(b.total_price || 0).toFixed(2)}</span>
                            <span className="capitalize text-slate-500 text-[11px] block">{b.selected_vehicle_id}</span>
                          </td>

                          <td className="p-4 align-top">
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                                b.booking_status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                b.booking_status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                                b.booking_status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {b.booking_status}
                              </span>

                              <select
                                value={b.driver_id || ''}
                                onChange={(e) => handleUpdateBooking(b.quote_ref, { driverId: e.target.value })}
                                className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none min-h-[34px] font-semibold"
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

                          <td className="p-4 align-top text-right space-y-1.5 whitespace-nowrap">
                            <Link
                              href={`/booking-confirmation?ref=${b.quote_ref}`}
                              target="_blank"
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg inline-flex items-center space-x-1 min-h-[32px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Voucher</span>
                            </Link>

                            {b.booking_status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateBooking(b.quote_ref, { status: 'completed' })}
                                className="block w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                              >
                                Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 3: FLEET & CHAUFFEURS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'drivers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Registered Driver Fleet</h2>
                  <p className="text-xs text-slate-500">TfL / Local Council Private Hire licensed chauffeurs &amp; compliance dossiers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {drivers.map((d) => {
                  const score = d.completion_score !== undefined && d.completion_score !== null ? Number(d.completion_score) : (d.license_number ? 75 : 0);
                  const isVerified = d.verification_status === 'approved';
                  const isPending = d.verification_status === 'pending_approval' || (score === 100 && !isVerified);

                  return (
                    <div key={d.id} className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Header: Name, ID, Score Badge */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-black text-slate-900 text-sm block">{d.driver_name || 'Chauffeur'}</span>
                            <span className="text-[11px] text-slate-400 font-mono">ID: {d.id}</span>
                            {d.driver_email && <span className="text-[11px] text-slate-500 block truncate">{d.driver_email}</span>}
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              isVerified ? 'bg-emerald-100 text-emerald-800' :
                              isPending ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isVerified ? '✓ Approved' : isPending ? '⏳ Pending Approval' : 'Incomplete'}
                            </span>
                            <div className="flex items-center space-x-1 mt-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Score:</span>
                              <span className={`text-xs font-black ${
                                score === 100 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'
                              }`}>
                                {score}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              score === 100 ? 'bg-emerald-500' : score >= 50 ? 'bg-ots-yellow' : 'bg-red-400'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>

                        {/* Vehicle & PCO License Info */}
                        <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div><strong>Vehicle:</strong> {d.vehicle_model || 'Not provided'} ({d.vehicle_category || 'Saloon'})</div>
                          <div><strong>Reg Plate:</strong> <span className="font-mono bg-white px-1.5 py-0.5 border rounded font-bold">{d.vehicle_plate || 'PENDING'}</span></div>
                          <div><strong>PCO License:</strong> {d.license_number || 'Awaiting submission'}</div>
                          {d.pco_expiry && <div><strong>PCO Expiry:</strong> {d.pco_expiry}</div>}
                          {d.driver_phone && <div><strong>Phone:</strong> {d.driver_phone}</div>}
                        </div>

                        {/* Uploaded Documents Quick Links */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Uploaded Files:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {d.doc_pco_badge && (
                              <a href={d.doc_pco_badge} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-bold">
                                📄 PCO Badge
                              </a>
                            )}
                            {d.doc_phv_mot && (
                              <a href={d.doc_phv_mot} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-bold">
                                📄 PHV MOT
                              </a>
                            )}
                            {d.doc_insurance && (
                              <a href={d.doc_insurance} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-bold">
                                📄 Insurance
                              </a>
                            )}
                            {!d.doc_pco_badge && !d.doc_phv_mot && !d.doc_insurance && (
                              <span className="text-[11px] text-slate-400 italic">No files uploaded yet</span>
                            )}
                          </div>
                        </div>

                        {d.admin_notes && (
                          <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                            <span className="font-bold">Admin Note:</span> {d.admin_notes}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => openDriverDossier(d)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 min-h-[40px]"
                        >
                          <Eye className="w-3.5 h-3.5 text-ots-yellow" />
                          <span>Inspect Dossier &amp; Verify Docs</span>
                        </button>

                        {!isVerified ? (
                          <button
                            onClick={() => handleApproveDriver(d.id)}
                            disabled={actionLoading === d.id}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5 min-h-[36px]"
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
                          <div className="w-full py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center border border-emerald-200 flex items-center justify-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified &amp; Cleared for Dispatches</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW: B2B & CORPORATE PARTNERS PROGRAM
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'partners' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">B2B &amp; Corporate Partnerships</h2>
                  <p className="text-xs text-slate-500">
                    Review and onboard Travel Agents, Corporate Accounts, Fleet Operators, and Hotel Concierges
                  </p>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'new', 'under_review', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setPartnerStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition whitespace-nowrap min-h-[34px] ${
                        partnerStatusFilter === st
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPartners.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-xs">
                  No partnership applications found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPartners.map((p) => {
                    const isApproved = p.status === 'approved';
                    const isUnderReview = p.status === 'under_review';
                    const isNew = p.status === 'new';

                    return (
                      <div
                        key={p.id}
                        className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Company Name & Status Pill */}
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h3 className="font-black text-slate-900 text-sm">{p.company_name}</h3>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-ots-yellow/20 text-slate-900 border border-ots-yellow/40 inline-block mt-1">
                                {p.partner_type}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isUnderReview
                                  ? 'bg-amber-100 text-amber-800'
                                  : isNew
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {p.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Contact Details */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-700">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Name:</span>
                              <strong className="text-slate-900">{p.contact_name}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Email:</span>
                              <a href={`mailto:${p.email}`} className="text-blue-600 font-semibold hover:underline block truncate">
                                {p.email}
                              </a>
                            </div>
                            {p.phone && (
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone:</span>
                                <a href={`tel:${p.phone}`} className="font-mono text-slate-900 hover:text-blue-600">
                                  {p.phone}
                                </a>
                              </div>
                            )}
                            {p.fleet_size && (
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fleet Size / Volume:</span>
                                <span className="font-bold text-slate-800">{p.fleet_size}</span>
                              </div>
                            )}
                          </div>

                          {/* Message / Requirements */}
                          {p.message && (
                            <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Application Notes:</span>
                              {p.message}
                            </div>
                          )}

                          {p.created_at && (
                            <div className="text-[10px] text-slate-400">
                              Applied on {new Date(p.created_at).toLocaleDateString('en-GB')} at {new Date(p.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>

                        {/* Admin Action Decision Buttons */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {p.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(p.id, 'approved')}
                                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                              >
                                Approve Partner
                              </button>
                            )}

                            {p.status !== 'under_review' && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(p.id, 'under_review')}
                                className="py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow transition"
                              >
                                Review
                              </button>
                            )}

                            {p.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(p.id, 'rejected')}
                                className="py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 rounded-xl font-bold text-xs transition"
                              >
                                Reject
                              </button>
                            )}

                            <a
                              href={`mailto:${p.email}?subject=OTS Taxi Partnership - ${encodeURIComponent(p.company_name)}`}
                              className="py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center space-x-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 4: USERS & CUSTOMERS DIRECTORY
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">User &amp; Customer Accounts</h2>
                  <p className="text-xs text-slate-500">Directory of registered passengers, verified drivers, and administrators</p>
                </div>

                <div className="flex items-center space-x-1.5">
                  {['all', 'customer', 'driver', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                        userRoleFilter === role 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {role}s
                    </button>
                  ))}
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-xs">
                  No users found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                        <th className="p-4">User</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Role Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-black text-slate-900 block">{u.name}</span>
                            <span className="text-slate-400 text-[10px] font-mono">{u.id}</span>
                          </td>

                          <td className="p-4 whitespace-nowrap text-slate-600">{u.email}</td>

                          <td className="p-4 whitespace-nowrap font-mono text-slate-600">{u.phone || '—'}</td>

                          <td className="p-4 whitespace-nowrap">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'driver' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {u.is_verified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>

                          <td className="p-4 text-right whitespace-nowrap">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                              className="text-xs p-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                            >
                              <option value="customer">Customer</option>
                              <option value="driver">Driver</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 5: VEHICLES FLEET & PRICING
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'vehicles' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Vehicle Classes &amp; Multipliers</h2>
                  <p className="text-xs text-slate-500">Configure vehicle models, passenger/luggage capacities, and dynamic pricing multipliers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {vehicles.map((v) => (
                  <div key={v.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{v.name}</h3>
                        <span className="text-[11px] text-slate-400">{v.categoryName}</span>
                      </div>
                      <span className="font-mono text-xs font-black bg-slate-100 px-2 py-1 rounded-lg">
                        {v.multiplier}x Rate
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Passengers:</span>
                        <strong className="text-slate-900">{v.passengers} pax</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Luggage capacity:</span>
                        <strong className="text-slate-900">{v.suitcases} bags / {v.handLuggage} hand</strong>
                      </div>
                      <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60 truncate">
                        Samples: {v.sampleVehicles}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-bold">Multiplier:</span>
                        <input
                          type="number"
                          step="0.05"
                          defaultValue={v.multiplier}
                          onBlur={(e) => handleUpdateVehicle(v.id, { multiplier: parseFloat(e.target.value) })}
                          className="w-20 p-1 border border-slate-300 rounded text-center font-bold text-xs"
                        />
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={v.isActive !== false}
                          onChange={(e) => handleUpdateVehicle(v.id, { isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 6: SUPPORT INQUIRIES
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900">Customer Support Inquiries</h2>
                <p className="text-xs text-slate-500">Contact form submissions from website visitors</p>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-xs">
                  No customer support inquiries received yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-900 text-sm">{inq.name}</span>
                          <span className="text-xs text-slate-400">&bull; {inq.email}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            inq.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                        {inq.phone && <div className="text-xs text-slate-500 font-mono">Tel: {inq.phone}</div>}
                        {inq.subject && <div className="text-xs font-bold text-slate-800">{inq.subject}</div>}
                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                          {inq.message}
                        </p>
                      </div>

                      {inq.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveInquiry(inq.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition whitespace-nowrap min-h-[38px]"
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

          {/* ══════════════════════════════════════════════════════════════
              VIEW 7: SMTP & INTEGRATION SETTINGS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-4xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-extrabold text-slate-900">SMTP Server &amp; Gateway Settings</h2>
                <p className="text-xs text-slate-500">Configure email delivery credentials for booking vouchers, OTPs, and notifications</p>
              </div>

              {settingsMessage && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                  settingsMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {settingsMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{settingsMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                {/* 1-Click SMTP Presets */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Quick Email Provider Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, smtp_host: 'smtp.gmail.com', smtp_port: 587 })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700"
                    >
                      Gmail (smtp.gmail.com:587)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, smtp_host: 'smtp.sendgrid.net', smtp_port: 587 })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700"
                    >
                      SendGrid (smtp.sendgrid.net:587)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, smtp_host: 'smtp.mailgun.org', smtp_port: 587 })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-slate-700"
                    >
                      Mailgun (smtp.mailgun.org:587)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtp_host}
                      onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={settings.smtp_port}
                      onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value, 10) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SMTP Username / Email</label>
                    <input
                      type="text"
                      value={settings.smtp_user}
                      onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                      placeholder="e.g. notifications@otstaxi.co.uk"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SMTP Password / App Key</label>
                    <input
                      type="password"
                      value={settings.smtp_pass}
                      onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">From Sender Address</label>
                    <input
                      type="text"
                      value={settings.smtp_from}
                      onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Operations Admin Email</label>
                    <input
                      type="email"
                      value={settings.admin_email}
                      onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      placeholder="Test recipient email"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="p-2 border border-slate-300 rounded-xl text-xs w-48 sm:w-60"
                    />
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={isTestingSmtp}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1"
                    >
                      {isTestingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Test SMTP</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                  >
                    {isSavingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4 text-ots-yellow" />}
                    <span>Save Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DRIVER DOSSIER & DOCUMENT VERIFICATION MODAL
      ══════════════════════════════════════════════════════════════ */}
      {isDossierModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            
            {/* Modal Header */}
            <div className="bg-[#121622] text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-ots-yellow text-gray-900 font-black flex items-center justify-center text-lg shadow-md flex-shrink-0">
                  {selectedDriver.driver_name ? selectedDriver.driver_name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-lg font-black text-white">
                      {selectedDriver.driver_name || 'Chauffeur Profile'}
                    </h3>
                    <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                      {selectedDriver.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-3 mt-1 flex-wrap">
                    {selectedDriver.driver_email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedDriver.driver_email}</span>
                      </span>
                    )}
                    {selectedDriver.driver_phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedDriver.driver_phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsDossierModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

              {driverUpdateSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{driverUpdateSuccess}</span>
                </div>
              )}

              {/* Progress & Compliance Bar Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-sm">Compliance Profile Completion</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      selectedDriver.completion_score === 100 ? 'bg-emerald-100 text-emerald-800' :
                      selectedDriver.completion_score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDriver.completion_score || 0}% Complete
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    4-step regulatory chauffeur verification standard
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedDriver.verification_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    selectedDriver.verification_status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                    selectedDriver.verification_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedDriver.verification_status === 'approved' ? '✓ Approved' :
                     selectedDriver.verification_status === 'pending_approval' ? '⏳ Pending Approval' :
                     selectedDriver.verification_status === 'rejected' ? '✕ Rejected' : 'Incomplete'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedDriver.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {selectedDriver.is_active ? '🟢 Dispatch Enabled' : '🔒 Dispatch Locked'}
                  </span>
                </div>
              </div>

              {/* 4 Cards Grid of Chauffeur Dossier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Card 1: Personal & Identity */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <UserCheck className="w-4 h-4 text-ots-yellow" />
                    <span>1. Personal &amp; Identity</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Residential Address</span>
                      <span className="font-medium text-slate-900">{selectedDriver.address || <span className="text-slate-400 italic">Not provided</span>}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">National Insurance (NI) Number</span>
                      <span className="font-mono font-bold text-slate-900">{selectedDriver.ni_number || <span className="text-slate-400 italic font-normal">Not provided</span>}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Contact</span>
                      <span className="font-medium text-slate-900">{selectedDriver.emergency_contact || <span className="text-slate-400 italic">Not provided</span>}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Chauffeur Authority & PCO Licensing */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>2. PCO &amp; DVLA Licensing</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">PCO Badge Number</span>
                        <span className="font-mono font-bold text-slate-900">{selectedDriver.license_number || <span className="text-slate-400 italic font-normal">Pending</span>}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">PCO Expiry Date</span>
                        <span className="font-medium text-slate-900">{selectedDriver.pco_expiry ? selectedDriver.pco_expiry.split('T')[0] : <span className="text-slate-400 italic">Not set</span>}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">DVLA Driver License No</span>
                      <span className="font-mono font-bold text-slate-900">{selectedDriver.dvla_license_number || <span className="text-slate-400 italic font-normal">Pending</span>}</span>
                    </div>
                    <div className="pt-1 space-y-1.5 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Uploaded Licenses:</span>
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
                          <span className="text-slate-400 italic text-[11px]">PCO Badge not uploaded</span>
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
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>3. Vehicle Specification &amp; MOT</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Make &amp; Model</span>
                        <span className="font-bold text-slate-900">{selectedDriver.vehicle_model || 'Not provided'}</span>
                        {selectedDriver.vehicle_year && <span className="text-slate-500 text-[11px] ml-1">({selectedDriver.vehicle_year})</span>}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Plate</span>
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-400 text-black font-mono font-black rounded border border-black shadow-sm text-xs tracking-wider">
                          {selectedDriver.vehicle_plate || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Category</span>
                      <span className="capitalize font-medium text-slate-900">{selectedDriver.vehicle_category || 'Saloon'}</span>
                    </div>
                    <div className="pt-1 space-y-1.5 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Council Inspection Certificate:</span>
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
                        <span className="text-slate-400 italic text-[11px]">MOT file not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 4: Insurance & Payout Banking */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>4. Insurance &amp; Payout Banking</span>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Insurance Policy No</span>
                        <span className="font-mono font-bold text-slate-900">{selectedDriver.insurance_number || <span className="text-slate-400 italic font-normal">Pending</span>}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Insurance Expiry</span>
                        <span className="font-medium text-slate-900">{selectedDriver.insurance_expiry ? selectedDriver.insurance_expiry.split('T')[0] : <span className="text-slate-400 italic">Not set</span>}</span>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Payout Banking Details</span>
                      <div className="flex items-center space-x-4 mt-1">
                        <div>
                          <span className="text-slate-400 text-[10px]">Bank:</span>{' '}
                          <span className="font-medium text-slate-900">{selectedDriver.bank_name || 'Not provided'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">Sort Code:</span>{' '}
                          <span className="font-mono font-bold text-slate-900">{selectedDriver.sort_code || 'Pending'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px]">Account:</span>{' '}
                          <span className="font-mono font-bold text-slate-900">{selectedDriver.account_number || 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 space-y-1.5 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Insurance Certificate:</span>
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
                        <span className="text-slate-400 italic text-[11px]">Insurance file not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* CARD 5: ADMIN DECISION & STATUS OVERRIDE PANEL */}
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/50 space-y-4">
                <div className="flex items-center space-x-2 text-slate-900 font-black text-sm border-b border-amber-200/80 pb-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Admin Compliance Decision &amp; Dispatch Authorization</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Verification Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'approved', label: 'Approved', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                        { val: 'pending_approval', label: 'Pending Review', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                        { val: 'incomplete', label: 'Incomplete', color: 'border-slate-400 bg-slate-50 text-slate-800' },
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
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span>{isSelected ? '●' : '○'}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Dispatch Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-amber-200">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Allow Live On-Duty Mode &amp; Dispatching
                      </span>
                      <span className="text-[11px] text-slate-500 block">
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
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Compliance Audit Notes / Admin Feedback
                    </label>
                    <textarea
                      rows={2}
                      value={adminStatusForm.adminNotes}
                      onChange={(e) => setAdminStatusForm({ ...adminStatusForm, adminNotes: e.target.value })}
                      placeholder="e.g. TfL PCO badge verified against register. Approved for executive saloon transfers."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-ots-yellow"
                    />
                  </div>

                  {/* Action Save Button */}
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDossierModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDriverStatus}
                      disabled={isUpdatingDriver}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
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
