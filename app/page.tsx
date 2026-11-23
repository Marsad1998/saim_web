'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  Plane, 
  CreditCard, 
  Headphones, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Car, 
  ChevronRight, 
  Award, 
  Users 
} from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import { UK_AIRPORTS } from '@/lib/airports-data';
import { useApp } from '@/components/context/AppContext';

export default function HomePage() {
  const { formatPrice, siteSettings } = useApp();
  const brandName = siteSettings?.brand_name || 'OTS Taxi';
  const popularAirports = UK_AIRPORTS.slice(0, 8);

  const testimonials = [
    {
      name: 'David Robinson',
      location: 'London Heathrow to Cambridge',
      rating: 5,
      date: '2 days ago',
      comment: 'Excellent service! Driver was waiting with a clear name board right at arrivals despite our flight being delayed 40 minutes. Clean Mercedes and smooth journey.',
    },
    {
      name: 'Sarah Jenkins',
      location: 'Gatwick Airport to Brighton',
      rating: 5,
      date: '1 week ago',
      comment: 'Best airport transfer company in the UK. Booked an 8-seater minibus for the family with child seats. Driver was punctual, courteous, and very helpful with all our luggage.',
    },
    {
      name: 'Markus Weber',
      location: 'Stansted Airport to Central London',
      rating: 5,
      date: '2 weeks ago',
      comment: `Fixed price gave me peace of mind with no hidden surge costs. Highly recommend ${brandName} for business and personal travel.`,
    },
  ];

  const faqs = [
    {
      q: 'How do I meet my driver at the airport?',
      a: 'Your driver will be waiting in the arrival hall inside the terminal after customs clearance, holding a name board with your name. You will also receive an SMS and email with your driver’s contact number and vehicle registration before arrival.',
    },
    {
      q: 'What happens if my flight is delayed?',
      a: 'We monitor all inbound flights live via airport radar. If your flight is delayed or arrives early, your pick-up time is automatically adjusted without any additional charge.',
    },
    {
      q: 'How much waiting time is included for airport pick-ups?',
      a: 'We provide 45 minutes of complimentary waiting time after your flight actually lands (up to 60 minutes for international long-haul flights), giving you plenty of time to clear passport control and collect luggage.',
    },
    {
      q: 'Are your prices fixed with no hidden fees?',
      a: 'Yes, 100% fixed! The price quoted at checkout includes all taxes, airport drop-off/pick-up barrier charges, and toll fees. You will never encounter surge pricing or meter surcharges.',
    },
    {
      q: 'Can I request a child car seat?',
      a: 'Yes, we provide infant seats, toddler seats, and booster cushions free of charge upon request during Step 1 of your booking.',
    },
    {
      q: 'What is your cancellation policy?',
      a: 'You can cancel free of charge up to 12 hours prior to your scheduled pick-up time with a 100% full refund.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#141720] text-white pt-10 pb-20 md:py-24 overflow-hidden">
        {/* Background gradient & decorative dots */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFCC00_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ots-yellow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-5">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-gray-200">
                <div className="flex text-ots-yellow">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-ots-yellow text-ots-yellow" />
                  ))}
                </div>
                <span className="font-semibold text-white">4.8 / 5 Rating</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-300">Google Verified</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                UK Airport Transfers &amp; <span className="text-ots-yellow">Long Distance</span> Cabs
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Reliable, fixed-price private hire airport transfers across London and the UK. Free flight tracking, 45 minutes complimentary wait time, and licensed professional drivers.
              </p>

              {/* Quick highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>100% Fixed Fare Guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>Free Flight Monitoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>Meet &amp; Greet In Terminal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-ots-yellow flex-shrink-0" />
                  <span>24/7 UK Customer Support</span>
                </div>
              </div>
            </div>

            {/* Right Hero Booking Form */}
            <div className="lg:col-span-7">
              <BookingForm />
            </div>

          </div>
        </div>
      </section>

      {/* Taxi Checkered Ribbon */}
      <div className="taxi-pattern h-3 w-full border-t border-b border-black/10" />

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3 py-1 rounded-full">
              Quick &amp; Seamless
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
              How Does It Work?
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Book your UK airport taxi in 3 effortless steps with instant digital confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all relative">
              <div className="w-14 h-14 bg-ots-yellow text-black font-extrabold rounded-2xl mx-auto flex items-center justify-center text-xl shadow-md mb-5">
                01
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Get Instant Quote</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Enter your pick-up point, airport destination, date, and travel time to view all fixed vehicle rates instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all relative">
              <div className="w-14 h-14 bg-[#141720] text-ots-yellow font-extrabold rounded-2xl mx-auto flex items-center justify-center text-xl shadow-md mb-5">
                02
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Select Your Vehicle</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose from Standard Saloons, Estates, Executive Mercedes, or 8-Seater Minibuses suited to your passengers and luggage.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all relative">
              <div className="w-14 h-14 bg-ots-yellow text-black font-extrabold rounded-2xl mx-auto flex items-center justify-center text-xl shadow-md mb-5">
                03
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Confirmation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Secure your booking online with Stripe. Receive instant booking confirmation, voucher, and driver tracking updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Features */}
      <section className="py-16 bg-[#141720] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-black bg-ots-yellow px-3 py-1 rounded-full">
              Our Guarantees
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">
              Why Travel With {brandName}?
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Over 15 years providing reliable airport transfers across the United Kingdom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-ots-yellow/50 transition-colors">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-ots-yellow mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Fixed Prices &amp; No Hidden Fees</h3>
              <p className="text-gray-400 text-sm">
                No surge pricing during rush hour or adverse weather. All airport car park barriers and tolls are included.
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-ots-yellow/50 transition-colors">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-ots-yellow mb-4">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Live Flight Tracking</h3>
              <p className="text-gray-400 text-sm">
                We monitor incoming flights in real-time. If your plane arrives late, we reschedule your driver at no extra cost.
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-ots-yellow/50 transition-colors">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-ots-yellow mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Complimentary Waiting Time</h3>
              <p className="text-gray-400 text-sm">
                Enjoy 45 minutes of free waiting time for domestic flights, and 60 minutes for international long-haul flights.
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-ots-yellow/50 transition-colors">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-ots-yellow mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Licensed &amp; DBS Checked</h3>
              <p className="text-gray-400 text-sm">
                Every driver is fully licensed by UK local authorities and Transport for London, background checked and vetted.
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-ots-yellow/50 transition-colors">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-ots-yellow mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">24/7 Customer Support</h3>
              <p className="text-gray-400 text-sm">
                Our London-based operations center is open 24/7/365 to assist with journey amendments, delays, and inquiries.
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-ots-yellow/50 transition-colors">
              <div className="w-12 h-12 bg-ots-yellow/20 rounded-xl flex items-center justify-center text-ots-yellow mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Free Child Car Seats</h3>
              <p className="text-gray-400 text-sm">
                Traveling with family? Request baby, infant, or booster seats during booking completely free of charge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Airports Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                UK Destinations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                Popular UK Airport Transfers
              </h2>
            </div>
            <Link
              href="/airports"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1 text-sm font-bold text-black hover:text-ots-yellow transition-colors group"
            >
              <span>View All 20+ UK Airports</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularAirports.map((airport) => (
              <Link
                key={airport.iata}
                href={`/airport/${airport.slug}`}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-ots-yellow hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-12 h-8 rounded-lg bg-ots-yellow/20 text-black font-extrabold text-sm flex items-center justify-center group-hover:bg-ots-yellow transition-colors font-mono">
                      {airport.iata}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {airport.terminals.length} {airport.terminals.length > 1 ? 'Terminals' : 'Terminal'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base group-hover:text-amber-600 transition-colors">
                    {airport.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {airport.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">From</span>
                    <span className="text-base font-extrabold text-gray-900">{formatPrice(35)}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 group-hover:text-ots-yellow flex items-center space-x-1">
                    <span>Book Taxi</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-1 text-ots-yellow mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-ots-yellow text-ots-yellow" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Trusted by Thousands of Travelers
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Read real feedback from passengers who booked their UK transfers with {brandName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex text-ots-yellow mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-ots-yellow text-ots-yellow" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm italic leading-relaxed">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.location} &bull; {t.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Everything you need to know about booking your airport taxi with {brandName}.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-gray-200 p-5 open:ring-2 open:ring-ots-yellow/30 transition-all cursor-pointer"
              >
                <summary className="font-bold text-gray-900 text-base list-none flex items-center justify-between select-none">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <p className="text-gray-600 text-sm mt-3 pt-3 border-t border-gray-100 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate & Partner CTA banner */}
      <section className="bg-ots-yellow py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-black">
              Are you a Travel Agent, Hotel, or Corporate Client?
            </h3>
            <p className="text-black/80 text-sm mt-1">
              Join our {brandName} Partner Portal for monthly invoicing, priority dispatch, and volume commissions.
            </p>
          </div>
          <Link
            href="/partners"
            className="px-6 py-3 bg-black hover:bg-gray-900 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex-shrink-0"
          >
            Become a Partner
          </Link>
        </div>
      </section>
    </div>
  );
}
