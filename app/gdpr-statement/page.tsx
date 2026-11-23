'use client';

import React from 'react';
import { useApp } from '@/components/context/AppContext';

export default function GdprStatementPage() {
  const { siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'OTS Taxi';
  const companyNumber = siteSettings?.company_number || '06783060';
  const supportEmail = siteSettings?.support_email || 'support@otstaxi.co.uk';

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            GDPR Compliance Statement
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: October 2026 &bull; {brandName} Limited (Company No: {companyNumber})</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">Commitment to Data Privacy</h2>
            <p>
              {brandName} Limited is fully committed to upholding the principles laid out in the General Data Protection Regulation (GDPR) and the UK Data Protection Act 2018. We recognize the importance of personal data security for both our individual passengers and our corporate partners.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">Core Principles</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Lawfulness, Fairness and Transparency:</strong> Personal data is processed fairly, transparently, and only with valid legal basis.</li>
              <li><strong>Purpose Limitation:</strong> We only collect information strictly required to coordinate passenger journeys, flight monitoring, and billing.</li>
              <li><strong>Data Minimization:</strong> We do not retain unnecessary identifiable data.</li>
              <li><strong>Accuracy:</strong> Customers may update or amend their booking details at any time prior to departure.</li>
              <li><strong>Integrity and Confidentiality:</strong> All data is encrypted in transit using TLS 1.3 and at rest with AES-256 standard encryption.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">Data Subject Requests</h2>
            <p>
              To submit a Subject Access Request (SAR) or request erasure of your data under the Right to be Forgotten, email our Data Protection Officer directly at <strong>{supportEmail}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}