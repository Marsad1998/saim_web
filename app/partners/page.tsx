'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Briefcase, 
  Plane, 
  Car, 
  CheckCircle2, 
  Send, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function PartnersPage() {
  const { siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'OTS Taxi';
  const [partnerType, setPartnerType] = useState('Travel Agent');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fleetSize, setFleetSize] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerType,
          companyName,
          contactName,
          email,
          phone,
          fleetSize,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || 'Failed to submit application. Please check your details.');
      }
    } catch (err) {
      console.error('Partner submission error:', err);
      setErrorMessage('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3.5 py-1 rounded-full">
            B2B &amp; Corporate Partnerships
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Partner With {brandName}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed">
            Expand your transportation offerings with the UK&apos;s most reliable airport transfer network. We work with travel agents, corporate entities, airlines, and licensed private hire fleets.
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Travel Agents &amp; OTAs</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Earn competitive commissions on every airport transfer booked. Access our agent portal for bulk itineraries and client vouchers.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Up to 12% commission per completed ride</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Instant confirmation vouchers</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Corporate Business Accounts</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Streamline executive and employee airport travel with 30-day itemized invoicing, priority booking, and dedicated account managers.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Consolidated monthly billing</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Executive Mercedes fleet guarantee</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Licensed Fleets &amp; Drivers</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you a licensed UK private hire operator or chauffeur? Join our dispatch network and receive high-yield pre-booked airport jobs.
            </p>
            <ul className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Guaranteed weekly driver payouts</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Long-distance &amp; airport priority routes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-md max-w-3xl mx-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Application Submitted</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Thank you for your interest in partnering with {brandName}. Our corporate relations team will review your details and contact you within 1 business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  Register Your Partnership Interest
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Complete the inquiry form to start working with {brandName}.
                </p>
                {errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Partner Category
                </label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                >
                  <option value="Travel Agent">Travel Agent / Tour Operator</option>
                  <option value="Corporate Client">Corporate Client / Business Account</option>
                  <option value="Airline / Hotel">Airline / Hotel / Concierge</option>
                  <option value="Fleet Operator">Licensed Taxi Operator / Fleet</option>
                  <option value="Affiliate / API">Affiliate / API Integration</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Travel Group"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@acmetravel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 20 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Additional Details / Estimated Monthly Journeys
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your estimated journey volume, routes of interest, or requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Partnership Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
