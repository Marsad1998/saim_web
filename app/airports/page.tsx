'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plane, 
  Search, 
  MapPin, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UK_AIRPORTS } from '@/lib/airports-data';

export default function AirportsDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAirports = UK_AIRPORTS.filter((airport) =>
    airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.iata.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airport.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-ots-yellow bg-black px-3.5 py-1 rounded-full">
            UK Airport Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            UK Airport Taxi Transfers &amp; Pick-ups
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Book private hire airport transfers to and from all commercial passenger airports across England, Scotland, Wales, and Northern Ireland.
          </p>

          {/* Search bar */}
          <div className="mt-6 max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search by airport name, city, or IATA code (e.g. LHR, Gatwick, Manchester)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3.5 pl-12 bg-white border border-gray-300 rounded-2xl text-gray-900 text-sm shadow-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
          </div>
        </div>

        {/* Airport Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAirports.map((airport) => (
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
                    {airport.city}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base group-hover:text-amber-600 transition-colors">
                  {airport.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {airport.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {airport.terminals.slice(0, 3).map((term, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {term}
                    </span>
                  ))}
                  {airport.terminals.length > 3 && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      +{airport.terminals.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Fares From</span>
                  <span className="text-base font-extrabold text-gray-900">£35.00</span>
                </div>
                <span className="text-xs font-bold text-gray-900 group-hover:text-ots-yellow flex items-center space-x-1">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredAirports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No airports found matching &ldquo;{searchTerm}&rdquo;</p>
          </div>
        )}

      </div>
    </div>
  );
}
