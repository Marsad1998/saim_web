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
  Navigation,
  Sliders,
  Award,
  CreditCard,
  UserCheck,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  Palette,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  HelpCircle,
  CheckCircle,
  Plus,
  Pencil,
  Database,
  Server,
  HardDrive,
  BarChart2,
  Download
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

// Helper function to calculate dark hover shade for custom hex colors
function adjustHex(hex: string, percent: number) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  if (cleanHex.length !== 6) return hex;
  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const COLOR_PRESETS = [
  { name: 'Brand Gold (Default)', hex: '#FFCC00', hover: '#E6B800', isDarkText: true },
  { name: 'Prestige Gold', hex: '#D4AF37', hover: '#B89628', isDarkText: true },
  { name: 'Warm Amber', hex: '#F59E0B', hover: '#D97706', isDarkText: true },
  { name: 'Vibrant Orange', hex: '#F97316', hover: '#EA580C', isDarkText: false },
  { name: 'Royal London Blue', hex: '#2563EB', hover: '#1D4ED8', isDarkText: false },
  { name: 'Electric Cyan', hex: '#06B6D4', hover: '#0891B2', isDarkText: true },
  { name: 'Emerald Green', hex: '#10B981', hover: '#059669', isDarkText: false },
  { name: 'Racing Green', hex: '#047857', hover: '#065F46', isDarkText: false },
  { name: 'Crimson Red', hex: '#EF4444', hover: '#DC2626', isDarkText: false },
  { name: 'Luxury Violet', hex: '#8B5CF6', hover: '#7C3AED', isDarkText: false },
  { name: 'Modern Slate', hex: '#64748B', hover: '#475569', isDarkText: false },
  { name: 'Obsidian Black', hex: '#18181B', hover: '#09090B', isDarkText: false },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, logout, formatPrice, siteSettings, updateSiteSettingsState } = useApp();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'bookings' | 'drivers' | 'partners' | 'users' | 'vehicles' | 'inquiries' | 'settings' | 'website_settings' | 'analytics' | 'export'
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

  // SMTP & System & Website Branding Settings State
  const [settings, setSettings] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '"Quick Car Midlands Ltd" <no-reply@quickcarmidlands.co.uk>',
    admin_email: 'admin@quickcarmidlands.co.uk',
    require_email_verification: false,
    require_driver_approval: true,
    google_client_id: '',
    google_client_secret: '',
    google_maps_api_key: '',
    // Branding & Color Theme Fields
    primary_color: '#FFCC00',
    primary_hover_color: '#E6B800',
    secondary_color: '#141720',
    brand_name: 'QUICK CAR MIDLANDS LTD',
    brand_tagline: 'Airport Transfers & Private Hire | Based in Birmingham',
    logo_dark: '',
    logo_light: '',
    logo_icon: '',
    support_phone: '01212433112',
    support_email: 'qcm023@gmail.com',
    emergency_whatsapp: '00447892609314',
    office_address: 'Birmingham, West Midlands, United Kingdom',
    company_number: '12345678',
    vat_number: 'GB 123 4567 89',
    copyright_text: '© 2026 QUICK CAR MIDLANDS LTD. All rights reserved.',
    bank_name: 'Clydesdale Bank / Virgin Money UK',
    account_name: 'QUICK CAR MIDLANDS LTD',
    account_type: 'Business',
    account_number: '50470328',
    sort_code: '82-19-74',
    iban: 'GB91CLYD82197450470328',
    bic: 'CLYDGB21974',
  });

  // Database Connection & Diagnostics State
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isInitializingDb, setIsInitializingDb] = useState(false);
  const [showDbGuide, setShowDbGuide] = useState(false);

  const currentBrandName = settings.brand_name || siteSettings?.brand_name || 'Quick Car Midlands Ltd';
  const currentLogoDark = settings.logo_dark || siteSettings?.logo_dark || '';
  const currentPrimaryColor = settings.primary_color || siteSettings?.primary_color || '#FFCC00';

  // Live document title update reflecting the dynamic brand name
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${currentBrandName} - Admin OS • Operations Desk`;
    }
  }, [currentBrandName]);

  // Sync settings when siteSettings becomes available from AppContext
  useEffect(() => {
    if (siteSettings?.brand_name) {
      setSettings((prev) => ({
        ...prev,
        brand_name: siteSettings.brand_name || prev.brand_name,
        primary_color: prev.primary_color === '#FFCC00' ? siteSettings.primary_color : prev.primary_color,
        logo_dark: prev.logo_dark === '/images/quickcar-logo.png' ? siteSettings.logo_dark : prev.logo_dark,
      }));
    }
  }, [siteSettings]);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<'logo_dark' | 'logo_light' | 'logo_icon' | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Robust Logout Handler
  const handleAdminLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    try {
      localStorage.removeItem('ots_user');
      localStorage.removeItem('qcm_user');
      sessionStorage.clear();
      document.cookie = 'qcm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'ots_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e) {}
    window.location.href = '/account/login?logout=1';
  };

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, variant: 'logo_dark' | 'logo_light' | 'logo_icon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    setUploadingLogo(variant);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const variantKey = variant === 'logo_dark' ? 'dark' : variant === 'logo_light' ? 'light' : 'icon';
      formData.append('variant', variantKey);

      const res = await fetch('/api/admin/settings/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.status && data.url) {
        setSettings((prev) => ({ ...prev, [variant]: data.url }));
        if (updateSiteSettingsState) {
          updateSiteSettingsState({ [variant]: data.url });
        }
        setSettingsMessage({ type: 'success', text: `Logo uploaded successfully! Click "Save Changes" to persist permanently.` });
      } else {
        alert(data.message || 'Logo upload failed');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      alert('Network error while uploading logo.');
    } finally {
      setUploadingLogo(null);
    }
  };

  // Primary color change handler (live DOM update + state)
  const handlePrimaryColorChange = (hex: string, hoverHex?: string) => {
    const hover = hoverHex || adjustHex(hex, -25);
    setSettings((prev) => ({
      ...prev,
      primary_color: hex,
      primary_hover_color: hover,
    }));
    if (updateSiteSettingsState) {
      updateSiteSettingsState({
        primary_color: hex,
        primary_hover_color: hover,
      });
    }
  };

  // Reset to default theme
  const handleResetThemeDefaults = () => {
    if (confirm('Reset primary color and branding to Quick Car Midlands Ltd defaults?')) {
      handlePrimaryColorChange('#FFCC00', '#E6B800');
      setSettings((prev) => ({
        ...prev,
        primary_color: '#FFCC00',
        primary_hover_color: '#E6B800',
        brand_name: 'Quick Car Midlands Ltd',
        brand_tagline: 'Airport Transfers & Private Hire | Based in Birmingham',
        logo_dark: '',
        logo_light: '',
        logo_icon: '',
      }));
      if (updateSiteSettingsState) {
        updateSiteSettingsState({
          primary_color: '#FFCC00',
          primary_hover_color: '#E6B800',
          brand_name: 'Quick Car Midlands Ltd',
          brand_tagline: 'Airport Transfers & Private Hire | Based in Birmingham',
          logo_dark: '',
          logo_light: '',
          logo_icon: '',
        });
      }
    }
  };

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

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [userFormData, setUserFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    is_verified: true,
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Driver Modal State (Create / Full Edit)
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverModalMode, setDriverModalMode] = useState<'create' | 'edit'>('create');
  const [driverFormData, setDriverFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleYear: '',
    vehicleCategory: 'saloon',
    insuranceNumber: '',
    insuranceExpiry: '',
    bankName: '',
    sortCode: '',
    accountNumber: '',
    adminNotes: '',
    verificationStatus: 'approved',
    isActive: true,
  });
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);

  // Booking Modal State (Create / Edit)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalMode, setBookingModalMode] = useState<'create' | 'edit'>('create');
  const [bookingFormData, setBookingFormData] = useState({
    quoteRef: '',
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    fromLocation: '',
    toLocation: '',
    pickupDate: '',
    pickupTime: '12:00',
    passengers: 1,
    suitcases: 1,
    selectedVehicleId: 'saloon',
    totalPrice: 50,
    currency: 'GBP',
    flightNumber: '',
    specialNotes: '',
    bookingStatus: 'confirmed',
    paymentStatus: 'completed',
    driverId: '',
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Vehicle Modal State (Create / Edit)
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleModalMode, setVehicleModalMode] = useState<'create' | 'edit'>('create');
  const [vehicleFormData, setVehicleFormData] = useState({
    id: '',
    name: '',
    categoryName: '',
    image: '',
    passengers: 4,
    suitcases: 2,
    handLuggage: 2,
    description: '',
    multiplier: 1.0,
    ratePerMile: 1.50,
    minimumFare: 38.00,
    sampleVehicles: '',
    isActive: true,
  });
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  // Partner Modal State (Create / Edit)
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerModalMode, setPartnerModalMode] = useState<'create' | 'edit'>('create');
  const [partnerFormData, setPartnerFormData] = useState({
    id: 0,
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    partnerType: 'corporate_account',
    fleetSize: '',
    message: '',
    status: 'approved',
    adminNotes: '',
  });
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);

  // Analytics Date Filter
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState<'all' | 'today' | '7days' | 'month' | 'last_month'>('all');

  // Driver Document Expiry Tracking & Alerts State
  const [expiringDocs, setExpiringDocs] = useState<{
    expiringItems: Array<{
      driverId: string;
      driverName: string;
      driverEmail: string;
      documentType: 'pco' | 'insurance' | 'mot' | 'dvla';
      expiryDate: string;
      daysUntilExpiry: number;
      status: 'expired' | 'expiring_soon' | 'warning';
    }>;
    summary: { expired: number; expiringSoon: number; warning: number; total: number };
  }>({
    expiringItems: [],
    summary: { expired: 0, expiringSoon: 0, warning: 0, total: 0 },
  });
  const [isSendingExpiryNotice, setIsSendingExpiryNotice] = useState<string | null>(null);
  const [expiryNoticeResult, setExpiryNoticeResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

      // Fetch live database connection & table diagnostics
      fetch('/api/admin/db-status')
        .then((res) => res.json())
        .then((data) => {
          if (data) setDbStatus(data);
        })
        .catch(() => {});

      // Fetch driver document expiry compliance watch
      fetch('/api/admin/drivers/expiry-check?threshold=30')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status && data.expiringItems) {
            setExpiringDocs({
              expiringItems: data.expiringItems,
              summary: data.summary || { expired: 0, expiringSoon: 0, warning: 0, total: 0 },
            });
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter]);

  // Dispatch Expiry Notice Email Handler
  const handleSendExpiryAlert = async (driverId?: string) => {
    setIsSendingExpiryNotice(driverId || 'all');
    setExpiryNoticeResult(null);
    try {
      const res = await fetch('/api/admin/drivers/expiry-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: 30, sendToDrivers: true, sendToAdmins: true }),
      });
      const data = await res.json();
      if (data.status) {
        setExpiryNoticeResult({
          type: 'success',
          text: `Compliance notice email sent successfully (${data.notificationsSent} driver notification(s) delivered).`,
        });
        setTimeout(() => setExpiryNoticeResult(null), 5000);
      } else {
        setExpiryNoticeResult({
          type: 'error',
          text: data.message || 'Failed to dispatch expiry notices',
        });
      }
    } catch (e: any) {
      setExpiryNoticeResult({ type: 'error', text: 'Network error while dispatching notices.' });
    } finally {
      setIsSendingExpiryNotice(null);
    }
  };

  // Filtered Bookings for Analytics & Reporting
  const filteredAnalyticsBookings = useMemo(() => {
    if (analyticsDateFilter === 'all') return bookings;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return bookings.filter((b) => {
      const bDateStr = b.pickup_date || (b.created_at ? b.created_at.split('T')[0] : '');
      if (!bDateStr) return false;

      if (analyticsDateFilter === 'today') {
        return bDateStr === todayStr;
      }
      if (analyticsDateFilter === '7days') {
        const d = new Date(bDateStr);
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (analyticsDateFilter === 'month') {
        const d = new Date(bDateStr);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (analyticsDateFilter === 'last_month') {
        const d = new Date(bDateStr);
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      }
      return true;
    });
  }, [bookings, analyticsDateFilter]);

  // Analytics Metrics Computation
  const analyticsMetrics = useMemo(() => {
    const total = filteredAnalyticsBookings.length;
    let gross = 0;
    let completed = 0;
    let cancelled = 0;
    let active = 0;

    const vehicleBreakdown: Record<string, { count: number; revenue: number; label: string }> = {
      saloon: { count: 0, revenue: 0, label: 'Standard Saloon' },
      estate: { count: 0, revenue: 0, label: 'Estate Car' },
      'executive-saloon': { count: 0, revenue: 0, label: 'Executive Saloon' },
      mpv: { count: 0, revenue: 0, label: 'MPV 5–6 Seater' },
      'minibus-8': { count: 0, revenue: 0, label: 'Minibus 8–9 Seater' },
    };

    const airportRoutes: Record<string, { count: number; revenue: number }> = {};

    filteredAnalyticsBookings.forEach((b) => {
      const price = Number(b.total_price || 0);
      if (b.booking_status !== 'cancelled') {
        gross += price;
        active += 1;
      }
      if (b.booking_status === 'completed') {
        completed += 1;
      }
      if (b.booking_status === 'cancelled') {
        cancelled += 1;
      }

      // Class breakdown
      const vCat = (b.selected_vehicle_id || 'saloon').toLowerCase().replace(/ /g, '-');
      const normalizedCat = vCat.includes('minibus') ? 'minibus-8' : vCat.includes('exec') ? 'executive-saloon' : vCat.includes('estate') ? 'estate' : vCat.includes('mpv') ? 'mpv' : 'saloon';
      if (!vehicleBreakdown[normalizedCat]) {
        vehicleBreakdown[normalizedCat] = { count: 0, revenue: 0, label: normalizedCat };
      }
      vehicleBreakdown[normalizedCat].count += 1;
      if (b.booking_status !== 'cancelled') {
        vehicleBreakdown[normalizedCat].revenue += price;
      }

      // Airport Routes
      const text = `${b.from_location || ''} ${b.to_location || ''}`.toLowerCase();
      let airportKey = 'Regional Transfers';
      if (text.includes('birmingham') || text.includes('bhx')) airportKey = 'Birmingham (BHX)';
      else if (text.includes('heathrow') || text.includes('lhr')) airportKey = 'London Heathrow (LHR)';
      else if (text.includes('gatwick') || text.includes('lgw')) airportKey = 'London Gatwick (LGW)';
      else if (text.includes('manchester') || text.includes('man')) airportKey = 'Manchester (MAN)';
      else if (text.includes('east midlands') || text.includes('ema')) airportKey = 'East Midlands (EMA)';
      else if (text.includes('stansted') || text.includes('stn')) airportKey = 'London Stansted (STN)';
      else if (text.includes('luton') || text.includes('ltn')) airportKey = 'London Luton (LTN)';
      else if (text.includes('bristol') || text.includes('brs')) airportKey = 'Bristol (BRS)';

      if (!airportRoutes[airportKey]) {
        airportRoutes[airportKey] = { count: 0, revenue: 0 };
      }
      airportRoutes[airportKey].count += 1;
      if (b.booking_status !== 'cancelled') {
        airportRoutes[airportKey].revenue += price;
      }
    });

    const avgTicket = active > 0 ? gross / active : 0;
    const cancelRate = total > 0 ? (cancelled / total) * 100 : 0;

    return {
      total,
      gross,
      completed,
      cancelled,
      active,
      avgTicket,
      cancelRate,
      vehicleBreakdown,
      airportRoutes,
    };
  }, [filteredAnalyticsBookings]);

  // CSV Exporters
  const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBookingsCsv = () => {
    const headers = [
      'Quote Ref',
      'Pickup Date',
      'Pickup Time',
      'Passenger Name',
      'Passenger Email',
      'Passenger Phone',
      'From Location',
      'To Location',
      'Vehicle Category',
      'Fare (GBP)',
      'Payment Status',
      'Booking Status',
      'Flight Number',
      'Special Notes',
      'Created At'
    ];

    const rows = filteredAnalyticsBookings.map((b) => [
      `"${(b.quote_ref || '').replace(/"/g, '""')}"`,
      `"${(b.pickup_date || '').replace(/"/g, '""')}"`,
      `"${(b.pickup_time || '').replace(/"/g, '""')}"`,
      `"${(b.passenger_name || '').replace(/"/g, '""')}"`,
      `"${(b.passenger_email || '').replace(/"/g, '""')}"`,
      `"${(b.passenger_phone || '').replace(/"/g, '""')}"`,
      `"${(b.from_location || '').replace(/"/g, '""')}"`,
      `"${(b.to_location || '').replace(/"/g, '""')}"`,
      `"${(b.selected_vehicle_id || '').replace(/"/g, '""')}"`,
      Number(b.total_price || 0).toFixed(2),
      `"${(b.payment_status || '').replace(/"/g, '""')}"`,
      `"${(b.booking_status || '').replace(/"/g, '""')}"`,
      `"${(b.flight_number || '').replace(/"/g, '""')}"`,
      `"${(b.special_notes || '').replace(/"/g, '""')}"`,
      `"${(b.created_at || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsv(`quickcar_bookings_${analyticsDateFilter}_${dateStr}.csv`, csvContent);
  };

  const exportRevenueCsv = () => {
    const dateMap = new Map<string, { bookings: number; gross: number; completed: number; cancelled: number }>();

    filteredAnalyticsBookings.forEach((b) => {
      const d = b.pickup_date || (b.created_at ? b.created_at.split('T')[0] : 'Unknown');
      const cur = dateMap.get(d) || { bookings: 0, gross: 0, completed: 0, cancelled: 0 };
      cur.bookings += 1;
      if (b.booking_status !== 'cancelled') {
        cur.gross += Number(b.total_price || 0);
      }
      if (b.booking_status === 'completed') {
        cur.completed += 1;
      }
      if (b.booking_status === 'cancelled') {
        cur.cancelled += 1;
      }
      dateMap.set(d, cur);
    });

    const headers = ['Date', 'Bookings Count', 'Gross Revenue (GBP)', 'Completed Journeys', 'Cancelled Journeys', 'Average Fare (GBP)'];
    const sortedDates = Array.from(dateMap.keys()).sort();
    const rows = sortedDates.map((dateKey) => {
      const item = dateMap.get(dateKey)!;
      const avg = item.bookings > 0 ? (item.gross / Math.max(1, item.bookings - item.cancelled)).toFixed(2) : '0.00';
      return [
        `"${dateKey}"`,
        item.bookings,
        item.gross.toFixed(2),
        item.completed,
        item.cancelled,
        avg
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsv(`quickcar_revenue_report_${dateStr}.csv`, csvContent);
  };

  const exportDriversCsv = () => {
    const headers = [
      'Driver ID',
      'Name',
      'Email',
      'Phone',
      'Vehicle Model',
      'Vehicle Plate',
      'Vehicle Category',
      'PCO License Number',
      'PCO Expiry Date',
      'Insurance Expiry Date',
      'Verification Status',
      'Active On Duty',
      'Compliance Score (%)'
    ];

    const rows = drivers.map((d) => [
      `"${(d.id || '').replace(/"/g, '""')}"`,
      `"${(d.driver_name || '').replace(/"/g, '""')}"`,
      `"${(d.driver_email || '').replace(/"/g, '""')}"`,
      `"${(d.driver_phone || '').replace(/"/g, '""')}"`,
      `"${(d.vehicle_model || '').replace(/"/g, '""')}"`,
      `"${(d.vehicle_plate || '').replace(/"/g, '""')}"`,
      `"${(d.vehicle_category || '').replace(/"/g, '""')}"`,
      `"${(d.license_number || '').replace(/"/g, '""')}"`,
      `"${(d.pco_expiry ? String(d.pco_expiry).split('T')[0] : '').replace(/"/g, '""')}"`,
      `"${(d.insurance_expiry ? String(d.insurance_expiry).split('T')[0] : '').replace(/"/g, '""')}"`,
      `"${(d.verification_status || '').replace(/"/g, '""')}"`,
      d.is_active ? 'Yes' : 'No',
      d.completion_score !== undefined ? d.completion_score : 100
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsv(`quickcar_drivers_compliance_${dateStr}.csv`, csvContent);
  };

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

  // User CRUD Handlers
  const openCreateUserModal = () => {
    setUserModalMode('create');
    setUserFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      is_verified: true,
    });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: any) => {
    setUserModalMode('edit');
    setUserFormData({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'customer',
      password: '',
      is_verified: Boolean(u.is_verified),
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUser(true);
    try {
      const url = '/api/admin/users';
      const method = userModalMode === 'create' ? 'POST' : 'PATCH';
      const body = userModalMode === 'create'
        ? {
            name: userFormData.name,
            email: userFormData.email,
            phone: userFormData.phone,
            role: userFormData.role,
            password: userFormData.password,
            isVerified: userFormData.is_verified,
          }
        : {
            userId: userFormData.id,
            name: userFormData.name,
            email: userFormData.email,
            phone: userFormData.phone,
            role: userFormData.role,
            isVerified: userFormData.is_verified,
            ...(userFormData.password ? { password: userFormData.password } : {}),
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setIsUserModalOpen(false);
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to save user.');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Network error while saving user.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName || userId}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Network error while deleting user.');
    }
  };

  // Driver CRUD Handlers
  const openCreateDriverModal = () => {
    setDriverModalMode('create');
    setDriverFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      vehicleModel: 'Mercedes-Benz E-Class',
      vehiclePlate: '',
      vehicleYear: '2023',
      vehicleCategory: 'saloon',
      insuranceNumber: '',
      insuranceExpiry: '',
      bankName: '',
      sortCode: '',
      accountNumber: '',
      adminNotes: '',
      verificationStatus: 'approved',
      isActive: true,
    });
    setIsDriverModalOpen(true);
  };

  const openEditDriverModal = (d: any) => {
    setDriverModalMode('edit');
    setDriverFormData({
      id: d.id,
      name: d.driver_name || '',
      email: d.driver_email || '',
      phone: d.driver_phone || '',
      licenseNumber: d.license_number || '',
      vehicleModel: d.vehicle_model || '',
      vehiclePlate: d.vehicle_plate || '',
      vehicleYear: d.vehicle_year || '',
      vehicleCategory: d.vehicle_category || 'saloon',
      insuranceNumber: d.insurance_number || '',
      insuranceExpiry: d.insurance_expiry ? String(d.insurance_expiry).split('T')[0] : '',
      bankName: d.bank_name || '',
      sortCode: d.sort_code || '',
      accountNumber: d.account_number || '',
      adminNotes: d.admin_notes || '',
      verificationStatus: d.verification_status || 'approved',
      isActive: Boolean(d.is_active),
    });
    setIsDriverModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDriver(true);
    try {
      const url = '/api/admin/drivers';
      const method = driverModalMode === 'create' ? 'POST' : 'PATCH';
      const body = driverModalMode === 'create'
        ? {
            name: driverFormData.name,
            email: driverFormData.email,
            phone: driverFormData.phone,
            licenseNumber: driverFormData.licenseNumber,
            vehicleModel: driverFormData.vehicleModel,
            vehiclePlate: driverFormData.vehiclePlate,
            vehicleCategory: driverFormData.vehicleCategory,
          }
        : {
            driverId: driverFormData.id,
            name: driverFormData.name,
            email: driverFormData.email,
            phone: driverFormData.phone,
            licenseNumber: driverFormData.licenseNumber,
            vehicleModel: driverFormData.vehicleModel,
            vehiclePlate: driverFormData.vehiclePlate,
            vehicleYear: driverFormData.vehicleYear,
            vehicleCategory: driverFormData.vehicleCategory,
            insuranceNumber: driverFormData.insuranceNumber,
            insuranceExpiry: driverFormData.insuranceExpiry,
            bankName: driverFormData.bankName,
            sortCode: driverFormData.sortCode,
            accountNumber: driverFormData.accountNumber,
            adminNotes: driverFormData.adminNotes,
            verificationStatus: driverFormData.verificationStatus,
            isActive: driverFormData.isActive,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setIsDriverModalOpen(false);
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to save chauffeur.');
      }
    } catch (err) {
      console.error('Error saving driver:', err);
      alert('Network error while saving chauffeur.');
    } finally {
      setIsSubmittingDriver(false);
    }
  };

  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    if (!confirm(`Are you sure you want to delete chauffeur "${driverName || driverId}"? This will remove their driver profile and license data.`)) return;
    try {
      const res = await fetch(`/api/admin/drivers?id=${encodeURIComponent(driverId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to delete driver.');
      }
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert('Network error while deleting driver.');
    }
  };

  // Booking CRUD Handlers
  const openCreateBookingModal = () => {
    setBookingModalMode('create');
    setBookingFormData({
      quoteRef: '',
      passengerName: '',
      passengerEmail: '',
      passengerPhone: '',
      fromLocation: '',
      toLocation: '',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: '12:00',
      passengers: 1,
      suitcases: 1,
      selectedVehicleId: 'saloon',
      totalPrice: 65,
      currency: 'GBP',
      flightNumber: '',
      specialNotes: '',
      bookingStatus: 'confirmed',
      paymentStatus: 'completed',
      driverId: '',
    });
    setIsBookingModalOpen(true);
  };

  const openEditBookingModal = (b: any) => {
    setBookingModalMode('edit');
    setBookingFormData({
      quoteRef: b.quote_ref || '',
      passengerName: b.passenger_name || '',
      passengerEmail: b.passenger_email || '',
      passengerPhone: b.passenger_phone || '',
      fromLocation: b.from_location || '',
      toLocation: b.to_location || '',
      pickupDate: b.pickup_date || '',
      pickupTime: b.pickup_time || '',
      passengers: Number(b.passengers || 1),
      suitcases: Number(b.suitcases || 1),
      selectedVehicleId: b.selected_vehicle_id || 'saloon',
      totalPrice: Number(b.total_price || 0),
      currency: b.currency || 'GBP',
      flightNumber: b.flight_number || '',
      specialNotes: b.special_notes || '',
      bookingStatus: b.booking_status || 'confirmed',
      paymentStatus: b.payment_status || 'unpaid',
      driverId: b.driver_id || '',
    });
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    try {
      const url = '/api/admin/bookings';
      const method = bookingModalMode === 'create' ? 'POST' : 'PATCH';
      const body = {
        ...bookingFormData,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setIsBookingModalOpen(false);
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to save booking.');
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Network error while saving booking.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleDeleteBooking = async (quoteRef: string) => {
    if (!confirm(`Are you sure you want to permanently delete booking ref "${quoteRef}"?`)) return;
    try {
      const res = await fetch(`/api/admin/bookings?quoteRef=${encodeURIComponent(quoteRef)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to delete booking.');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Network error while deleting booking.');
    }
  };

  // Vehicle CRUD Handlers (Fleet classes are fixed to the 5 official categories)
  const openCreateVehicleModal = () => {
    alert('Vehicle classes are fixed to the 5 official rate card categories. You can adjust rates, capacities, and settings for each class by clicking "Edit Rates & Details".');
  };

  const openEditVehicleModal = (v: any) => {
    setVehicleModalMode('edit');
    setVehicleFormData({
      id: v.id,
      name: v.name || '',
      categoryName: v.categoryName || '',
      image: v.image || '',
      passengers: Number(v.passengers || 4),
      suitcases: Number(v.suitcases || 2),
      handLuggage: Number(v.handLuggage || 2),
      description: v.description || '',
      multiplier: Number(v.multiplier || 1.0),
      ratePerMile: Number(v.ratePerMile !== undefined ? v.ratePerMile : (v.id === 'saloon' ? 1.50 : v.id === 'estate' ? 1.70 : v.id === 'executive-saloon' ? 1.90 : v.id === 'mpv' ? 2.05 : 2.55)),
      minimumFare: Number(v.minimumFare !== undefined ? v.minimumFare : (v.id === 'saloon' ? 38.00 : v.id === 'estate' ? 42.00 : v.id === 'executive-saloon' ? 48.00 : v.id === 'mpv' ? 52.00 : 65.00)),
      sampleVehicles: v.sampleVehicles || '',
      isActive: v.isActive !== false,
    });
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVehicle(true);
    try {
      const url = '/api/admin/vehicles';
      const method = vehicleModalMode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleFormData),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setIsVehicleModalOpen(false);
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to save vehicle class.');
      }
    } catch (err) {
      console.error('Error saving vehicle:', err);
      alert('Network error while saving vehicle class.');
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(`Are you sure you want to delete vehicle class "${vehicleName || vehicleId}"?`)) return;
    try {
      const res = await fetch(`/api/admin/vehicles?id=${encodeURIComponent(vehicleId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to delete vehicle class.');
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert('Network error while deleting vehicle class.');
    }
  };

  // Partner CRUD Handlers
  const openCreatePartnerModal = () => {
    setPartnerModalMode('create');
    setPartnerFormData({
      id: 0,
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      partnerType: 'corporate_account',
      fleetSize: '',
      message: '',
      status: 'approved',
      adminNotes: '',
    });
    setIsPartnerModalOpen(true);
  };

  const openEditPartnerModal = (p: any) => {
    setPartnerModalMode('edit');
    setPartnerFormData({
      id: p.id,
      companyName: p.company_name || '',
      contactName: p.contact_name || '',
      email: p.email || '',
      phone: p.phone || '',
      partnerType: p.partner_type || 'corporate_account',
      fleetSize: p.fleet_size || '',
      message: p.notes || p.message || '',
      status: p.status || 'new',
      adminNotes: p.admin_notes || '',
    });
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPartner(true);
    try {
      const url = '/api/admin/partners';
      const method = partnerModalMode === 'create' ? 'POST' : 'PATCH';
      const body = partnerModalMode === 'create'
        ? {
            companyName: partnerFormData.companyName,
            contactName: partnerFormData.contactName,
            email: partnerFormData.email,
            phone: partnerFormData.phone,
            partnerType: partnerFormData.partnerType,
            fleetSize: partnerFormData.fleetSize,
            message: partnerFormData.message,
            status: partnerFormData.status,
            adminNotes: partnerFormData.adminNotes,
          }
        : {
            id: partnerFormData.id,
            companyName: partnerFormData.companyName,
            contactName: partnerFormData.contactName,
            email: partnerFormData.email,
            phone: partnerFormData.phone,
            partnerType: partnerFormData.partnerType,
            fleetSize: partnerFormData.fleetSize,
            notes: partnerFormData.message,
            status: partnerFormData.status,
            adminNotes: partnerFormData.adminNotes,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setIsPartnerModalOpen(false);
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to save partner application.');
      }
    } catch (err) {
      console.error('Error saving partner:', err);
      alert('Network error while saving partner.');
    } finally {
      setIsSubmittingPartner(false);
    }
  };

  const handleDeletePartner = async (partnerId: number, companyName: string) => {
    if (!confirm(`Are you sure you want to delete partner "${companyName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/partners?id=${partnerId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to delete partner.');
      }
    } catch (err) {
      console.error('Error deleting partner:', err);
      alert('Network error while deleting partner.');
    }
  };

  // Inquiry Delete Handler
  const handleDeleteInquiry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status) {
        await loadAdminData();
      } else {
        alert(data.message || 'Failed to delete inquiry.');
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      alert('Network error while deleting inquiry.');
    }
  };

  // Save System & Website Branding Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        setSettingsMessage({ type: 'success', text: data.message || 'Settings saved successfully! Live theme updated across the website.' });
        if (updateSiteSettingsState) {
          updateSiteSettingsState(settings as any);
        }
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

  // Test MySQL Connection & Refresh Pool
  const handleTestDbConnection = async () => {
    setIsCheckingDb(true);
    try {
      const res = await fetch('/api/admin/db-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      const data = await res.json();
      setDbStatus(data);
      if (data.connected) {
        setSettingsMessage({
          type: 'success',
          text: `MySQL Connection Successful! Ping: ${data.latencyMs}ms. Connected to ${data.config?.host}:${data.config?.port}/${data.config?.database}`,
        });
      } else {
        setSettingsMessage({
          type: 'error',
          text: `MySQL Connection Offline: ${data.error || data.message}. ${data.hint || ''}`,
        });
      }
    } catch (e: any) {
      setSettingsMessage({ type: 'error', text: `Failed to test database: ${e.message}` });
    } finally {
      setIsCheckingDb(false);
    }
  };

  // Initialize / Repair Database Tables & Seed Baseline
  const handleInitDbSchema = async () => {
    if (!confirm('This will create all missing tables (users, drivers, bookings, vehicles, system_settings, contact_inquiries, reviews, partner_applications) and seed default records if empty. Continue?')) {
      return;
    }
    setIsInitializingDb(true);
    try {
      const res = await fetch('/api/admin/db-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init_schema' }),
      });
      const data = await res.json();
      if (data.status) {
        setSettingsMessage({
          type: 'success',
          text: `Database Schema Initialized! Tables: ${(data.tablesCreated || []).join(', ')}. ${data.seededItems?.length ? 'Seeded: ' + data.seededItems.join(', ') : ''}`,
        });
        await loadAdminData();
      } else {
        setSettingsMessage({
          type: 'error',
          text: `Schema Init Failed: ${data.message}. ${data.error || ''}`,
        });
      }
    } catch (e: any) {
      setSettingsMessage({ type: 'error', text: `Database init error: ${e.message}` });
    } finally {
      setIsInitializingDb(false);
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
        {
          id: 'drivers',
          label: 'Fleet & Chauffeurs',
          icon: ShieldCheck,
          badge: expiringDocs.summary.total > 0
            ? `${expiringDocs.summary.total} alert${expiringDocs.summary.total > 1 ? 's' : ''}`
            : pendingDriversCount > 0
            ? `${pendingDriversCount} pending`
            : null,
          badgeColor: expiringDocs.summary.expired > 0 ? 'bg-red-500' : 'bg-amber-500',
        },
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
      group: 'ANALYTICS & REPORTS',
      items: [
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart2, badge: null },
        { id: 'export', label: 'Data Exports', icon: Download, badge: null },
      ],
    },
    {
      group: 'CONFIGURATION',
      items: [
        { id: 'website_settings', label: 'Website & Branding', icon: Palette, badge: 'Live Theme', badgeColor: 'bg-amber-400 text-gray-950 font-black' },
        {
          id: 'settings',
          label: 'SMTP & Database',
          icon: Settings,
          badge: dbStatus ? (dbStatus.connected ? 'DB OK' : 'DB Offline') : null,
          badgeColor: dbStatus?.connected ? 'bg-emerald-500' : 'bg-red-500',
        },
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
        {/* Sidebar Header: Brand Name & Logo */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group min-w-0" title={`Visit ${currentBrandName} Website`}>
              {currentLogoDark ? (
                <div className="flex items-center space-x-2 min-w-0">
                  <img
                    src={currentLogoDark}
                    alt={currentBrandName}
                    className="h-10 w-auto max-w-[150px] object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="hidden xl:flex items-center space-x-1.5 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Live
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    style={{ backgroundColor: currentPrimaryColor }}
                    className="w-10 h-10 rounded-xl text-gray-950 font-black flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
                  >
                    {currentBrandName.trim().split(/\s+/)[0]?.charAt(0)?.toUpperCase() || 'Q'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1 whitespace-nowrap overflow-hidden">
                      <span className="font-extrabold text-white text-base tracking-wider flex-shrink-0">
                        {currentBrandName.trim().split(/\s+/)[0] || 'Quick'}
                      </span>
                      {currentBrandName.trim().split(/\s+/).slice(1).join(' ') ? (
                        <span
                          style={{ color: currentPrimaryColor }}
                          className="font-light text-base tracking-wider truncate max-w-[110px]"
                        >
                          {currentBrandName.trim().split(/\s+/).slice(1).join(' ')}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        Admin OS &bull; Live
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Link>

            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg flex-shrink-0"
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
                {user?.email || 'admin@quickcarmidlands.co.uk'}
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
              type="button"
              onClick={handleAdminLogout}
              disabled={isLoggingOut}
              className="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/40 rounded-xl font-bold flex items-center justify-center space-x-1 transition text-[11px] disabled:opacity-50 cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5 text-red-400" />
              )}
              <span>{isLoggingOut ? 'Signing Out...' : 'Log Out'}</span>
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
              <span className="font-semibold text-slate-500">{currentBrandName} Operations</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-black text-slate-900 capitalize tracking-wide">
                {activeTab === 'dashboard' ? 'Overview Cockpit' : activeTab === 'website_settings' ? 'Website & Branding' : activeTab}
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

            {/* Quick Header Sign Out */}
            <button
              type="button"
              onClick={handleAdminLogout}
              disabled={isLoggingOut}
              title="Sign Out of Admin"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 transition text-xs font-bold disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
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
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{formatPrice(Number(stats.totalRevenue || 0))}</div>
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
                              Passenger: <strong className="text-slate-700">{b.passenger_name || 'Guest'}</strong> &bull; Fare: <strong className="text-slate-900">{formatPrice(Number(b.total_price || 0))}</strong>
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
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                        <Server className="w-4 h-4 text-slate-500" />
                        <span>System Status</span>
                      </h3>
                      <button
                        onClick={handleTestDbConnection}
                        disabled={isCheckingDb}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center space-x-1"
                        title="Ping Database"
                      >
                        <RefreshCw className={`w-3 h-3 ${isCheckingDb ? 'animate-spin' : ''}`} />
                        <span>Ping</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center space-x-1.5">
                          <Database className="w-3.5 h-3.5 text-slate-400" />
                          <span>MySQL Database</span>
                        </span>
                        {dbStatus?.connected ? (
                          <span className="font-mono font-bold text-emerald-600 flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Connected ({dbStatus.latencyMs}ms)</span>
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-red-600 flex items-center space-x-1.5" title={dbStatus?.error}>
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span>Disconnected</span>
                          </span>
                        )}
                      </div>

                      {dbStatus && (
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center justify-between">
                          <span>{dbStatus.config?.host}:{dbStatus.config?.port}</span>
                          <span className="truncate max-w-[120px]">{dbStatus.config?.database}</span>
                        </div>
                      )}

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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openCreateBookingModal}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 min-h-[36px]"
                  >
                    <Plus className="w-4 h-4 text-ots-yellow" />
                    <span>Create Booking</span>
                  </button>

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
                            <span className="font-black text-slate-900 text-sm block">{formatPrice(Number(b.total_price || 0))}</span>
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
                            <div className="flex items-center justify-end space-x-1.5">
                              <Link
                                href={`/booking-confirmation?ref=${b.quote_ref}`}
                                target="_blank"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg inline-flex items-center space-x-1 min-h-[32px]"
                                title="View Customer Voucher"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Voucher</span>
                              </Link>

                              <button
                                onClick={() => openEditBookingModal(b)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg inline-flex items-center space-x-1 min-h-[32px]"
                                title="Edit Booking Details"
                              >
                                <Pencil className="w-3.5 h-3.5 text-slate-600" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteBooking(b.quote_ref)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition min-h-[32px] min-w-[32px] flex items-center justify-center"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>

                            {b.booking_status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateBooking(b.quote_ref, { status: 'completed' })}
                                className="block w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                              >
                                Mark Completed
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Registered Driver Fleet</h2>
                  <p className="text-xs text-slate-500">TfL / Local Council Private Hire licensed chauffeurs &amp; compliance dossiers</p>
                </div>
                <button
                  onClick={openCreateDriverModal}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 min-h-[36px] self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-ots-yellow" />
                  <span>Onboard Chauffeur</span>
                </button>
              </div>

              {/* Compliance & Document Expiry Watch Banner / Control Panel */}
              {expiryNoticeResult && (
                <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
                  expiryNoticeResult.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {expiryNoticeResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{expiryNoticeResult.text}</span>
                </div>
              )}

              <div className={`p-5 rounded-2xl border ${
                expiringDocs.summary.expired > 0 ? 'bg-red-50/60 border-red-200' : expiringDocs.summary.total > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className={`w-5 h-5 ${expiringDocs.summary.expired > 0 ? 'text-red-600' : 'text-amber-600'}`} />
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Chauffeur Compliance &amp; Document Expiry Watch
                      </h3>
                      {expiringDocs.summary.total > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                          {expiringDocs.summary.total} Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      Monitors TfL &amp; council PCO driver licenses, private hire vehicle insurance policies, and annual PHV MOT certificates. Automated warning notices ensure zero non-compliant journeys.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-black">
                      <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg border border-red-200">
                        {expiringDocs.summary.expired} Expired
                      </span>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg border border-amber-200">
                        {expiringDocs.summary.expiringSoon} &le; 7 Days
                      </span>
                      <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">
                        {expiringDocs.summary.warning} &le; 30 Days
                      </span>
                    </div>

                    <button
                      onClick={() => handleSendExpiryAlert()}
                      disabled={isSendingExpiryNotice !== null || expiringDocs.summary.total === 0}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 disabled:opacity-40"
                    >
                      {isSendingExpiryNotice === 'all' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-ots-yellow" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-ots-yellow" />
                      )}
                      <span>Dispatch Renewal Notices</span>
                    </button>
                  </div>
                </div>

                {/* List of Expiring / Expired Items */}
                {expiringDocs.expiringItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                          <th className="pb-2">Chauffeur</th>
                          <th className="pb-2">Document</th>
                          <th className="pb-2">Expiry Date</th>
                          <th className="pb-2">Remaining</th>
                          <th className="pb-2">Compliance Status</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {expiringDocs.expiringItems.map((item, idx) => (
                          <tr key={`${item.driverId}-${item.documentType}-${idx}`} className="hover:bg-white/50">
                            <td className="py-2.5 font-bold text-slate-900">
                              {item.driverName}
                              <span className="block text-[10px] text-slate-400 font-mono">{item.driverEmail}</span>
                            </td>
                            <td className="py-2.5 uppercase font-mono font-bold text-slate-700">
                              {item.documentType === 'pco' ? 'PCO License' : item.documentType === 'insurance' ? 'Fleet Insurance' : 'PHV MOT'}
                            </td>
                            <td className="py-2.5 font-mono">{item.expiryDate ? item.expiryDate.split('T')[0] : 'N/A'}</td>
                            <td className="py-2.5 font-bold">
                              {item.daysUntilExpiry < 0 ? (
                                <span className="text-red-600">Expired {Math.abs(item.daysUntilExpiry)}d ago</span>
                              ) : item.daysUntilExpiry === 0 ? (
                                <span className="text-red-600">Expires Today</span>
                              ) : (
                                <span className="text-amber-700">{item.daysUntilExpiry} days left</span>
                              )}
                            </td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                item.status === 'expired'
                                  ? 'bg-red-600 text-white'
                                  : item.status === 'expiring_soon'
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-yellow-200 text-yellow-900'
                              }`}>
                                {item.status === 'expired' ? 'CRITICAL / EXPIRED' : item.status === 'expiring_soon' ? 'EXPIRING SOON' : 'WARNING'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => handleSendExpiryAlert(item.driverId)}
                                disabled={isSendingExpiryNotice === item.driverId}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300 shadow-xs transition"
                              >
                                {isSendingExpiryNotice === item.driverId ? 'Sending...' : 'Send Alert Email'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {drivers.map((d) => {
                  const score = d.completion_score !== undefined && d.completion_score !== null ? Number(d.completion_score) : (d.license_number ? 75 : 0);
                  const isVerified = d.verification_status === 'approved';
                  const isPending = d.verification_status === 'pending_approval' || (score === 100 && !isVerified);

                  const driverExpiringItems = expiringDocs.expiringItems.filter(item => item.driverId === d.id);
                  const hasExpired = driverExpiringItems.some(i => i.status === 'expired');
                  const hasExpiringSoon = driverExpiringItems.some(i => i.status === 'expiring_soon' || i.status === 'warning');

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
                            {hasExpired ? (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white mt-1 uppercase tracking-wider">
                                ⚠️ Doc Expired
                              </span>
                            ) : hasExpiringSoon ? (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black mt-1 uppercase tracking-wider">
                                ⏳ Expiry &le; 30d
                              </span>
                            ) : null}
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

                        {/* Edit and Delete Chauffeur Actions */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => openEditDriverModal(d)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 min-h-[34px]"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-600" />
                            <span>Edit Chauffeur</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(d.id, d.driver_name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition min-h-[34px] min-w-[34px] flex items-center justify-center"
                            title="Delete Driver"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openCreatePartnerModal}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 min-h-[36px]"
                  >
                    <Plus className="w-4 h-4 text-ots-yellow" />
                    <span>Add Partner</span>
                  </button>

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
                              href={`mailto:${p.email}?subject=${encodeURIComponent(currentBrandName)} Partnership - ${encodeURIComponent(p.company_name)}`}
                              className="py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition text-center flex items-center justify-center space-x-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </a>
                          </div>

                          {/* Edit and Delete Partner Actions */}
                          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => openEditPartnerModal(p)}
                              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1 min-h-[32px]"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => handleDeletePartner(p.id, p.company_name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title="Delete Partner Application"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openCreateUserModal}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 min-h-[36px]"
                  >
                    <Plus className="w-4 h-4 text-ots-yellow" />
                    <span>Add New User</span>
                  </button>

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
                        <th className="p-4 text-right">Actions</th>
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
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition inline-flex items-center space-x-1 min-h-[32px]"
                                title="Edit User Details & Password"
                              >
                                <Pencil className="w-3.5 h-3.5 text-slate-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition min-h-[32px] min-w-[32px] flex items-center justify-center"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-base font-extrabold text-slate-900">Official Vehicle Fleet &amp; Adjustable Rates</h2>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      5 Protected Categories
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fleet classes are fixed to your official rate card. Click &quot;Edit Rates &amp; Details&quot; on any category below to adjust its Rate per Mile, Minimum Fare, or vehicle capacity.
                  </p>
                </div>
                <div className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Fixed Fleet (5 Official Categories)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {vehicles.map((v) => (
                  <div key={v.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-black text-slate-900 text-sm">{v.name}</h3>
                          <span className="text-[11px] text-slate-400 font-mono block">{v.id} &bull; {v.categoryName}</span>
                        </div>
                        <span className="font-mono text-xs font-black bg-slate-100 px-2 py-1 rounded-lg">
                          {v.multiplier}x Rate
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                        {/* Live Adjustable Rates */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium">Rate per Mile:</span>
                          <strong className="text-emerald-700 font-black text-xs">
                            £{Number(v.ratePerMile !== undefined ? v.ratePerMile : (v.id === 'saloon' ? 1.50 : v.id === 'estate' ? 1.70 : v.id === 'executive-saloon' ? 1.90 : v.id === 'mpv' ? 2.05 : 2.55)).toFixed(2)} / mi
                          </strong>
                        </div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium">Minimum Fare:</span>
                          <strong className="text-slate-900 font-black text-xs">
                            £{Number(v.minimumFare !== undefined ? v.minimumFare : (v.id === 'saloon' ? 38.00 : v.id === 'estate' ? 42.00 : v.id === 'executive-saloon' ? 48.00 : v.id === 'mpv' ? 52.00 : 65.00)).toFixed(2)}
                          </strong>
                        </div>
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
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
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

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-500 font-semibold">{v.isActive !== false ? 'Active' : 'Offline'}</span>
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

                      {/* Edit Details Action (Protected Fixed Fleet - No Delete) */}
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => openEditVehicleModal(v)}
                          className="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 min-h-[34px] shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5 text-ots-yellow" />
                          <span>Edit Rates &amp; Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Official Customer Rate Card & Birmingham Fixed Airport Fares Reference */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        2026 Pricing Matrix
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Official Birmingham Rate Card & Fixed Airport Transfer Rates
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Integrated directly into the live quotation engine for instant fixed pricing & mileage calculations.
                    </p>
                  </div>
                  <Link
                    href="/rates"
                    target="_blank"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition"
                  >
                    <span>View Public Rate Card Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Standard Saloon</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">£1.50 <span className="text-xs font-semibold text-slate-500">/ mile</span></div>
                    <div className="text-[11px] text-slate-500 mt-1">Min Fare: <strong className="text-slate-800">£38.00</strong></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Estate Car</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">£1.70 <span className="text-xs font-semibold text-slate-500">/ mile</span></div>
                    <div className="text-[11px] text-slate-500 mt-1">Min Fare: <strong className="text-slate-800">£42.00</strong></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Executive Saloon</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">£1.90 <span className="text-xs font-semibold text-slate-500">/ mile</span></div>
                    <div className="text-[11px] text-slate-500 mt-1">Min Fare: <strong className="text-slate-800">£48.00</strong></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">MPV (5-6 Pax)</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">£2.05 <span className="text-xs font-semibold text-slate-500">/ mile</span></div>
                    <div className="text-[11px] text-slate-500 mt-1">Min Fare: <strong className="text-slate-800">£52.00</strong></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Minibus (8-9 Pax)</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">£2.55 <span className="text-xs font-semibold text-slate-500">/ mile</span></div>
                    <div className="text-[11px] text-slate-500 mt-1">Min Fare: <strong className="text-slate-800">£65.00</strong></div>
                  </div>
                </div>

                {/* Fixed Airport Transfers Quick Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-2.5 px-3">UK Airport Destination</th>
                        <th className="py-2.5 px-3">Miles</th>
                        <th className="py-2.5 px-3">Saloon</th>
                        <th className="py-2.5 px-3">Estate</th>
                        <th className="py-2.5 px-3">Executive</th>
                        <th className="py-2.5 px-3">MPV</th>
                        <th className="py-2.5 px-3">Minibus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                      {[
                        { name: 'Birmingham (BHX)', miles: 'Local', s: '£38', e: '£42', ex: '£48', mpv: '£52', mb: '£65' },
                        { name: 'East Midlands (EMA)', miles: '37 mi', s: '£86', e: '£96', ex: '£108', mpv: '£108', mb: '£133' },
                        { name: 'Manchester (MAN)', miles: '91 mi', s: '£148', e: '£166', ex: '£186', mpv: '£186', mb: '£229' },
                        { name: 'London Luton (LTN)', miles: '82 mi', s: '£153', e: '£171', ex: '£193', mpv: '£193', mb: '£237' },
                        { name: 'Liverpool (LPL)', miles: '103 mi', s: '£168', e: '£188', ex: '£212', mpv: '£212', mb: '£260' },
                        { name: 'London Heathrow (LHR)', miles: '104 mi', s: '£174', e: '£195', ex: '£219', mpv: '£219', mb: '£270' },
                        { name: 'Bristol (BRS)', miles: '105 mi', s: '£175', e: '£196', ex: '£220', mpv: '£220', mb: '£271' },
                        { name: 'London Stansted (STN)', miles: '117 mi', s: '£188', e: '£211', ex: '£237', mpv: '£237', mb: '£291' },
                        { name: 'Cardiff (CWL)', miles: '127 mi', s: '£201', e: '£225', ex: '£253', mpv: '£253', mb: '£312' },
                        { name: 'Leeds Bradford (LBA)', miles: '124 mi', s: '£210', e: '£235', ex: '£265', mpv: '£265', mb: '£326' },
                        { name: 'London Gatwick (LGW)', miles: '141 mi', s: '£219', e: '£245', ex: '£276', mpv: '£276', mb: '£339' },
                        { name: 'Newcastle (NCL)', miles: '210 mi', s: '£314', e: '£352', ex: '£396', mpv: '£396', mb: '£487' },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition">
                          <td className="py-2 px-3 font-sans font-bold text-slate-900">{r.name}</td>
                          <td className="py-2 px-3 text-slate-500">{r.miles}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{r.s}</td>
                          <td className="py-2 px-3">{r.e}</td>
                          <td className="py-2 px-3 text-amber-700 font-bold">{r.ex}</td>
                          <td className="py-2 px-3">{r.mpv}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{r.mb}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

                      <div className="flex items-center space-x-2">
                        {inq.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveInquiry(inq.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition whitespace-nowrap min-h-[38px]"
                          >
                            Mark as Resolved
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
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
            <div className="space-y-6 max-w-4xl">
              {/* CARD 1: MYSQL DATABASE CONNECTION & INFRASTRUCTURE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Database className="w-5 h-5 text-slate-800" />
                      <h2 className="text-base font-extrabold text-slate-900">
                        MySQL Database Connection &amp; Diagnostics
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live connection status, database tables inspector, and auto-migration tools
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleTestDbConnection}
                      disabled={isCheckingDb}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
                      <span>{isCheckingDb ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInitDbSchema}
                      disabled={isInitializingDb}
                      className="px-4 py-2 bg-ots-yellow hover:bg-yellow-400 text-gray-950 font-black rounded-xl text-xs shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <HardDrive className={`w-3.5 h-3.5 ${isInitializingDb ? 'animate-spin' : ''}`} />
                      <span>{isInitializingDb ? 'Initializing...' : 'Initialize / Repair Tables'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Indicator Banner */}
                {dbStatus?.connected ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-900">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center space-x-2">
                        <span>Database Online &amp; Synchronized</span>
                        <span className="font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
                          {dbStatus.latencyMs}ms latency
                        </span>
                      </div>
                      <p className="text-emerald-700 mt-0.5">
                        Connected to host <strong className="font-mono">{dbStatus.config?.host}:{dbStatus.config?.port}</strong> with database <strong className="font-mono">{dbStatus.config?.database}</strong>. All bookings, users, and fleet records are persisting to MySQL.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs text-red-900">
                    <div className="flex items-center space-x-2 font-bold text-red-800">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>Database Connection Offline (Operating in In-Memory Fallback Mode)</span>
                    </div>
                    {dbStatus?.error && (
                      <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-red-200 text-red-700 break-all">
                        {dbStatus.error}
                      </div>
                    )}
                    {dbStatus?.hint && (
                      <p className="text-red-700">
                        <strong>Action Needed:</strong> {dbStatus.hint}
                      </p>
                    )}
                  </div>
                )}

                {/* Configuration Breakdown Grid */}
                {dbStatus?.config && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Host &amp; Port</span>
                      <span className="font-mono font-bold text-slate-800 mt-0.5 block truncate">
                        {dbStatus.config.host}:{dbStatus.config.port}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Database</span>
                      <span className="font-mono font-bold text-slate-800 mt-0.5 block truncate">
                        {dbStatus.config.database}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Username</span>
                      <span className="font-mono font-bold text-slate-800 mt-0.5 block truncate">
                        {dbStatus.config.user}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">SSL Mode</span>
                      <span className={`font-mono font-bold mt-0.5 block ${dbStatus.config.isSsl ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {dbStatus.config.isSsl ? 'Active (Cloud SSL)' : 'Disabled (Local)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tables & Row Counts */}
                {dbStatus?.tables && dbStatus.tables.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Active Database Tables ({dbStatus.tables.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {dbStatus.tables.map((t: any) => (
                        <div key={t.name} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                          <span className="font-mono font-semibold text-slate-700">{t.name}</span>
                          <span className="text-[11px] font-bold text-slate-500">{t.rows >= 0 ? `${t.rows} rows` : 'Active'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsible Live Server Setup Guide */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDbGuide(!showDbGuide)}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition"
                  >
                    <span className="flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span>Live Server Setup Guide (AWS Lightsail, VPS, Railway, Vercel)</span>
                    </span>
                    <span className="text-slate-400 font-normal">{showDbGuide ? '▲ Hide' : '▼ View Setup Steps'}</span>
                  </button>

                  {showDbGuide && (
                    <div className="p-4 bg-white border-t border-slate-200 space-y-3 text-xs text-slate-600 leading-relaxed">
                      <div>
                        <strong className="text-slate-900 block mb-1">1. Set Database Credentials in .env:</strong>
                        <p>On your server (e.g. <code>/var/www/saim_web/.env</code>), ensure your MySQL credentials are set:</p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto">
{`MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=quickcar_user
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=quickcar_db
# Or use complete connection URL:
DATABASE_URL="mysql://quickcar_user:your_secure_password@127.0.0.1:3306/quickcar_db"`}
                        </pre>
                      </div>

                      <div>
                        <strong className="text-slate-900 block mb-1">2. Create Database &amp; User in MySQL (Ubuntu/Lightsail):</strong>
                        <p>SSH into your server and run in terminal:</p>
                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto">
{`sudo mysql -u root
CREATE DATABASE IF NOT EXISTS quickcar_db;
CREATE USER IF NOT EXISTS 'quickcar_user'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'your_secure_password';
GRANT ALL PRIVILEGES ON quickcar_db.* TO 'quickcar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;`}
                        </pre>
                      </div>

                      <div>
                        <strong className="text-slate-900 block mb-1">3. Initialize Tables:</strong>
                        <p>Click the yellow <strong>"Initialize / Repair Tables"</strong> button above, or run <code>npm run db:init</code> in your server folder.</p>
                      </div>

                      <div>
                        <strong className="text-slate-900 block mb-1">4. Reload PM2:</strong>
                        <p>Run <code>pm2 reload saim_web --update-env</code> to apply the new environment variables.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: SMTP SERVER & GATEWAY SETTINGS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
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
                      placeholder="e.g. notifications@quickcarmidlands.co.uk"
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

            {/* CARD 2: GOOGLE MAPS PLATFORM & CLOUD INTEGRATIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Navigation className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Google Maps Platform &amp; Routing APIs
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Powers live UK address autocomplete, road mileage calculation, and interactive route mapping.
                  </p>
                </div>

                <div>
                  {settings.google_maps_api_key && settings.google_maps_api_key.length > 10 ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Google Maps Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Internal UK Matrix Active (Fallback)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1">
                    Google Maps API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={settings.google_maps_api_key}
                      onChange={(e) => setSettings({ ...settings, google_maps_api_key: e.target.value })}
                      placeholder="AIzaSy..."
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono"
                    />
                    {settings.google_maps_api_key && (
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, google_maps_api_key: '' })}
                        className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 transition"
                        title="Clear API Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      disabled={isSavingSettings}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition shadow flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5 text-ots-yellow" />
                      <span>Save Key</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Saved securely in your database. Alternatively, set <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> in your environment.
                  </p>
                </div>

                {/* 5 Required APIs Reference Grid */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                      Required Google Cloud APIs for Quick Car Midlands Ltd:
                    </span>
                    <a
                      href="https://developers.google.com/maps/apis-by-platform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      <span>Google APIs Directory</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>Places API</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Live UK address, postcode &amp; airport autocomplete in booking inputs.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Distance Matrix API</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Calculates exact driving mileage and travel duration for quotation pricing.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        <span>Maps JavaScript API</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Renders the interactive route map container on quote &amp; funnel pages.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Directions API</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Plots turn-by-turn driving polyline and waypoint markers on the map.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>Geocoding API</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Converts UK postal codes and address queries into GPS coordinates.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        <span>Google Cloud Console</span>
                      </div>
                      <a
                        href="https://console.cloud.google.com/google/maps-apis/overview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:underline mt-1 flex items-center space-x-1"
                      >
                        <span>Manage Keys &amp; Quotas</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Google OAuth Login Credentials Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="p-1 bg-red-50 text-red-600 rounded">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Google OAuth (Sign In with Google)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">
                        Google Client ID
                      </label>
                      <input
                        type="text"
                        value={settings.google_client_id}
                        onChange={(e) => setSettings({ ...settings, google_client_id: e.target.value })}
                        placeholder="apps.googleusercontent.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">
                        Google Client Secret
                      </label>
                      <input
                        type="password"
                        value={settings.google_client_secret}
                        onChange={(e) => setSettings({ ...settings, google_client_secret: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 8: WEBSITE SETTINGS, BRANDING & LIVE THEME
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'website_settings' && (
            <div className="space-y-6 max-w-5xl pb-12">
              
              {/* Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-ots-yellow text-gray-950 flex items-center justify-center font-black shadow-sm">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Website Settings &amp; Brand Identity</h2>
                      <p className="text-xs text-slate-500">
                        Configure primary theme colors, header &amp; voucher logos, and official business details across the web
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetThemeDefaults}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Theme Defaults</span>
                  </button>
                  <Link
                    href="/"
                    target="_blank"
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow"
                  >
                    <Globe className="w-3.5 h-3.5 text-ots-yellow" />
                    <span>View Live Website</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {settingsMessage && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                  settingsMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {settingsMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  <span>{settingsMessage.text}</span>
                </div>
              )}

              {/* CARD 1: LIVE THEME INTERACTIVE PREVIEW */}
              <div className="bg-[#121622] rounded-2xl border border-slate-800 p-6 text-white space-y-5 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-ots-yellow" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-slate-300">
                      Live Real-Time Theme Preview
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="font-mono bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300">
                      --ots-primary: <span className="font-bold text-white">{settings.primary_color}</span>
                    </span>
                  </div>
                </div>

                {/* Simulated Website Header Mockup */}
                <div className="rounded-xl bg-black/90 border border-slate-800 p-3.5 flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-3">
                    {settings.logo_dark ? (
                      <img 
                        src={settings.logo_dark} 
                        alt="Header Logo Preview" 
                        className="h-8 max-w-[160px] object-contain" 
                      />
                    ) : (
                      <div className="flex items-center space-x-2 font-black text-sm">
                        <div 
                          style={{ backgroundColor: settings.primary_color }}
                          className="w-8 h-8 rounded-lg text-gray-950 flex items-center justify-center text-xs font-black shadow"
                        >
                          {settings.brand_name?.charAt(0) || 'Q'}
                        </div>
                        <span className="text-white font-extrabold">{settings.brand_name || 'Quick Car Midlands Ltd'}</span>
                      </div>
                    )}
                  </div>

                  <div className="hidden md:flex items-center space-x-5 text-xs text-slate-300 font-medium">
                    <span className="hover:text-white cursor-pointer transition">Airport Transfers</span>
                    <span className="hover:text-white cursor-pointer transition">Executive Chauffeurs</span>
                    <span className="hover:text-white cursor-pointer transition">Partner Program</span>
                    <span className="hover:text-white cursor-pointer transition">Help</span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      style={{ backgroundColor: settings.primary_color }}
                      className="px-4 py-2 rounded-xl font-black text-xs text-gray-950 shadow transition hover:opacity-95"
                    >
                      Instant Quote →
                    </button>
                  </div>
                </div>

                {/* Simulated Booking Hero Card */}
                <div className="rounded-xl bg-gradient-to-br from-slate-900 to-[#141720] border border-slate-800 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span 
                      style={{ backgroundColor: settings.primary_color }} 
                      className="text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    >
                      ★ 24/7 UK AIRPORT TRANSFERS
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {settings.brand_tagline}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white">
                    Premium Airport &amp; City Travel with{' '}
                    <span style={{ color: settings.primary_color }}>
                      {settings.brand_name}
                    </span>
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <div className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300">
                      📍 Pick-up: London Heathrow Airport (LHR)
                    </div>
                    <div className="w-full sm:flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300">
                      🏁 Drop-off: Central London Hotels
                    </div>
                    <button
                      type="button"
                      style={{ backgroundColor: settings.primary_color }}
                      className="w-full sm:w-auto px-5 py-2 rounded-xl font-black text-xs text-gray-950 shadow whitespace-nowrap"
                    >
                      Search Fares
                    </button>
                  </div>
                </div>

                {/* Diagnostic Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-[11px]">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Primary Color</span>
                    <div className="flex items-center justify-center space-x-1.5 font-mono font-bold text-white text-xs">
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: settings.primary_color }} />
                      <span>{settings.primary_color}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Hover Color</span>
                    <div className="flex items-center justify-center space-x-1.5 font-mono font-bold text-white text-xs">
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: settings.primary_hover_color }} />
                      <span>{settings.primary_hover_color}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Active Brand</span>
                    <span className="font-bold text-white text-xs truncate block">{settings.brand_name}</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Support Phone</span>
                    <span className="font-mono font-bold text-white text-xs truncate block">{settings.support_phone}</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: PRIMARY COLOR CUSTOMIZER & 12 PRESETS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-ots-yellow" />
                    <span>Website Primary Color &amp; Accent System</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any curated theme swatch or pick a custom brand HEX color. The entire website (buttons, progress bars, active nav, badges) updates instantly.
                  </p>
                </div>

                {/* 12 Curated Theme Swatches */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-3">
                    Curated Color Presets (1-Click Switch):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = settings.primary_color.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => handlePrimaryColorChange(preset.hex, preset.hover)}
                          className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between space-y-2 relative group ${
                            isSelected
                              ? 'border-slate-900 bg-slate-50 shadow-md ring-2 ring-black/10'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span 
                              className="w-6 h-6 rounded-lg shadow-sm border border-black/10 flex items-center justify-center"
                              style={{ backgroundColor: preset.hex }}
                            >
                              {isSelected && <Check className={`w-3.5 h-3.5 ${preset.isDarkText ? 'text-gray-950 font-black' : 'text-white font-black'}`} />}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-600">
                              {preset.hex}
                            </span>
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 block leading-tight">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom HEX Pickers */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Color Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Custom Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => handlePrimaryColorChange(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={settings.primary_color}
                        onChange={(e) => handlePrimaryColorChange(e.target.value)}
                        placeholder="#FFCC00"
                        className="w-32 p-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 uppercase"
                      />
                      <span className="text-[11px] text-slate-500">
                        Default: <code className="font-bold text-slate-700">#FFCC00</code>
                      </span>
                    </div>
                  </div>

                  {/* Primary Hover Color Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Primary Hover State (Interactive Buttons)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={settings.primary_hover_color}
                        onChange={(e) => {
                          setSettings({ ...settings, primary_hover_color: e.target.value });
                          if (updateSiteSettingsState) {
                            updateSiteSettingsState({ primary_hover_color: e.target.value });
                          }
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={settings.primary_hover_color}
                        onChange={(e) => {
                          setSettings({ ...settings, primary_hover_color: e.target.value });
                          if (updateSiteSettingsState) {
                            updateSiteSettingsState({ primary_hover_color: e.target.value });
                          }
                        }}
                        placeholder="#E6B800"
                        className="w-32 p-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 uppercase"
                      />
                      <span className="text-[11px] text-slate-500">
                        Auto-calculated from primary
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: LOGO VARIATIONS MANAGEMENT (3 CARDS) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-ots-yellow" />
                    <span>Logo Variations &amp; Visual Branding</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload tailored logo variations to guarantee high contrast across dark header surfaces, printed light vouchers, and mobile browser icons.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Variation 1: Dark Background Logo */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">1. Header / Dark Logo</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-white">Dark Theme</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Rendered on the main sticky header, mobile drawer menu, and dark footer.
                      </p>

                      {/* Dark Preview Canvas */}
                      <div className="h-24 bg-[#0e1118] border border-slate-800 rounded-xl flex items-center justify-center p-3 relative overflow-hidden group">
                        {settings.logo_dark ? (
                          <img 
                            src={settings.logo_dark} 
                            alt="Dark logo" 
                            className="max-h-16 max-w-full object-contain" 
                          />
                        ) : (
                          <span className="text-xs text-slate-500 italic">No image (falls back to brand name text)</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Upload Button */}
                      <label className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow">
                        {uploadingLogo === 'logo_dark' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-ots-yellow" />
                            <span>Upload Dark Logo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'logo_dark')}
                          disabled={uploadingLogo === 'logo_dark'}
                          className="sr-only"
                        />
                      </label>

                      {/* Direct URL input */}
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={settings.logo_dark}
                          onChange={(e) => {
                            setSettings({ ...settings, logo_dark: e.target.value });
                            if (updateSiteSettingsState) {
                              updateSiteSettingsState({ logo_dark: e.target.value });
                            }
                          }}
                          placeholder="/images/ots-taxi-logo.png"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-800 font-mono"
                        />
                        {settings.logo_dark && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettings({ ...settings, logo_dark: '' });
                              if (updateSiteSettingsState) updateSiteSettingsState({ logo_dark: '' });
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition"
                            title="Clear logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variation 2: Light Background Logo (Voucher & Documents) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">2. Voucher &amp; Invoice Logo</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Light Theme</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Rendered on printable PDF vouchers, booking confirmations, and customer invoices.
                      </p>

                      {/* Light Preview Canvas */}
                      <div className="h-24 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                        {settings.logo_light ? (
                          <img 
                            src={settings.logo_light} 
                            alt="Light logo" 
                            className="max-h-16 max-w-full object-contain" 
                          />
                        ) : settings.logo_dark ? (
                          <div className="text-center">
                            <img 
                              src={settings.logo_dark} 
                              alt="Fallback dark logo" 
                              className="max-h-12 max-w-full object-contain opacity-70" 
                            />
                            <span className="text-[10px] text-slate-400 block mt-1">(Using header logo fallback)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No image (text fallback)</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Upload Button */}
                      <label className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow">
                        {uploadingLogo === 'logo_light' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-ots-yellow" />
                            <span>Upload Voucher Logo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'logo_light')}
                          disabled={uploadingLogo === 'logo_light'}
                          className="sr-only"
                        />
                      </label>

                      {/* Direct URL input */}
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={settings.logo_light}
                          onChange={(e) => {
                            setSettings({ ...settings, logo_light: e.target.value });
                            if (updateSiteSettingsState) {
                              updateSiteSettingsState({ logo_light: e.target.value });
                            }
                          }}
                          placeholder="/images/ots-taxi-logo-dark.png"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-800 font-mono"
                        />
                        {settings.logo_light && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettings({ ...settings, logo_light: '' });
                              if (updateSiteSettingsState) updateSiteSettingsState({ logo_light: '' });
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition"
                            title="Clear logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variation 3: App Icon / Square Favicon */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">3. App Icon &amp; Favicon</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">1:1 Square</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Square format for mobile bookmarks, iOS/Android shortcuts, and browser favicon.
                      </p>

                      {/* Square Preview Canvas */}
                      <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center p-3 relative">
                        {settings.logo_icon ? (
                          <img 
                            src={settings.logo_icon} 
                            alt="Square icon" 
                            className="w-14 h-14 rounded-xl object-contain shadow" 
                          />
                        ) : (
                          <div 
                            style={{ backgroundColor: settings.primary_color }}
                            className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-gray-950 text-xl shadow"
                          >
                            {settings.brand_name?.charAt(0) || 'O'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Upload Button */}
                      <label className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow">
                        {uploadingLogo === 'logo_icon' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-ots-yellow" />
                            <span>Upload Square Icon</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'logo_icon')}
                          disabled={uploadingLogo === 'logo_icon'}
                          className="sr-only"
                        />
                      </label>

                      {/* Direct URL input */}
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={settings.logo_icon}
                          onChange={(e) => {
                            setSettings({ ...settings, logo_icon: e.target.value });
                            if (updateSiteSettingsState) {
                              updateSiteSettingsState({ logo_icon: e.target.value });
                            }
                          }}
                          placeholder="/favicon.ico or icon.png"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-800 font-mono"
                        />
                        {settings.logo_icon && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettings({ ...settings, logo_icon: '' });
                              if (updateSiteSettingsState) updateSiteSettingsState({ logo_icon: '' });
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition"
                            title="Clear logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 4: BRAND IDENTITY & COMPANY CONTACT INFORMATION */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-ots-yellow" />
                    <span>Brand Identity &amp; Corporate Details</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official company particulars rendered dynamically on the website header, footer, contact modal, and confirmation receipts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={settings.brand_name}
                      onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                      placeholder="e.g. Quick Car Midlands or City Transfers"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand Tagline</label>
                    <input
                      type="text"
                      value={settings.brand_tagline}
                      onChange={(e) => setSettings({ ...settings, brand_tagline: e.target.value })}
                      placeholder="e.g. London Airport Transfers & Executive Chauffeur Services"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Customer Support Phone</label>
                    <input
                      type="text"
                      value={settings.support_phone}
                      onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                      placeholder="e.g. +44 20 8123 4567"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Customer Support Email</label>
                    <input
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                      placeholder="e.g. bookings@quickcarmidlands.co.uk"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">24/7 Dispatch WhatsApp / Emergency</label>
                    <input
                      type="text"
                      value={settings.emergency_whatsapp}
                      onChange={(e) => setSettings({ ...settings, emergency_whatsapp: e.target.value })}
                      placeholder="e.g. +44 7123 456789"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Registration Number</label>
                    <input
                      type="text"
                      value={settings.company_number}
                      onChange={(e) => setSettings({ ...settings, company_number: e.target.value })}
                      placeholder="e.g. 12345678"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Registered Head Office Address</label>
                    <input
                      type="text"
                      value={settings.office_address}
                      onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                      placeholder="e.g. Heathrow Airport Terminal 2, Hounslow TW6 1EW, United Kingdom"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">VAT Registration Number</label>
                    <input
                      type="text"
                      value={settings.vat_number}
                      onChange={(e) => setSettings({ ...settings, vat_number: e.target.value })}
                      placeholder="e.g. GB 123 4567 89"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Website Footer Copyright Text</label>
                    <input
                      type="text"
                      value={settings.copyright_text}
                      onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
                      placeholder="e.g. © 2026 Your Brand Ltd. All rights reserved."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs text-slate-800"
                    />
                  </div>

                  {/* Official Business & Bank Account Details */}
                  <div className="md:col-span-2 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                      <span>Official Business Bank Account Details (Invoices &amp; BACS Wire Transfers)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">Account Name</label>
                        <input
                          type="text"
                          value={settings.account_name || 'QUICK CAR MIDLANDS LTD'}
                          onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                          placeholder="QUICK CAR MIDLANDS LTD"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">Bank / Provider</label>
                        <input
                          type="text"
                          value={settings.bank_name || 'Clydesdale Bank / Virgin Money UK'}
                          onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                          placeholder="Clydesdale Bank / Virgin Money UK"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">Account Number</label>
                        <input
                          type="text"
                          value={settings.account_number || '50470328'}
                          onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                          placeholder="50470328"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">Sort Code</label>
                        <input
                          type="text"
                          value={settings.sort_code || '82-19-74'}
                          onChange={(e) => setSettings({ ...settings, sort_code: e.target.value })}
                          placeholder="82-19-74"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">IBAN</label>
                        <input
                          type="text"
                          value={settings.iban || 'GB91CLYD82197450470328'}
                          onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                          placeholder="GB91CLYD82197450470328"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">BIC / SWIFT</label>
                        <input
                          type="text"
                          value={settings.bic || 'CLYDGB21974'}
                          onChange={(e) => setSettings({ ...settings, bic: e.target.value })}
                          placeholder="CLYDGB21974"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">Account Type</label>
                        <input
                          type="text"
                          value={settings.account_type || 'Business'}
                          onChange={(e) => setSettings({ ...settings, account_type: e.target.value })}
                          placeholder="Business"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Save Bar */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-100 flex-wrap gap-3">
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time persistence enabled via MySQL &amp; React Theme Context</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleResetThemeDefaults}
                      className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition"
                    >
                      Reset Colors
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveSettings()}
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-ots-yellow" />
                          <span>Save Website Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 9: ANALYTICS & ADVANCED REPORTING
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 pb-12">
              
              {/* Header and Date Filter Toolbar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded-md">
                      Executive Analytics
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Real-Time Data Intelligence</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1.5">
                    Operations &amp; Revenue Analytics
                  </h2>
                  <p className="text-xs text-slate-500">
                    Filter by date range to audit journey volume, airport route profitability, and vehicle class utilization.
                  </p>
                </div>

                {/* Filter and Export Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200 text-xs font-bold">
                    {(
                      [
                        { id: 'all', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: '7days', label: 'Last 7 Days' },
                        { id: 'month', label: 'This Month' },
                        { id: 'last_month', label: 'Last Month' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setAnalyticsDateFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          analyticsDateFilter === f.id
                            ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={exportBookingsCsv}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-ots-yellow" />
                    <span>Export Bookings CSV</span>
                  </button>
                </div>
              </div>

              {/* KPI Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Gross Revenue</span>
                  <div className="text-2xl font-black text-slate-900">
                    {formatPrice(analyticsMetrics.gross)}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    {analyticsMetrics.active} active billable bookings
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Total Bookings</span>
                  <div className="text-2xl font-black text-slate-900">
                    {analyticsMetrics.total}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {analyticsMetrics.completed} completed &bull; {analyticsMetrics.cancelled} cancelled
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Average Ticket</span>
                  <div className="text-2xl font-black text-slate-900">
                    {formatPrice(analyticsMetrics.avgTicket)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Per fulfilled airport transfer
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Cancellation Rate</span>
                  <div className="text-2xl font-black text-slate-900">
                    {analyticsMetrics.cancelRate.toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {analyticsMetrics.cancelled} total cancellations
                  </p>
                </div>
              </div>

              {/* Charts Row: Revenue Trend & Vehicle Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart: Revenue & Volume Trend */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Revenue &amp; Booking Volume Trend</h3>
                      <p className="text-[11px] text-slate-400">Daily gross booking value across the selected timeframe</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
                      {filteredAnalyticsBookings.length} Trips
                    </span>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-64 w-full flex items-end pt-6">
                    {(() => {
                      const dateMap = new Map<string, { gross: number; count: number }>();
                      filteredAnalyticsBookings.forEach((b) => {
                        const d = b.pickup_date || (b.created_at ? b.created_at.split('T')[0] : 'N/A');
                        const cur = dateMap.get(d) || { gross: 0, count: 0 };
                        if (b.booking_status !== 'cancelled') cur.gross += Number(b.total_price || 0);
                        cur.count += 1;
                        dateMap.set(d, cur);
                      });

                      const entries = Array.from(dateMap.entries()).slice(-10);
                      const maxVal = Math.max(...entries.map(([, v]) => v.gross), 100);

                      if (entries.length === 0) {
                        return (
                          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs">
                            <BarChart2 className="w-8 h-8 mb-2 stroke-[1.5]" />
                            <span>No bookings recorded for this filter range</span>
                          </div>
                        );
                      }

                      return (
                        <div className="w-full h-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                          {entries.map(([dateKey, val], idx) => {
                            const heightPct = Math.max(12, Math.round((val.gross / maxVal) * 100));
                            const shortDate = dateKey.length > 5 ? dateKey.slice(5) : dateKey;

                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                                <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition mb-1 font-mono whitespace-nowrap">
                                  £{val.gross.toFixed(0)}
                                </span>
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className="w-full bg-slate-900 group-hover:bg-amber-400 rounded-t-lg transition-all duration-300 relative flex items-center justify-center shadow-xs"
                                >
                                  {heightPct > 25 && (
                                    <span className="text-[9px] font-mono font-bold text-white group-hover:text-black transform -rotate-90 sm:rotate-0">
                                      {val.count}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                                  {shortDate}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Vehicle Class Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Vehicle Class Share</h3>
                    <p className="text-[11px] text-slate-400">Revenue &amp; volume across 5 official categories</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(analyticsMetrics.vehicleBreakdown).map(([catId, val]) => {
                      const totalGross = analyticsMetrics.gross > 0 ? analyticsMetrics.gross : 1;
                      const pct = Math.round((val.revenue / totalGross) * 100);

                      return (
                        <div key={catId} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 capitalize">{val.label}</span>
                            <div className="text-right">
                              <span className="font-mono font-black text-slate-900">£{val.revenue.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({val.count} trips)</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Second Row: Top UK Airport Routes & Booking Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Airport Routes */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Top Airport Transfer Routes</h3>
                      <p className="text-[11px] text-slate-400">Volume and revenue by UK destination airport</p>
                    </div>
                    <button
                      onClick={exportRevenueCsv}
                      className="text-xs font-bold text-slate-700 hover:text-black flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export Revenue CSV</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {Object.entries(analyticsMetrics.airportRoutes)
                      .sort((a, b) => b[1].revenue - a[1].revenue)
                      .map(([route, val], idx) => (
                        <div key={route} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800">{route}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-slate-900">£{val.revenue.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({val.count} transfers)</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Booking Status Distribution */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Dispatch Status Overview</h3>
                    <p className="text-[11px] text-slate-400">Current state of bookings in selected timeframe</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block">Completed Trips</span>
                      <div className="text-2xl font-black text-emerald-900 mt-1">{analyticsMetrics.completed}</div>
                      <span className="text-[10px] text-emerald-600">Successfully fulfilled transfers</span>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-blue-700 block">Active &amp; In Progress</span>
                      <div className="text-2xl font-black text-blue-900 mt-1">
                        {filteredAnalyticsBookings.filter(b => b.booking_status === 'in_progress' || b.booking_status === 'assigned' || b.booking_status === 'confirmed').length}
                      </div>
                      <span className="text-[10px] text-blue-600">Dispatched or on-route</span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-amber-700 block">Pending Dispatch</span>
                      <div className="text-2xl font-black text-amber-900 mt-1">
                        {filteredAnalyticsBookings.filter(b => b.booking_status === 'pending').length}
                      </div>
                      <span className="text-[10px] text-amber-600">Awaiting driver assignment</span>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-red-700 block">Cancelled</span>
                      <div className="text-2xl font-black text-red-900 mt-1">{analyticsMetrics.cancelled}</div>
                      <span className="text-[10px] text-red-600">Customer or admin cancellations</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              VIEW 10: DATA EXPORTS & COMPLIANCE DOWNLOADS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'export' && (
            <div className="space-y-6 max-w-5xl pb-12">
              
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-1 rounded-md">
                    Audit &amp; Compliance
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Export Center</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1.5">
                  Official Data Exports &amp; Reports
                </h2>
                <p className="text-xs text-slate-500">
                  Generate instant CSV spreadsheets for HMRC accounting, TfL licensing audits, partner invoicing, and fleet compliance reviews.
                </p>
              </div>

              {/* 3 Main Export Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Export 1: Bookings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                      <Calendar className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">Complete Bookings Archive</h3>
                    <p className="text-xs text-slate-500">
                      Export all bookings with journey dates, pickup/drop-off locations, passenger contact details, vehicle categories, and payment receipts.
                    </p>
                    <div className="text-xs font-mono font-bold text-slate-600 pt-1">
                      {bookings.length} Total Bookings Available
                    </div>
                  </div>

                  <button
                    onClick={exportBookingsCsv}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-ots-yellow" />
                    <span>Download Bookings CSV</span>
                  </button>
                </div>

                {/* Export 2: Revenue */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">Revenue &amp; Settlement Rollup</h3>
                    <p className="text-xs text-slate-500">
                      Daily accounting rollup: gross turnover, completed journeys, cancellations, and average ticket prices for financial auditing.
                    </p>
                    <div className="text-xs font-mono font-bold text-slate-600 pt-1">
                      Gross Turnover: {formatPrice(stats.totalRevenue || analyticsMetrics.gross)}
                    </div>
                  </div>

                  <button
                    onClick={exportRevenueCsv}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-ots-yellow" />
                    <span>Download Revenue CSV</span>
                  </button>
                </div>

                {/* Export 3: Drivers */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">Chauffeur Fleet &amp; Compliance</h3>
                    <p className="text-xs text-slate-500">
                      Export driver roster, vehicle registration plates, vehicle classes, PCO licensing numbers, insurance expiry dates, and verification scores.
                    </p>
                    <div className="text-xs font-mono font-bold text-slate-600 pt-1">
                      {drivers.length} Drivers in Fleet
                    </div>
                  </div>

                  <button
                    onClick={exportDriversCsv}
                    className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-ots-yellow" />
                    <span>Download Fleet CSV</span>
                  </button>
                </div>

              </div>

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

      {/* ══════════════════════════════════════════════════════════════
          USER CRUD MODAL (ADD / EDIT)
      ══════════════════════════════════════════════════════════════ */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#121622] text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-ots-yellow text-gray-900 font-black flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {userModalMode === 'create' ? 'Add New User Account' : 'Edit User Account'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {userModalMode === 'create' ? 'Create customer, chauffeur or admin profile' : `User ID: ${userFormData.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. John Smith"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="+44 7123 456789"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-bold"
                  >
                    <option value="customer">Customer</option>
                    <option value="driver">Chauffeur / Driver</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                  <select
                    value={userFormData.is_verified ? 'verified' : 'unverified'}
                    onChange={(e) => setUserFormData({ ...userFormData, is_verified: e.target.value === 'verified' })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-bold"
                  >
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {userModalMode === 'create' ? 'Initial Password' : 'Reset Password (optional)'}
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder={userModalMode === 'create' ? 'Default: DefaultPass@123' : 'Leave blank to keep current password'}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmittingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{userModalMode === 'create' ? 'Create User' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DRIVER CRUD MODAL (ONBOARD / FULL EDIT)
      ══════════════════════════════════════════════════════════════ */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]">
            {/* Header */}
            <div className="bg-[#121622] text-white p-5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-ots-yellow text-gray-900 font-black flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {driverModalMode === 'create' ? 'Onboard New Chauffeur' : 'Edit Chauffeur Profile'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {driverModalMode === 'create' ? 'Register driver account and vehicle assignment' : `Chauffeur ID: ${driverFormData.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDriver} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chauffeur Full Name *</label>
                  <input
                    type="text"
                    required
                    value={driverFormData.name}
                    onChange={(e) => setDriverFormData({ ...driverFormData, name: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={driverFormData.email}
                    onChange={(e) => setDriverFormData({ ...driverFormData, email: e.target.value })}
                    placeholder="driver@quickcarmidlands.co.uk"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={driverFormData.phone}
                    onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                    placeholder="+44 7123 456789"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PCO / PHV Driver License *</label>
                  <input
                    type="text"
                    required
                    value={driverFormData.licenseNumber}
                    onChange={(e) => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })}
                    placeholder="e.g. 098765"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Plate (VRN) *</label>
                  <input
                    type="text"
                    required
                    value={driverFormData.vehiclePlate}
                    onChange={(e) => setDriverFormData({ ...driverFormData, vehiclePlate: e.target.value.toUpperCase() })}
                    placeholder="e.g. LO23 ABC"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={driverFormData.vehicleModel}
                    onChange={(e) => setDriverFormData({ ...driverFormData, vehicleModel: e.target.value })}
                    placeholder="e.g. Mercedes-Benz E-Class"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Category</label>
                  <select
                    value={driverFormData.vehicleCategory}
                    onChange={(e) => setDriverFormData({ ...driverFormData, vehicleCategory: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-bold"
                  >
                    <option value="saloon">Saloon Car</option>
                    <option value="estate">Estate / Station Wagon</option>
                    <option value="executive">Executive Chauffeur</option>
                    <option value="mpv">MPV / People Carrier</option>
                    <option value="minibus">8-Seater Minibus</option>
                  </select>
                </div>
              </div>

              {driverModalMode === 'edit' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={driverFormData.bankName}
                        onChange={(e) => setDriverFormData({ ...driverFormData, bankName: e.target.value })}
                        placeholder="e.g. Barclays"
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sort Code</label>
                      <input
                        type="text"
                        value={driverFormData.sortCode}
                        onChange={(e) => setDriverFormData({ ...driverFormData, sortCode: e.target.value })}
                        placeholder="20-00-00"
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                      <input
                        type="text"
                        value={driverFormData.accountNumber}
                        onChange={(e) => setDriverFormData({ ...driverFormData, accountNumber: e.target.value })}
                        placeholder="12345678"
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Verification Status</label>
                      <select
                        value={driverFormData.verificationStatus}
                        onChange={(e) => setDriverFormData({ ...driverFormData, verificationStatus: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="incomplete">Incomplete Dossier</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved &amp; Cleared</option>
                        <option value="rejected">Suspended / Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Active Dispatch Status</label>
                      <select
                        value={driverFormData.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setDriverFormData({ ...driverFormData, isActive: e.target.value === 'active' })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="active">Active (Eligible for Roster)</option>
                        <option value="inactive">Inactive / Off Duty</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Internal Admin Notes</label>
                    <textarea
                      rows={2}
                      value={driverFormData.adminNotes}
                      onChange={(e) => setDriverFormData({ ...driverFormData, adminNotes: e.target.value })}
                      placeholder="Compliance notes, council badge renewal reminders, etc."
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDriver}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmittingDriver && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{driverModalMode === 'create' ? 'Onboard Chauffeur' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BOOKING CRUD MODAL (CREATE / EDIT)
      ══════════════════════════════════════════════════════════════ */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]">
            {/* Header */}
            <div className="bg-[#121622] text-white p-5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-ots-yellow text-gray-900 font-black flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {bookingModalMode === 'create' ? 'Create New Airport Transfer' : 'Edit Booking Details'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {bookingModalMode === 'create' ? 'Manual dispatch & telephone reservation' : `Quote Ref: ${bookingFormData.quoteRef}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBooking} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pickup Location *</label>
                  <input
                    type="text"
                    required
                    value={bookingFormData.fromLocation}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, fromLocation: e.target.value })}
                    placeholder="e.g. Heathrow Airport Terminal 2"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dropoff Location *</label>
                  <input
                    type="text"
                    required
                    value={bookingFormData.toLocation}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, toLocation: e.target.value })}
                    placeholder="e.g. Central London, Mayfair W1"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passenger Name *</label>
                  <input
                    type="text"
                    required
                    value={bookingFormData.passengerName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, passengerName: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passenger Email *</label>
                  <input
                    type="email"
                    required
                    value={bookingFormData.passengerEmail}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, passengerEmail: e.target.value })}
                    placeholder="sarah@example.com"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passenger Phone</label>
                  <input
                    type="tel"
                    value={bookingFormData.passengerPhone}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, passengerPhone: e.target.value })}
                    placeholder="+44 7123 456789"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={bookingFormData.pickupDate}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, pickupDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pickup Time</label>
                  <input
                    type="time"
                    required
                    value={bookingFormData.pickupTime}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, pickupTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passengers</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={bookingFormData.passengers}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, passengers: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Suitcases</label>
                  <input
                    type="number"
                    min="0"
                    max="16"
                    value={bookingFormData.suitcases}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, suitcases: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Category</label>
                  <select
                    value={bookingFormData.selectedVehicleId}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, selectedVehicleId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    {vehicles.length > 0 ? (
                      vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.categoryName || v.id})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="saloon">Saloon Car</option>
                        <option value="estate">Estate</option>
                        <option value="executive">Executive</option>
                        <option value="mpv">MPV</option>
                        <option value="minibus">8-Seater Minibus</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Fare (GBP £)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={bookingFormData.totalPrice}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, totalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-black text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Chauffeur</label>
                  <select
                    value={bookingFormData.driverId}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, driverId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="">-- No Chauffeur Assigned --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.driver_name || d.id} ({d.vehicle_plate || 'No plate'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Booking Status</label>
                  <select
                    value={bookingFormData.bookingStatus}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, bookingStatus: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="assigned">Assigned to Driver</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
                  <select
                    value={bookingFormData.paymentStatus}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, paymentStatus: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="completed">Paid / Completed</option>
                    <option value="unpaid">Unpaid / Cash on Arrival</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Flight Number (optional)</label>
                  <input
                    type="text"
                    value={bookingFormData.flightNumber}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, flightNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. BA123"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Special Instructions &amp; Meet &amp; Greet</label>
                <textarea
                  rows={2}
                  value={bookingFormData.specialNotes}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, specialNotes: e.target.value })}
                  placeholder="e.g. Terminal 2 Arrival Hall near Costa Coffee, holding name board"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmittingBooking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{bookingModalMode === 'create' ? 'Create Booking' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VEHICLE CLASS CRUD MODAL (ADD / EDIT)
      ══════════════════════════════════════════════════════════════ */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]">
            {/* Header */}
            <div className="bg-[#121622] text-white p-5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-ots-yellow text-gray-900 font-black flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Edit Vehicle Rates &amp; Fleet Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    Category ID: <strong className="text-white font-mono">{vehicleFormData.id}</strong> &bull; Protected Official Class
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveVehicle} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Highlighted Adjustable Rates Section */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 bg-emerald-600 text-white rounded-md">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      Official Rate Card Fares (Adjustable)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    GBP (£)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Rate per Mile (£) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold">£</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0.50"
                        max="20.00"
                        required
                        value={vehicleFormData.ratePerMile}
                        onChange={(e) => setVehicleFormData({ ...vehicleFormData, ratePerMile: parseFloat(e.target.value) || 1.50 })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-black text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Applied to all custom mileage journeys</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Minimum Fare (£) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold">£</span>
                      <input
                        type="number"
                        step="1.00"
                        min="5.00"
                        max="500.00"
                        required
                        value={vehicleFormData.minimumFare}
                        onChange={(e) => setVehicleFormData({ ...vehicleFormData, minimumFare: parseFloat(e.target.value) || 38.00 })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-300 rounded-xl font-black text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Minimum charge if calculated fare is lower</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Slug / ID (Protected)</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={vehicleFormData.id}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono font-bold bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={vehicleFormData.name}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, name: e.target.value })}
                    placeholder="e.g. Standard Saloon"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Badge *</label>
                  <input
                    type="text"
                    required
                    value={vehicleFormData.categoryName}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, categoryName: e.target.value })}
                    placeholder="e.g. Executive Van"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Multiplier (Base 1.0x)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="10.0"
                    required
                    value={vehicleFormData.multiplier}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, multiplier: parseFloat(e.target.value) || 1.0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-black text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Passenger Cap</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={vehicleFormData.passengers}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, passengers: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Large Bags</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={vehicleFormData.suitcases}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, suitcases: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hand Luggage</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={vehicleFormData.handLuggage}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, handLuggage: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sample Cars</label>
                <input
                  type="text"
                  value={vehicleFormData.sampleVehicles}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, sampleVehicles: e.target.value })}
                  placeholder="e.g. Mercedes-Benz V-Class, Ford Tourneo Custom"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vehicle Image URL</label>
                <input
                  type="text"
                  value={vehicleFormData.image}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={vehicleFormData.description}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, description: e.target.value })}
                  placeholder="Short fleet tier description shown during booking checkout"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="vehicleIsActive"
                  checked={vehicleFormData.isActive}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <label htmlFor="vehicleIsActive" className="font-bold text-slate-700 cursor-pointer">
                  Active (Show this vehicle option to passengers on website)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVehicle}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmittingVehicle && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{vehicleModalMode === 'create' ? 'Add Class' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PARTNER CRUD MODAL (ADD / EDIT)
      ══════════════════════════════════════════════════════════════ */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]">
            {/* Header */}
            <div className="bg-[#121622] text-white p-5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-ots-yellow text-gray-900 font-black flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {partnerModalMode === 'create' ? 'Add B2B Partner' : 'Edit Partner Application'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {partnerModalMode === 'create' ? 'Onboard corporate client or travel partner' : `Partner ID: ${partnerFormData.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePartner} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.companyName}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, companyName: e.target.value })}
                    placeholder="e.g. British Airways Executive Travel"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Key Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.contactName}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, contactName: e.target.value })}
                    placeholder="e.g. Amanda Clark"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={partnerFormData.email}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={partnerFormData.phone}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })}
                    placeholder="+44 20 8123 4567"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Partner Type</label>
                  <select
                    value={partnerFormData.partnerType}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, partnerType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="corporate_account">Corporate Account</option>
                    <option value="travel_agency">Travel Agency</option>
                    <option value="hotel_concierge">Hotel Concierge</option>
                    <option value="fleet_operator">Fleet Operator</option>
                    <option value="event_planner">Event Planner</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Volume / Fleet</label>
                  <input
                    type="text"
                    value={partnerFormData.fleetSize}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, fleetSize: e.target.value })}
                    placeholder="e.g. 50+ rides/month"
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Application Status</label>
                  <select
                    value={partnerFormData.status}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="new">New Submission</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved &amp; Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Application Details / Message</label>
                <textarea
                  rows={2}
                  value={partnerFormData.message}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, message: e.target.value })}
                  placeholder="Partner service requirements or commission arrangements"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={partnerFormData.adminNotes}
                  onChange={(e) => setPartnerFormData({ ...partnerFormData, adminNotes: e.target.value })}
                  placeholder="B2B contract notes, negotiated discounts, payment terms"
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPartner}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmittingPartner && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{partnerModalMode === 'create' ? 'Add Partner' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
