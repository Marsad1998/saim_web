'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Home, ArrowLeft } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function SentPage() {
  const { siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'OTS Taxi';

  return (
    <div className="bg-[#f8f9fa] min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900">
          Message Sent Successfully
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed">
          Thank you for reaching out to {brandName}. A member of our 24/7 customer service operations team will review your message and respond within 15 minutes.
        </p>

        <div className="pt-4 flex flex-col space-y-3">
          <Link
            href="/"
            className="w-full py-3 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Homepage</span>
          </Link>

          <Link
            href="/contact-us"
            className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Send Another Message
          </Link>
        </div>
      </div>
    </div>
  );
}