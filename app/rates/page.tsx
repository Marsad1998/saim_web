'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Car, 
  Plane, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  MapPin, 
  Users, 
  Briefcase, 
  Sparkles,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { BIRMINGHAM_AIRPORT_FIXED_RATES } from '@/lib/pricing-engine';

export default function RateCardPage() {
  const { siteSettings, formatPrice } = useApp();
  const [airportSearch, setAirportSearch] = useState('');

  const brandName = siteSettings?.brand_name || 'Quick Car Midlands Ltd';
  const supportPhone = siteSettings?.support_phone || '+44 (0) 121 285 5000';

  const vehicleRates = [
    {
      category: 'Standard Saloon',
      modelExamples: 'VW Passat, Skoda Octavia, Ford Mondeo',
      ratePerMile: 1.50,
      minFare: 38.00,
      capacity: '4 Passengers • 2 Suitcases • 2 Hand Bags',
      badge: 'Most Popular',
      color: 'border-slate-300',
    },
    {
      category: 'Estate Car',
      modelExamples: 'Skoda Superb Estate, VW Passat Estate',
      ratePerMile: 1.70,
      minFare: 42.00,
      capacity: '4 Passengers • 4 Suitcases • 3 Hand Bags',
      badge: 'Extra Luggage',
      color: 'border-slate-300',
    },
    {
      category: 'Executive Saloon',
      modelExamples: 'Mercedes-Benz E-Class, BMW 5 Series, Audi A6',
      ratePerMile: 1.90,
      minFare: 48.00,
      capacity: '3 Passengers • 2 Suitcases • 2 Hand Bags',
      badge: 'Chauffeur Class',
      color: 'border-amber-400',
    },
    {
      category: 'MPV (5–6 Seater)',
      modelExamples: 'VW Sharan, Ford Galaxy, Citroen Spacetourer',
      ratePerMile: 2.05,
      minFare: 52.00,
      capacity: '5–6 Passengers • 4 Suitcases • 4 Hand Bags',
      badge: 'Family & Groups',
      color: 'border-slate-300',
    },
    {
      category: 'Minibus (8–9 Seater)',
      modelExamples: 'Mercedes Vito Tourer, Ford Tourneo Custom',
      ratePerMile: 2.55,
      minFare: 65.00,
      capacity: '8–9 Passengers • 8 Suitcases • 8 Hand Bags',
      badge: 'Large Groups',
      color: 'border-slate-300',
    },
  ];

  const fixedAirportsList = Object.values(BIRMINGHAM_AIRPORT_FIXED_RATES).filter((item) =>
    item.airportName.toLowerCase().includes(airportSearch.toLowerCase()) ||
    item.airportCode.toLowerCase().includes(airportSearch.toLowerCase())
  );

  const otherAirports = [
    { code: 'LCY', name: 'London City Airport' },
    { code: 'SOU', name: 'Southampton Airport' },
    { code: 'BOH', name: 'Bournemouth Airport' },
    { code: 'EXT', name: 'Exeter Airport' },
    { code: 'NWI', name: 'Norwich Airport' },
    { code: 'GLA', name: 'Glasgow Airport' },
    { code: 'EDI', name: 'Edinburgh Airport' },
    { code: 'ABZ', name: 'Aberdeen Airport' },
    { code: 'BFS', name: 'Belfast International Airport' },
    { code: 'BHD', name: 'Belfast City Airport' },
  ];

  const additionalCharges = [
    { service: 'Meet & Greet Service', charge: '£15.00', note: 'Driver waiting inside arrivals terminal with personalized name board' },
    { service: 'Flight Monitoring', charge: 'Complimentary', note: 'Real-time radar tracking so driver arrives exactly when you land' },
    { service: 'Airport Waiting Time', charge: 'First 45 Mins Free', note: 'Generous complimentary allowance to clear customs & luggage claim' },
    { service: 'Additional Waiting', charge: '£6 per 15 mins', note: 'Billed only after the 45-minute complimentary allowance' },
    { service: 'Additional Stop (Waypoint)', charge: 'From £10.00', note: 'Extra passenger pickups or drop-offs en route' },
    { service: 'Airport Parking & Drop-off Barrier', charge: 'At Cost', note: 'Actual barrier receipt charges passed without markup' },
  ];

  const terms = [
    'All fares are quoted in GBP (£) with transparent fixed rates.',
    'Prices are per vehicle, not per passenger.',
    'All journeys must be pre-booked online or by phone.',
    'Return journeys can be quoted separately or with round-trip discounts.',
    'Parking and airport barrier charges are additional unless specifically included.',
    'The final fare will be confirmed before dispatching your vehicle.',
    'Payments are securely accepted via credit/debit card, Stripe, or bank transfer.',
    'Child safety seats (0–4 yrs) and boosters (4–12 yrs) can be requested at booking.',
    'Vehicle availability and luggage capacity are verified prior to booking confirmation.',
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-black text-ots-yellow px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Customer Rate Card – 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            {brandName}
          </h1>
          <p className="text-base sm:text-lg text-gray-700 font-semibold">
            Airport Transfers &amp; Private Hire &bull; Based in Birmingham, United Kingdom
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-gray-600 pt-1">
            <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">Competitive Prices</span>
            <span>&bull;</span>
            <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">Professional Service</span>
            <span>&bull;</span>
            <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">Nationwide Coverage</span>
          </div>
          <p className="text-xs italic text-gray-500 font-medium pt-1">
            &ldquo;Your Journey, Our Priority.&rdquo;
          </p>
        </div>

        {/* 1. Vehicle Rates Per Mile */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-ots-yellow text-black font-black text-xs flex items-center justify-center">1</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Vehicle Rates – Per Mile</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Standard distance rates for non-fixed journeys throughout Birmingham &amp; nationwide UK.
              </p>
            </div>
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 self-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>No Surge Pricing • 100% Fixed Rates</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicleRates.map((v, i) => (
              <div 
                key={i} 
                className={`p-5 rounded-2xl border ${v.color} bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-900 text-base">{v.category}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-black text-ots-yellow px-2 py-0.5 rounded-md">
                      {v.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
                      <span className="text-[11px] text-gray-500 block">Rate / Mile</span>
                      <strong className="text-lg font-black text-gray-900 font-mono">£{v.ratePerMile.toFixed(2)}</strong>
                    </div>
                    <div className="bg-amber-50/60 p-2.5 rounded-xl text-center border border-amber-200/50">
                      <span className="text-[11px] text-amber-900 block font-medium">Minimum Fare</span>
                      <strong className="text-lg font-black text-amber-900 font-mono">£{v.minFare.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 pt-2 space-y-1">
                    <div className="flex items-center space-x-1.5 text-gray-700">
                      <Users className="w-3.5 h-3.5 text-ots-yellow-dark flex-shrink-0" />
                      <span className="font-medium text-[11px]">{v.capacity}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 pt-1">
                      <strong>Typical Models:</strong> {v.modelExamples}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <Link
                    href={`/?vehicle=${v.category.toLowerCase().includes('saloon') ? 'saloon' : v.category.toLowerCase().includes('estate') ? 'estate' : v.category.toLowerCase().includes('exec') ? 'executive-saloon' : v.category.toLowerCase().includes('mpv') ? 'mpv' : 'minibus-8'}`}
                    className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                  >
                    <span>Book {v.category}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Minimum Fare Rule:</strong> The minimum fare applies where the calculated mileage fare is lower than the minimum charge threshold for that specific vehicle tier.
            </p>
          </div>
        </div>

        {/* 2. Fixed Airport Transfer Prices From Birmingham */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-ots-yellow text-black font-black text-xs flex items-center justify-center">2</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  Fixed Airport Transfer Prices from Birmingham
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                All prices are one-way, per vehicle (not per passenger), to or from Birmingham.
              </p>
            </div>

            {/* Quick airport search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search airport (e.g. LHR, Gatwick)..."
                value={airportSearch}
                onChange={(e) => setAirportSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141720] text-white uppercase text-[11px] tracking-wider font-extrabold">
                <tr>
                  <th className="p-3.5 sm:p-4">UK Airport</th>
                  <th className="p-3.5 sm:p-4 text-center">Miles (Approx)</th>
                  <th className="p-3.5 sm:p-4 text-right">Standard Saloon</th>
                  <th className="p-3.5 sm:p-4 text-right">Estate Car</th>
                  <th className="p-3.5 sm:p-4 text-right">Executive</th>
                  <th className="p-3.5 sm:p-4 text-right">MPV (5–6)</th>
                  <th className="p-3.5 sm:p-4 text-right">Minibus (8–9)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {fixedAirportsList.map((row, i) => (
                  <tr key={i} className="hover:bg-amber-50/50 transition">
                    <td className="p-3.5 sm:p-4 font-bold text-gray-900 flex items-center space-x-2">
                      <Plane className="w-4 h-4 text-ots-yellow-dark flex-shrink-0" />
                      <span>{row.airportName}</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-center font-mono text-gray-500 font-semibold">
                      {row.airportCode === 'BHX' ? 'Local' : `${row.approxMiles} mi`}
                    </td>
                    <td className="p-3.5 sm:p-4 text-right font-black font-mono text-gray-900">
                      £{row.prices.saloon}
                    </td>
                    <td className="p-3.5 sm:p-4 text-right font-black font-mono text-gray-900">
                      £{row.prices.estate}
                    </td>
                    <td className="p-3.5 sm:p-4 text-right font-black font-mono text-amber-700">
                      £{row.prices['executive-saloon']}
                    </td>
                    <td className="p-3.5 sm:p-4 text-right font-black font-mono text-gray-900">
                      £{row.prices.mpv}
                    </td>
                    <td className="p-3.5 sm:p-4 text-right font-black font-mono text-indigo-700">
                      £{row.prices['minibus-8']}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-gray-500 italic">
            * Airport distances are approximate. Fixed fares are subject to confirmation of the exact pickup and drop-off postcodes within the West Midlands region.
          </p>
        </div>

        {/* 3. Other UK Airports */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
            <span className="w-6 h-6 rounded-full bg-ots-yellow text-black font-black text-xs flex items-center justify-center">3</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Other UK Airports We Serve</h2>
          </div>
          <p className="text-xs text-gray-600">
            We provide nationwide 24/7 transfers connecting Birmingham &amp; the Midlands to all commercial UK airports:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {otherAirports.map((a, i) => (
              <div key={i} className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-center space-y-1">
                <span className="font-mono text-xs font-black text-gray-900 block">{a.code}</span>
                <span className="text-[11px] text-gray-600 block">{a.name}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 pt-2">
            Please contact our 24/7 dispatch desk at <a href={`tel:${supportPhone}`} className="font-bold text-gray-900 hover:text-amber-600">{supportPhone}</a> for a personalized fixed-price quotation for regional and Scottish/Irish airports.
          </div>
        </div>

        {/* 4. Additional Services & Charges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
              <span className="w-6 h-6 rounded-full bg-ots-yellow text-black font-black text-xs flex items-center justify-center">4</span>
              <h2 className="text-xl font-extrabold text-gray-900">Additional Services &amp; Charges</h2>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {additionalCharges.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-gray-900 block">{item.service}</strong>
                    <span className="text-gray-500 text-[11px]">{item.note}</span>
                  </div>
                  <span className="font-mono font-black text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-900 whitespace-nowrap">
                    {item.charge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Booking & Payment Terms */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
              <span className="w-6 h-6 rounded-full bg-ots-yellow text-black font-black text-xs flex items-center justify-center">5</span>
              <h2 className="text-xl font-extrabold text-gray-900">Booking &amp; Payment Terms</h2>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-700">
              {terms.map((t, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Call to action card */}
        <div className="bg-[#141720] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 relative overflow-hidden border border-neutral-800 shadow-xl">
          <div className="taxi-pattern h-2 w-full absolute top-0 left-0 right-0" />
          <h2 className="text-2xl sm:text-3xl font-extrabold pt-2">
            Ready to Book Your Transfer with {brandName}?
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            Get an instant fixed-price quotation online with zero surge pricing, free flight monitoring, and 45 minutes complimentary waiting time.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-sm rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <span>Calculate Your Fare Online</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${supportPhone}`}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition flex items-center space-x-2"
            >
              <Phone className="w-4 h-4 text-ots-yellow" />
              <span>Call Dispatch ({supportPhone})</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}