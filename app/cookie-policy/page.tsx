'use client';

import React from 'react';
import { useApp } from '@/components/context/AppContext';

export default function CookiePolicyPage() {
  const { siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'OTS Taxi';
  const companyNumber = siteSettings?.company_number || '06783060';

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            Cookie Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            Cookie Policy
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: October 2026 &bull; {brandName} Limited (Company No: {companyNumber})</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your computer, tablet, or smartphone when you visit a website. They allow the website to recognize your device, remember preferences (such as selected currency and language), and ensure smooth functionality during the multi-step booking process.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Cookies We Use</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>
                <strong>Strictly Necessary Cookies:</strong> Essential for the operation of our quote calculation, session management, and Stripe secure payment gateway.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your preferred currency (GBP, EUR, USD) and language settings across your visits.
              </li>
              <li>
                <strong>Analytical Cookies:</strong> Help us measure visitor engagement, popular transfer routes, and optimize website performance anonymously.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Managing Your Cookies</h2>
            <p>
              You can control and disable cookies via your browser settings at any time. However, disabling strictly necessary cookies may prevent the booking quote form and payment process from functioning correctly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}