'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  Car, 
  LogOut, 
  Plus, 
  ChevronRight, 
  Printer, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, formatPrice } = useApp();

  // Mock initial bookings or retrieve from user history
  const [bookings, setBookings] = useState([
    {
      id: 'OTS-682194',
      from: 'London Heathrow Airport (LHR) Terminal 2',
      to: 'Covent Garden, Central London, WC2E 8HD',
      date: '2026-10-18',
      time: '14:30',
      vehicle: 'Executive Saloon (Mercedes E-Class)',
      passengers: 2,
      price: 68.0,
      status: 'Confirmed',
    },
    {
      id: 'OTS-491204',
      from: 'London Gatwick Airport (LGW) South Terminal',
      to: 'Brighton Seafront, BN1 2GS',
      date: '2026-09-04',
      time: '11:15',
      vehicle: 'Standard Saloon',
      passengers: 1,
      price: 75.0,
      status: 'Completed',
    },
  ]);

  const handleLogout = () => {
    logout();
    router.push('/account/login');
  };

  const displayName = user?.name || 'Valued Passenger';
  const displayEmail = user?.email || 'passenger@example.com';

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-ots-yellow text-black flex items-center justify-center font-extrabold text-2xl shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Welcome back, {displayName}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {displayEmail} &bull; Personal Account
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Transfer</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                My Bookings &amp; Transfers
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage upcoming airport pickups and view digital receipts
              </p>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <div key={b.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Ref & Status */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-extrabold text-gray-900 text-base">
                        {b.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        b.status === 'Confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2 text-gray-800">
                        <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span className="font-semibold">{b.from}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-800">
                        <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span className="font-semibold">{b.to}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Date, Time & Vehicle */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{b.date}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{b.time}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{b.vehicle}</span>
                    </div>
                  </div>

                  {/* Right: Price & View Receipt */}
                  <div className="flex items-center justify-between lg:justify-end space-x-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Fare</span>
                      <span className="text-lg font-extrabold text-gray-900">
                        {formatPrice(b.price)}
                      </span>
                    </div>

                    <Link
                      href={`/booking-confirmation?ref=${b.id}`}
                      className="px-4 py-2 bg-gray-100 hover:bg-ots-yellow hover:text-black text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View Voucher</span>
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
