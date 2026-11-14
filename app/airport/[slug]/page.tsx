import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Plane, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Car,
  Star
} from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import { UK_AIRPORTS } from '@/lib/airports-data';

export function generateStaticParams() {
  return UK_AIRPORTS.map((airport) => ({
    slug: airport.slug,
  }));
}

export default function AirportDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const airport = UK_AIRPORTS.find(
    (a) => a.slug.toLowerCase() === params.slug.toLowerCase()
  ) || UK_AIRPORTS[0];

  const popularRoutes = [
    { destination: 'Central London (Westminster / Soho)', distance: '16 miles', price: '£55.00' },
    { destination: 'Canary Wharf / Docklands', distance: '22 miles', price: '£68.00' },
    { destination: 'London Heathrow Airport (Airport Transfer)', distance: '28 miles', price: '£75.00' },
    { destination: 'Cambridge University & City Center', distance: '65 miles', price: '£135.00' },
    { destination: 'Oxford City Center', distance: '50 miles', price: '£110.00' },
    { destination: 'Brighton & South Coast', distance: '58 miles', price: '£125.00' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#141720] text-white pt-10 pb-20 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFCC00_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Airport Info */}
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-gray-200">
                <span className="font-extrabold text-ots-yellow font-mono text-sm">{airport.iata}</span>
                <span className="text-gray-400">|</span>
                <span className="text-white font-medium">{airport.city}, United Kingdom</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {airport.name} <span className="text-ots-yellow">Taxi &amp; Transfers</span>
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {airport.description} Book fixed-price private hire airport cabs with free flight delay monitoring, 45 mins complimentary terminal waiting time, and meet &amp; greet included.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-gray-300 text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>Terminals: {airport.terminals.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>Meet &amp; Greet In Terminal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>Free Flight Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>100% Fixed Fares</span>
                </div>
              </div>
            </div>

            {/* Right Booking Form (Pre-populated) */}
            <div className="lg:col-span-7">
              <BookingForm initialValues={{ pickup: `${airport.name} (${airport.iata})` }} />
            </div>

          </div>
        </div>
      </section>

      {/* Taxi ribbon */}
      <div className="taxi-pattern h-3 w-full border-t border-b border-black/10" />

      {/* Meeting Point & Terminal Guides */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Where Will My Driver Meet Me at {airport.iata}?
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              All OTS Taxi drivers wait inside the arrivals hall inside the passenger terminal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black font-extrabold">
                01
              </div>
              <h3 className="text-base font-bold text-gray-900">Inside Terminal Arrivals</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                After collecting your luggage and clearing customs and passport control, walk through into the arrival hall. Your driver will be waiting holding a distinct name board.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black font-extrabold">
                02
              </div>
              <h3 className="text-base font-bold text-gray-900">Flight Radar Tracking</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We monitor incoming flights in real time. Whether your plane is delayed by 30 minutes or 2 hours, your driver enters the terminal synchronized with your landing time.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-black font-extrabold">
                03
              </div>
              <h3 className="text-base font-bold text-gray-900">45 Mins Complimentary Wait</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Enjoy 45 minutes of free waiting time from the moment the aircraft touches down, giving you ample time to collect bags and pass through UK Border Force.
              </p>
            </div>
          </div>

          {/* Popular Routes from this Airport */}
          <div className="pt-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Popular Fixed-Price Routes from {airport.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Estimated fixed fares for Standard Saloon vehicles. All airport car park exit barriers are included.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularRoutes.map((route, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{route.destination}</h4>
                    <span className="text-[11px] text-gray-500">{route.distance}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-gray-900 block">{route.price}</span>
                    <span className="text-[10px] text-green-600 font-semibold">Fixed Fare</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Airport FAQs */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Frequently Asked Questions About {airport.name} Transfers
            </h2>
          </div>

          <div className="space-y-4">
            {airport.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-gray-200 p-5 cursor-pointer"
              >
                <summary className="font-bold text-gray-900 text-sm list-none flex items-center justify-between select-none">
                  <span>{faq.question}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-gray-600 text-xs mt-3 pt-3 border-t border-gray-100 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
