'use client';

import React from 'react';
import { useApp } from '@/components/context/AppContext';

export default function TermsPage() {
  const { siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'Quick Car Midlands Ltd';
  const companyNumber = siteSettings?.company_number || '12345678';
  const officeAddress = siteSettings?.office_address || 'Birmingham, West Midlands, United Kingdom';

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            Legal Terms
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            Terms of Carriage &amp; Booking Conditions
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: October 2026 &bull; {brandName} Limited (Company No: {companyNumber})</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Definitions and Acceptance</h2>
            <p>
              These Terms of Carriage govern all bookings and contracts made with <strong>{brandName} Limited</strong> (&ldquo;{brandName}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;), a private limited company registered in England and Wales under Company Registration Number {companyNumber}, having its registered office at {officeAddress}.
            </p>
            <p>
              By completing a booking on our website, by telephone, or via an authorized partner portal, you (&ldquo;the Client&rdquo;, &ldquo;Passenger&rdquo;) confirm your full acceptance of these terms and conditions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Bookings, Fares and Quotations</h2>
            <p>
              All prices quoted online are fixed and inclusive of all applicable UK Value Added Tax (VAT), airport barrier access charges, road tolls, and congestion charges unless explicitly stated otherwise.
            </p>
            <p>
              Quotations are based on the direct route and passengers/luggage indicated at the time of quotation. Any unnotified intermediate stops (waypoints), deviations, or upgrades to larger vehicle categories requested upon travel will be subject to additional charges.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Airport Pick-ups and Waiting Time</h2>
            <p>
              <strong>Complimentary Waiting Time:</strong> For all airport collections, 45 minutes of complimentary waiting time is provided, calculated from the actual radar landing time of the incoming flight. For international long-haul arrivals, up to 60 minutes is granted.
            </p>
            <p>
              <strong>Waiting Time Surcharges:</strong> Should waiting time exceed the complimentary allowance due to passenger delays (such as lost baggage disputes or prolonged border checks without notifying {brandName}), waiting time is charged at £20.00 per hour (or £5.00 per 15-minute increment) thereafter.
            </p>
            <p>
              <strong>Flight Radar Tracking:</strong> {brandName} monitors flight arrival times live. If your flight is delayed or rescheduled by the airline, your driver&apos;s arrival time will be updated automatically at zero extra surcharge.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. Cancellations and Refunds</h2>
            <p>
              <strong>12-Hour Cancellation Rule:</strong> Bookings cancelled more than 12 hours prior to the scheduled pick-up time are eligible for a 100% full refund with no administrative deduction.
            </p>
            <p>
              <strong>Late Cancellations:</strong> Cancellations made between 6 and 12 hours prior to pick-up time are subject to a 50% cancellation fee. Cancellations made within 6 hours of pick-up, or in the event of a passenger &ldquo;no-show&rdquo;, are non-refundable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">5. Passenger Conduct and Safety</h2>
            <p>
              Drivers reserve the right to refuse carriage to any passenger who is deemed abusive, intoxicated, or who presents a safety hazard to other occupants or the vehicle.
            </p>
            <p>
              Soiling of the vehicle interior resulting from sickness, spillage of liquids, or negligence will incur a professional valeting fee of £80.00.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">6. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the English courts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}