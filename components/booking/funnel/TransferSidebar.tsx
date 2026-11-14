'use client';

import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  ShieldCheck, 
  Headphones, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { StoredQuote } from '@/lib/quote-store';

interface TransferSidebarProps {
  quote: StoredQuote;
  selectedVehicleId?: string;
  selectedExtras?: string[];
}

export default function TransferSidebar({
  quote,
  selectedVehicleId,
  selectedExtras = [],
}: TransferSidebarProps) {
  const { formatPrice } = useApp();

  const vehicleId = selectedVehicleId || quote.selectedVehicleId || 'saloon';
  const vehicleTier = quote.pricing?.vehicles?.find(v => v.id === vehicleId) || quote.pricing?.vehicles?.[0];

  const vehiclePrice = vehicleTier?.finalPrice || 0;
  const isReturn = quote.bookReturn;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-[#141720] text-white p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-ots-yellow font-bold">
            Journey Summary
          </span>
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full font-mono text-gray-300">
            {quote.quoteRef}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-xs text-gray-400">Total Fixed Price</div>
            <div className="text-2xl font-extrabold text-ots-yellow">
              {formatPrice(vehiclePrice)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-green-400 font-semibold flex items-center justify-end space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>All Taxes &amp; Tolls Included</span>
            </span>
            {isReturn && (
              <span className="text-[11px] text-amber-300 font-medium block">
                5% Return Discount Applied
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Route Details */}
        <div className="space-y-3">
          {/* Pickup */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Pick-up
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {quote.fromLocation}
              </div>
            </div>
          </div>

          {/* Waypoints */}
          {quote.waypoints && quote.waypoints.length > 0 && (
            <div className="ml-3 pl-3 border-l-2 border-dashed border-gray-200 space-y-2 py-1">
              {quote.waypoints.map((wp, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-ots-yellow flex-shrink-0" />
                  <span className="truncate">Via: {wp}</span>
                </div>
              ))}
            </div>
          )}

          {/* Dropoff */}
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Drop-off
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {quote.toLocation}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Mileage */}
        <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs border border-gray-100">
          <div>
            <span className="text-gray-400 block">Outbound Date</span>
            <span className="font-semibold text-gray-900 flex items-center space-x-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{quote.pickUpDate}</span>
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Pick-up Time</span>
            <span className="font-semibold text-gray-900 flex items-center space-x-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>{quote.pickUpTime}</span>
            </span>
          </div>

          {isReturn && (
            <>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-400 block">Return Date</span>
                <span className="font-semibold text-gray-900 flex items-center space-x-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{quote.returnDate || quote.pickUpDate}</span>
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-400 block">Return Time</span>
                <span className="font-semibold text-gray-900 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>{quote.returnTime || '18:00'}</span>
                </span>
              </div>
            </>
          )}

          <div className="col-span-2 pt-2 border-t border-gray-200 flex items-center justify-between text-gray-500">
            <span>Est. Distance: <strong className="text-gray-900">{quote.distanceMiles || 15} miles</strong></span>
            <span>Est. Duration: <strong className="text-gray-900">{quote.estimatedTimeMins || 35} mins</strong></span>
          </div>
        </div>

        {/* Selected Vehicle Badge */}
        {vehicleTier && (
          <div className="flex items-center space-x-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="w-10 h-10 rounded-lg bg-ots-yellow text-black flex items-center justify-center font-bold flex-shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-900 truncate">
                {vehicleTier.name}
              </div>
              <div className="text-[11px] text-gray-600">
                Up to {vehicleTier.capacity.passengers} passengers &bull; {vehicleTier.capacity.suitcases} bags
              </div>
            </div>
          </div>
        )}

        {/* Reassurance Guarantees */}
        <div className="space-y-2 pt-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Free cancellation up to 12 hours prior</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>45 mins free airport waiting time</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Flight tracking included automatically</span>
          </div>
        </div>

        {/* Assistance hotline */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-500">
            <Headphones className="w-3.5 h-3.5 text-ots-yellow" />
            <span>Need booking help? Call 24/7:</span>
          </div>
          <a
            href="tel:+442080040000"
            className="text-sm font-bold text-gray-900 hover:text-amber-600 block mt-0.5"
          >
            +44 (0) 208 004 0000
          </a>
        </div>
      </div>
    </div>
  );
}
