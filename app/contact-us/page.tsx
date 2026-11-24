'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Loader2, 
  AlertCircle,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function ContactUsPage() {
  const router = useRouter();
  const { siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'Quick Car Midlands Ltd';
  const officeAddress = siteSettings?.office_address || 'Birmingham, West Midlands, United Kingdom';
  const supportPhone = siteSettings?.support_phone || '+44 (0) 121 285 5000';
  const supportEmail = siteSettings?.support_email || 'bookings@quickcarmidlands.co.uk';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, email, and message');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          bookingRef,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (data.status) {
        router.push('/sent');
      } else {
        setErrorMessage(data.message || 'Unable to submit your message. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setErrorMessage('Network error occurred. Please call our 24/7 helpline.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3.5 py-1 rounded-full">
            24/7 Customer Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Contact {brandName}
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Have a question regarding your airport transfer, need to amend a booking, or looking for corporate inquiries? Our support team is here 24 hours a day.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Telephone Lines</h3>
              <p className="text-xs text-gray-500 mt-1">Available 24 hours / 7 days</p>
              <div className="mt-2 space-y-1 text-xs">
                <div>
                  <span className="text-gray-400">UK Dispatch:</span>{' '}
                  <a href={`tel:${supportPhone}`} className="font-bold text-gray-900 hover:text-amber-600">
                    {supportPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Email Support</h3>
              <p className="text-xs text-gray-500 mt-1">Response time within 15 minutes</p>
              <div className="mt-2 space-y-1 text-xs">
                <div>
                  <span className="text-gray-400">Support Desk:</span>{' '}
                  <a href={`mailto:${supportEmail}`} className="font-bold text-gray-900 hover:text-amber-600">
                    {supportEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Head Office</h3>
              <p className="text-xs text-gray-500 mt-1">Registered in England &amp; Wales</p>
              <p className="text-xs text-gray-900 font-medium mt-2 leading-relaxed whitespace-pre-line">
                {brandName} Limited<br />
                {officeAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-md max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Fill out the form below and one of our transfer coordinators will get in touch immediately.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Miller"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Booking Reference (If Applicable)
                </label>
                <input
                  type="text"
                  placeholder="e.g. QCM-123456"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono focus:ring-2 focus:ring-ots-yellow focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Inquiry Topic
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Amend Existing Booking">Amend Existing Booking</option>
                <option value="Cancellation / Refund">Cancellation / Refund</option>
                <option value="Lost Property">Lost Property</option>
                <option value="Corporate / Partner Inquiry">Corporate / Partner Inquiry</option>
                <option value="Feedback / Complaint">Feedback / Complaint</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Your Message *
              </label>
              <textarea
                rows={4}
                placeholder="How can we help you today? Please include any flight details or pickup times..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
