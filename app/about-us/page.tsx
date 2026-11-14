import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  Award, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Car,
  ChevronRight
} from 'lucide-react';

export default function AboutUsPage() {
  const stats = [
    { label: 'Years in Operation', val: '15+' },
    { label: 'Journeys Completed', val: '500,000+' },
    { label: 'On-Time Arrival Rate', val: '99.4%' },
    { label: 'Customer Satisfaction', val: '4.8 / 5' },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3.5 py-1 rounded-full">
            About OTS Taxi
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            Your Trusted UK Airport Transfer &amp; Long-Distance Cab Partner
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed">
            OTS Taxi Limited is one of the United Kingdom&apos;s leading airport transfer specialists, delivering reliable, fixed-rate, private hire transport for business and leisure travelers worldwide.
          </p>
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-ots-yellow-dark">
                {s.val}
              </div>
              <div className="text-xs text-gray-500 font-semibold mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Story & Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Who We Are
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mt-3">
                Established under Companies House registration <strong>06783060</strong>, <strong>OTS Taxi Limited</strong> was founded with a single mission: to eliminate the stress, uncertainty, and hidden surcharges commonly associated with UK airport travel.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-3">
                Whether you are arriving at London Heathrow for an international summit, traveling with family to London Gatwick for a summer holiday, or organizing corporate transfers across Manchester and Birmingham, OTS Taxi provides fully licensed private hire solutions with transparent upfront pricing.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Our Core Commitments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 block">100% Fixed Rates</strong>
                    <span>No surging during peak rush hours, adverse weather, or road traffic delays.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 block">Live Flight Tracking</strong>
                    <span>Complimentary radar monitoring ensures your driver adjusts to flight time shifts.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 block">45 Mins Free Waiting Time</strong>
                    <span>Ample time to clear customs and passport control without stress.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 block">Vetted &amp; Licensed Drivers</strong>
                    <span>Every driver is enhanced DBS checked and licensed by Transport for London or local councils.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Our Fleet
              </h3>
              <p className="text-gray-600 text-sm mt-2">
                We operate an expansive modern fleet catering to all group sizes and passenger requirements:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-gray-700">
                <li className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-ots-yellow" />
                  <span><strong>Standard Saloon:</strong> VW Passat, Skoda Octavia</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-ots-yellow" />
                  <span><strong>Estate:</strong> VW Passat Estate, Skoda Superb</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-ots-yellow" />
                  <span><strong>Executive Saloon:</strong> Mercedes-Benz E-Class, BMW 5 Series</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-ots-yellow" />
                  <span><strong>MPV (5-6 Passengers):</strong> Ford Galaxy, VW Sharan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-ots-yellow" />
                  <span><strong>8-Seater Minibus:</strong> Mercedes Vito, Ford Tourneo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-ots-yellow" />
                  <span><strong>Executive MPV:</strong> Mercedes-Benz V-Class</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Company details sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#141720] text-white p-6 rounded-2xl border border-white/10 space-y-5">
              <h3 className="text-base font-bold text-ots-yellow uppercase tracking-wider">
                Corporate Credentials
              </h3>
              
              <div className="space-y-3 text-xs text-gray-300">
                <div>
                  <span className="text-gray-400 block">Registered Company Name</span>
                  <span className="font-bold text-white text-sm">OTS Taxi Limited</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Company Registration Number</span>
                  <span className="font-mono text-white text-sm">06783060</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Registered Head Office</span>
                  <span className="text-white block mt-0.5">
                    83 Baker Street, Marylebone,<br />
                    London, W1U 6AG, United Kingdom
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Customer Dispatch Center</span>
                  <span className="text-white block mt-0.5">
                    Open 24 Hours / 7 Days a Week
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <a
                  href="tel:+442080040000"
                  className="flex items-center space-x-2 text-sm text-ots-yellow hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  <span>+44 (0) 208 004 0000</span>
                </a>
                <a
                  href="mailto:bookings@otstaxi.com"
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white"
                >
                  <Mail className="w-4 h-4" />
                  <span>bookings@otstaxi.com</span>
                </a>
              </div>
            </div>

            {/* Quick booking card */}
            <div className="bg-ots-yellow p-6 rounded-2xl text-black space-y-3">
              <h3 className="text-lg font-extrabold">Ready to Book Your Transfer?</h3>
              <p className="text-xs text-black/80">
                Get an instant quote online with zero obligation and fixed pricing.
              </p>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-black hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow transition-colors"
              >
                <span>Calculate Your Fare</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
