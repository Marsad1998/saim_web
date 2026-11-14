import React from 'react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded">
            Customer Guarantee
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: October 2026 &bull; OTS Taxi Limited (Company No: 06783060)</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Our 100% Refund Policy Guarantee</h2>
            <p>
              At OTS Taxi, customer satisfaction and peace of mind are our highest priorities. We understand that travel plans and flight itineraries can shift unexpectedly.
            </p>
            <p>
              Any booking cancelled at least <strong>12 hours prior</strong> to the scheduled pick-up time is entitled to a <strong>100% full refund</strong> back to the original payment method without any administrative deductions or processing penalties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Cancellation Timelines &amp; Charges</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden mt-3 text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Notice Given Before Pick-up</th>
                    <th className="p-3">Refund Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-3 font-medium">12+ Hours Notice</td>
                    <td className="p-3 text-green-700 font-bold">100% Full Refund</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Between 6 and 12 Hours Notice</td>
                    <td className="p-3 text-amber-700 font-bold">50% Partial Refund</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Less than 6 Hours Notice or No-show</td>
                    <td className="p-3 text-red-600 font-bold">Non-refundable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Flight Cancellations by Airline</h2>
            <p>
              If your inbound flight is cancelled entirely by the airline, please notify our 24/7 customer service desk at least 3 hours before the scheduled flight arrival. Upon verification of flight cancellation, we will provide you with a 100% full refund or credit for your rescheduled flight.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. How to Request a Cancellation or Refund</h2>
            <p>
              To cancel or amend your booking, you can:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Call our 24/7 Operations Desk at <strong>+44 (0) 208 004 0000</strong></li>
              <li>Email us at <strong>bookings@otstaxi.com</strong> quoting your booking reference (e.g. OTS-XXXXXX)</li>
              <li>Access your account dashboard and select &ldquo;Cancel Booking&rdquo;</li>
            </ul>
            <p className="pt-1">
              Refunds are processed automatically via Stripe and typically reflect in your bank account within 3 to 5 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
