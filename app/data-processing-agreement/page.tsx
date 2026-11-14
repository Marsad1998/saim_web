import React from 'react';

export default function DataProcessingAgreementPage() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            Corporate Terms
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            Data Processing Agreement (DPA)
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: October 2026 &bull; OTS Taxi Limited (Company No: 06783060)</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Scope and Applicability</h2>
            <p>
              This Data Processing Agreement (&ldquo;DPA&rdquo;) applies where OTS Taxi Limited acts as a Data Processor on behalf of Corporate Clients, Travel Agencies, or Tour Operators (&ldquo;Data Controllers&rdquo;) who submit passenger manifests and personal data for private hire ground transportation services in the UK.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Processing of Customer Personal Data</h2>
            <p>
              OTS Taxi agrees to process Personal Data exclusively in accordance with documented instructions from the Controller, and solely for the purposes of delivering ground transportation transfers, flight tracking, and safety fulfillment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Technical and Organisational Security Measures</h2>
            <p>
              OTS Taxi implements appropriate industry-standard technical measures including data encryption, access controls, vulnerability scanning, and background vetting of all staff and partner drivers handling passenger information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
