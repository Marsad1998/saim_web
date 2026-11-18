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
  ChevronLeft,
  Lock,
  Upload,
  FileText,
  CreditCard,
  Save,
  Check,
  User,
  Shield,
  FileCheck2,
  ExternalLink,
  Sparkles
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
    rating: 5.0,
  });
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [activeTab, setActiveTab] = useState<'onboarding' | 'active' | 'completed'>('onboarding');

  // Step Wizard State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // Chauffeur Onboarding Form State
  const [profileForm, setProfileForm] = useState({
    // Step 1: Personal
    address: '',
    niNumber: '',
    emergencyContact: '',
    // Step 2: PCO & DVLA Licensing
    licenseNumber: '',
    pcoExpiry: '',
    dvlaLicenseNumber: '',
    docPcoBadge: '',
    docDvlaLicense: '',
    // Step 3: Vehicle Specification
    vehicleModel: '',
    vehiclePlate: '',
    vehicleYear: '',
    vehicleCategory: 'saloon',
    docPhvMot: '',
    // Step 4: Insurance & Payout Banking
    insuranceNumber: '',
    insuranceExpiry: '',
    bankName: '',
    sortCode: '',
    accountNumber: '',
    docInsurance: '',
  });

  const [isSavingStep, setIsSavingStep] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
              address: sData.driver.address || '',
              niNumber: sData.driver.ni_number || '',
              emergencyContact: sData.driver.emergency_contact || '',
              licenseNumber: sData.driver.license_number || '',
              pcoExpiry: sData.driver.pco_expiry ? sData.driver.pco_expiry.split('T')[0] : '',
              dvlaLicenseNumber: sData.driver.dvla_license_number || '',
              docPcoBadge: sData.driver.doc_pco_badge || '',
              docDvlaLicense: sData.driver.doc_dvla_license || '',
              vehicleModel: sData.driver.vehicle_model || '',
              vehiclePlate: sData.driver.vehicle_plate || '',
              vehicleYear: sData.driver.vehicle_year || '',
              vehicleCategory: sData.driver.vehicle_category || 'saloon',
              docPhvMot: sData.driver.doc_phv_mot || '',
              insuranceNumber: sData.driver.insurance_number || '',
              insuranceExpiry: sData.driver.insurance_expiry ? sData.driver.insurance_expiry.split('T')[0] : '',
              bankName: sData.driver.bank_name || '',
              sortCode: sData.driver.sort_code || '',
              accountNumber: sData.driver.account_number || '',
              docInsurance: sData.driver.doc_insurance || '',
            });

            // If driver is fully verified & active, default active tab to 'active' trips
            if (sData.driver.verification_status === 'approved') {
              setActiveTab('active');
            } else {
              setActiveTab('onboarding');
            }
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

  // Compute live step scores
  const isStep1Done = Boolean(
    (profileForm.address && profileForm.address.trim().length > 3) ||
    (profileForm.emergencyContact && profileForm.emergencyContact.trim().length > 3)
  );

  const isStep2Done = Boolean(
    profileForm.licenseNumber && profileForm.licenseNumber.trim().length >= 4 &&
    (profileForm.pcoExpiry || profileForm.docPcoBadge || profileForm.dvlaLicenseNumber)
  );

  const isStep3Done = Boolean(
    profileForm.vehicleModel && profileForm.vehicleModel.trim().length >= 3 &&
    profileForm.vehiclePlate && profileForm.vehiclePlate.trim().length >= 3
  );

  const isStep4Done = Boolean(
    (profileForm.insuranceNumber || profileForm.docInsurance) &&
    profileForm.sortCode && profileForm.sortCode.replace(/\D/g, '').length >= 6 &&
    profileForm.accountNumber && profileForm.accountNumber.replace(/\D/g, '').length >= 8
  );

  const completionScore = (isStep1Done ? 25 : 0) + (isStep2Done ? 25 : 0) + (isStep3Done ? 25 : 0) + (isStep4Done ? 25 : 0);
  const isFullyCompleted = completionScore === 100;
  const isApproved = driver?.verification_status === 'approved';

  // Toggle On-Duty
  const handleToggleDuty = async () => {
    if (!isApproved || !isFullyCompleted) {
      setActiveTab('onboarding');
      setFeedback({
        type: 'error',
        text: `Compliance Required: You cannot go On-Duty until all 4 profile steps are completed and approved by OTS Taxi Admin (Current Score: ${completionScore}%).`,
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

  // Document File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocType(docType);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    try {
      const res = await fetch('/api/driver/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.status && data.fileUrl) {
        setProfileForm((prev) => ({ ...prev, [docType]: data.fileUrl }));
        setFeedback({
          type: 'success',
          text: `Document uploaded successfully: ${data.fileName}`,
        });

        // Auto-save to driver profile
        await fetch('/api/driver/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [docType]: data.fileUrl }),
        });

        // Refresh driver data
        const sRes = await fetch('/api/driver/status');
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.status) setDriver(sData.driver);
        }
      } else {
        setFeedback({
          type: 'error',
          text: data.message || 'Failed to upload document. Please try again.',
        });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setFeedback({
        type: 'error',
        text: 'Network error while uploading file.',
      });
    } finally {
      setUploadingDocType(null);
    }
  };

  // Save Step Action
  const handleSaveStep = async (stepNum: 1 | 2 | 3 | 4) => {
    setIsSavingStep(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/driver/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          stepSubmitted: stepNum,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        setFeedback({
          type: 'success',
          text: data.message || `Step ${stepNum} saved successfully!`,
        });

        if (data.driver) {
          setDriver(data.driver);
          setIsOnDuty(Boolean(data.driver.is_active));
        }

        // Auto-advance to next step if not final
        if (stepNum < 4) {
          setCurrentStep((stepNum + 1) as 1 | 2 | 3 | 4);
        }
      } else {
        setFeedback({
          type: 'error',
          text: data.message || 'Failed to save details.',
        });
      }
    } catch (err: any) {
      console.error('Save step error:', err);
      setFeedback({
        type: 'error',
        text: 'Network error while saving details.',
      });
    } finally {
      setIsSavingStep(false);
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

  // Circular progress stroke calculation (radius = 40, circumference = 251.2)
  const circleCircumference = 251.2;
  const strokeDashoffset = circleCircumference - (circleCircumference * completionScore) / 100;

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
                  ID: {driver?.id || 'DRV-NEW'}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  isApproved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : isFullyCompleted
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {isApproved
                    ? '✓ Verified Chauffeur'
                    : isFullyCompleted
                    ? '⏳ Pending Admin Approval'
                    : `Incomplete (${completionScore}% Score)`}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5">
                {driver?.name || user?.name || 'Chauffeur Partner'}
              </h1>

              <p className="text-xs text-neutral-400 mt-0.5 flex items-center space-x-2">
                <Car className="w-3.5 h-3.5 text-ots-yellow" />
                <span>{profileForm.vehicleModel || (isFullyCompleted ? 'Executive Vehicle' : 'Vehicle Not Specified')} • </span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white font-bold">
                  {profileForm.vehiclePlate || 'NO PLATE'}
                </span>
              </p>
            </div>

            {/* Duty Status Button & Logout */}
            <div className="flex items-center space-x-3">
              {!isApproved ? (
                <button
                  onClick={() => {
                    setActiveTab('onboarding');
                    setFeedback({
                      type: 'error',
                      text: `On-Duty is locked! Please complete all 4 onboarding steps to reach 100% score (Current: ${completionScore}%).`,
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 border shadow-sm bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-ots-yellow hover:text-white"
                  title="Complete profile to unlock On-Duty"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>🔒 Locked ({completionScore}%)</span>
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
                onClick={() => logout()}
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
              <div className="text-xs text-neutral-400">Chauffeur Rating</div>
              <div className="text-xl font-extrabold text-amber-300 mt-1 flex items-center space-x-1">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>{stats.rating || 5.0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mt-8 space-x-6">
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'onboarding'
                ? 'border-ots-yellow text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Onboarding &amp; Compliance ({completionScore}%)</span>
            {!isApproved && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>

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
            <span>Trip History ({completedTrips.length})</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: 4-STEP ONBOARDING WIZARD WITH PROGRESS CIRCLE & DOCS     */}
        {/* ============================================================== */}
        {activeTab === 'onboarding' && (
          <div className="mt-6 space-y-6">
            
            {/* Progress Circle & Status Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center space-x-5">
                {/* SVG Circular Progress Meter */}
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={completionScore === 100 ? '#10b981' : completionScore >= 50 ? '#FFCC00' : '#f59e0b'}
                      strokeWidth="8"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-gray-900 leading-none">{completionScore}%</span>
                    <span className="text-[9px] uppercase font-bold text-gray-400 mt-0.5">Score</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-ots-yellow bg-black px-2.5 py-0.5 rounded">
                      Step {currentStep} of 4
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {isFullyCompleted ? '4 of 4 Steps Complete' : `${(completionScore / 25)} of 4 Steps Finished`}
                    </span>
                  </div>

                  <h2 className="text-lg md:text-xl font-black text-gray-900 mt-1">
                    {completionScore === 100 && isApproved
                      ? '✓ All Compliance Verified & Active'
                      : completionScore === 100
                      ? '🎉 Profile 100% Complete – Pending Admin Review'
                      : 'Complete Your Chauffeur Onboarding'}
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                    {completionScore === 100
                      ? 'Your PCO license, vehicle documentation, and insurance details are submitted. Admin will authorize your account.'
                      : 'Fill in each section and upload required compliance files to unlock your On-Duty status and receive transfers.'}
                  </p>
                </div>
              </div>

              {/* Step Summary Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs w-full md:w-auto">
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                  isStep1Done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {isStep1Done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">1</div>}
                  <span className="font-semibold text-[11px]">1. Personal (25%)</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                  isStep2Done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {isStep2Done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">2</div>}
                  <span className="font-semibold text-[11px]">2. PCO License (25%)</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                  isStep3Done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {isStep3Done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">3</div>}
                  <span className="font-semibold text-[11px]">3. Vehicle (25%)</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                  isStep4Done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {isStep4Done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px]">4</div>}
                  <span className="font-semibold text-[11px]">4. Insurance (25%)</span>
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2.5 shadow-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span className="font-medium">{feedback.text}</span>
              </div>
            )}

            {/* Stepper Navigation Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentStep === 1
                    ? 'border-ots-yellow bg-white shadow-md ring-2 ring-ots-yellow/30'
                    : isStep1Done
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-200 bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Step 01</span>
                  {isStep1Done && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                </div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">Personal Info</div>
                <div className="text-[10px] text-gray-500">+25% Points</div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentStep === 2
                    ? 'border-ots-yellow bg-white shadow-md ring-2 ring-ots-yellow/30'
                    : isStep2Done
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-200 bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Step 02</span>
                  {isStep2Done && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                </div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">PCO &amp; DVLA License</div>
                <div className="text-[10px] text-gray-500">+25% Points</div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentStep === 3
                    ? 'border-ots-yellow bg-white shadow-md ring-2 ring-ots-yellow/30'
                    : isStep3Done
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-200 bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Step 03</span>
                  {isStep3Done && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                </div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">Vehicle &amp; MOT</div>
                <div className="text-[10px] text-gray-500">+25% Points</div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentStep === 4
                    ? 'border-ots-yellow bg-white shadow-md ring-2 ring-ots-yellow/30'
                    : isStep4Done
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-200 bg-white/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Step 04</span>
                  {isStep4Done && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                </div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">Insurance &amp; Banking</div>
                <div className="text-[10px] text-gray-500">+25% Points</div>
              </button>
            </div>

            {/* Step Form Box */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6">
              
              {/* ======================================================= */}
              {/* STEP 1: Personal & Chauffeur Profile                     */}
              {/* ======================================================= */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                      <User className="w-4 h-4 text-ots-yellow" />
                      <span>Step 1: Chauffeur Profile &amp; Contact Details</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter your residential address and emergency contact information for TfL licensing records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        disabled
                        value={driver?.name || user?.name || ''}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone Number</label>
                      <input
                        type="text"
                        disabled
                        value={driver?.phone || user?.phone || ''}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Residential UK Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 24 High Street, Kensington, London W8 4PT"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        National Insurance (NI) Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. QQ 12 34 56 A"
                        value={profileForm.niNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, niNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono uppercase focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Emergency Contact (Name &amp; Phone) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sarah Wilson (+44 7911 123456)"
                        value={profileForm.emergencyContact}
                        onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Step 1 completes 25% of your total score.</span>
                    <button
                      type="button"
                      onClick={() => handleSaveStep(1)}
                      disabled={isSavingStep}
                      className="px-6 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                    >
                      {isSavingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save &amp; Continue ➔</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* STEP 2: PCO & DVLA Licensing + Document Upload          */}
              {/* ======================================================= */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-ots-yellow" />
                      <span>Step 2: PCO Driver Licensing &amp; Badge Upload</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload your Transport for London (TfL) or Local Council Private Hire Driver badge.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        PCO Private Hire License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PCO-984321"
                        value={profileForm.licenseNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono uppercase font-bold focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        PCO License Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={profileForm.pcoExpiry}
                        onChange={(e) => setProfileForm({ ...profileForm, pcoExpiry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        DVLA Driving License Number (16 Digits)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. WILSO812045JW99"
                        value={profileForm.dvlaLicenseNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, dvlaLicenseNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono uppercase focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    {/* Document Upload: PCO Badge */}
                    <div className="sm:col-span-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">
                            Upload PCO Driver Badge (Photo or PDF) <span className="text-red-500">*</span>
                          </span>
                          <span className="text-[10px] text-gray-400">Front photo showing badge number, photo, and expiry</span>
                        </div>
                        {profileForm.docPcoBadge ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Uploaded</span>
                            </span>
                            <a
                              href={profileForm.docPcoBadge}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline flex items-center space-x-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 hover:border-ots-yellow rounded-xl text-xs font-bold text-gray-700 shadow-sm transition flex items-center space-x-1.5">
                          {uploadingDocType === 'docPcoBadge' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ots-yellow" />
                          ) : (
                            <Upload className="w-4 h-4 text-ots-yellow" />
                          )}
                          <span>{profileForm.docPcoBadge ? 'Replace PCO Badge' : 'Select PCO Badge File'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(e, 'docPcoBadge')}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-gray-400">Supports JPG, PNG, PDF up to 10MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveStep(2)}
                      disabled={isSavingStep}
                      className="px-6 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                    >
                      {isSavingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save &amp; Continue ➔</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* STEP 3: Vehicle Specification & Compliance              */}
              {/* ======================================================= */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                      <Car className="w-4 h-4 text-ots-yellow" />
                      <span>Step 3: Vehicle Specification &amp; PHV MOT Compliance</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Register your vehicle make, model, registration plate, and council MOT license certificate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Vehicle Make &amp; Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mercedes-Benz E-Class"
                        value={profileForm.vehicleModel}
                        onChange={(e) => setProfileForm({ ...profileForm, vehicleModel: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Vehicle Registration Plate (VRN) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. LO71 ABC"
                        value={profileForm.vehiclePlate}
                        onChange={(e) => setProfileForm({ ...profileForm, vehiclePlate: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono uppercase font-bold focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Year of Manufacture</label>
                      <input
                        type="text"
                        placeholder="e.g. 2023"
                        value={profileForm.vehicleYear}
                        onChange={(e) => setProfileForm({ ...profileForm, vehicleYear: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Service Category</label>
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

                    {/* Document Upload: PHV MOT */}
                    <div className="sm:col-span-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">
                            Upload PHV Vehicle License / MOT Document
                          </span>
                          <span className="text-[10px] text-gray-400">Valid MOT and private hire vehicle council disc/paper</span>
                        </div>
                        {profileForm.docPhvMot ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Uploaded</span>
                            </span>
                            <a
                              href={profileForm.docPhvMot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline flex items-center space-x-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 hover:border-ots-yellow rounded-xl text-xs font-bold text-gray-700 shadow-sm transition flex items-center space-x-1.5">
                          {uploadingDocType === 'docPhvMot' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ots-yellow" />
                          ) : (
                            <Upload className="w-4 h-4 text-ots-yellow" />
                          )}
                          <span>{profileForm.docPhvMot ? 'Replace MOT / PHV Doc' : 'Select MOT / PHV File'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(e, 'docPhvMot')}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-gray-400">Supports JPG, PNG, PDF</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveStep(3)}
                      disabled={isSavingStep}
                      className="px-6 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                    >
                      {isSavingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save &amp; Continue ➔</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* STEP 4: Insurance & Payout Banking Details              */}
              {/* ======================================================= */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-ots-yellow" />
                      <span>Step 4: Hire &amp; Reward Insurance &amp; Bank Payouts</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Enter your commercial Hire &amp; Reward insurance certificate and UK bank account for weekly fare payouts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Hire &amp; Reward Insurance Policy No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. INS-882914-UK"
                        value={profileForm.insuranceNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, insuranceNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Insurance Policy Expiry Date
                      </label>
                      <input
                        type="date"
                        value={profileForm.insuranceExpiry}
                        onChange={(e) => setProfileForm({ ...profileForm, insuranceExpiry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    {/* Document Upload: Insurance Certificate */}
                    <div className="sm:col-span-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-800 block">
                            Upload Insurance Certificate (Cover Note / PDF) <span className="text-red-500">*</span>
                          </span>
                          <span className="text-[10px] text-gray-400">Showing policyholder name, vehicle reg, and valid dates</span>
                        </div>
                        {profileForm.docInsurance ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Uploaded</span>
                            </span>
                            <a
                              href={profileForm.docInsurance}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline flex items-center space-x-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 hover:border-ots-yellow rounded-xl text-xs font-bold text-gray-700 shadow-sm transition flex items-center space-x-1.5">
                          {uploadingDocType === 'docInsurance' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ots-yellow" />
                          ) : (
                            <Upload className="w-4 h-4 text-ots-yellow" />
                          )}
                          <span>{profileForm.docInsurance ? 'Replace Insurance Doc' : 'Select Insurance File'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(e, 'docInsurance')}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-gray-400">Supports JPG, PNG, PDF</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Bank Name (e.g. Barclays, NatWest)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Barclays Bank UK"
                        value={profileForm.bankName}
                        onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Sort Code (6 Digits) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20-04-15"
                        value={profileForm.sortCode}
                        onChange={(e) => setProfileForm({ ...profileForm, sortCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Account Number (8 Digits) <span className="text-red-500">*</span>
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

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveStep(4)}
                      disabled={isSavingStep}
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-ots-yellow font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                    >
                      {isSavingStep ? (
                        <Loader2 className="w-4 h-4 animate-spin text-ots-yellow" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Submit All 4 Steps (100% Score)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ACTIVE DISPATCH TRIPS (GATED BY COMPLETION & APPROVAL)    */}
        {/* ============================================================== */}
        {activeTab === 'active' && (
          <div className="mt-6 space-y-4">
            {!isApproved ? (
              <div className="bg-white rounded-3xl border border-amber-200 p-8 text-center space-y-4 shadow-sm bg-amber-50/20">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Live Dispatch Locked – Onboarding Incomplete ({completionScore}%)
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md mx-auto mt-1">
                    To comply with UK Private Hire Operator regulations, you cannot receive ride assignments or go On-Duty until your PCO badge, vehicle, and insurance documents are 100% submitted and authorized.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('onboarding')}
                  className="px-5 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl shadow transition inline-flex items-center space-x-1.5"
                >
                  <span>Complete Onboarding Form (Score: {completionScore}%) ➔</span>
                </button>
              </div>
            ) : activeTrips.length === 0 ? (
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

        {/* ============================================================== */}
        {/* TAB 3: COMPLETED TRIP HISTORY                                  */}
        {/* ============================================================== */}
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

      </div>
    </div>
  );
}
