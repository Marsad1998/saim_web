'use client';

import React from 'react';
import { useApp } from '@/components/context/AppContext';

export default function PrivacyPolicyPage() {
  const { siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'OTS Taxi';
  const companyNumber = siteSettings?.company_number || '06783060';
  const supportEmail = siteSettings?.support_email || 'support@otstaxi.co.uk';

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            Data Protection
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: October 2026 &bull; {brandName} Limited (Company No: {companyNumber})</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Introduction and Data Controller</h2>
            <p>
              {brandName} Limited (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal data in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
            <p>
              This policy explains how we collect, store, process, and safeguard personal information when you use our website or book transportation services through us.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Personal Data We Collect</h2>
            <p>We may collect and process the following categories of personal information:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Contact Information:</strong> Full name, email address, telephone/mobile number.</li>
              <li><strong>Journey Details:</strong> Pick-up address, drop-off destination, flight number, airline, travel dates and times.</li>
              <li><strong>Payment Data:</strong> Payment card details processed securely via Stripe (PCI-DSS compliant). We do not store full credit card numbers on our servers.</li>
              <li><strong>Technical Identifiers:</strong> IP address, browser type, device information, and session cookies.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Purpose and Legal Basis of Processing</h2>
            <p>
              We process personal data primarily for the performance of our contract with you (arranging and executing your airport transfer), to provide real-time flight tracking, to communicate with you regarding your driver assignment, and to fulfill UK regulatory compliance obligations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. Sharing Your Data</h2>
            <p>
              We only share your passenger information (passenger name, contact telephone, and journey itinerary) with the designated licensed driver or private hire operator assigned to carry out your transfer. We never sell or license your personal information to third-party marketers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">5. Your Data Protection Rights</h2>
            <p>
              Under UK data protection laws, you possess the right to access, rectify, or request erasure of your personal data, as well as the right to data portability. To exercise these rights, please contact our Data Protection Officer at <strong>{supportEmail}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}