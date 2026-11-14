'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Check, 
  Car, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { StoredQuote } from '@/lib/quote-store';

interface StepVehiclesProps {
  quote: StoredQuote;
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  selectedExtras: string[];
  onToggleExtra: (extraId: string) => void;
  onNext: () => void;
}

export default function StepVehicles({
  quote,
  selectedVehicleId,
  onSelectVehicle,
  selectedExtras,
  onToggleExtra,
  onNext,
}: StepVehiclesProps) {
  const { formatPrice } = useApp();

  const vehicles = quote.pricing?.vehicles || [];

  const extrasList = [
    {
      id: 'baby_seat',
      title: 'Baby / Infant Car Seat (0 - 12 Months)',
      desc: 'Rear-facing safety seat for babies up to 13kg',
      price: 'Free',
    },
    {
      id: 'child_seat',
      title: 'Toddler Car Seat (1 - 4 Years)',
      desc: 'Forward-facing seat with 5-point safety harness (9 - 18kg)',
      price: 'Free',
    },
  {
      id: 'booster_seat',
      title: 'Booster Cushion (4 - 11 Years)',
      desc: 'High-backed booster seat conforming to ECE R44/04 safety standards',
      price: 'Free',
    },
    {
      id: 'meet_and_greet',
      title: 'VIP Meet & Greet Inside Arrivals Hall',
      desc: 'Driver waits directly at the terminal exit barrier holding your name board',
      price: 'Free',
    },
    {
      id: 'extra_wait_30',
      title: 'Extra 30 Mins Airport Waiting Time',
      desc: 'Extended buffer time for long customs or baggage delays',
      price: '£15.00',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Step 1: Choose Your Vehicle
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Select the vehicle that best accommodates your passengers and luggage. All prices are fixed.
        </p>
      </div>

      {/* Vehicles list */}
      <div className="space-y-4">
        {vehicles.map((v) => {
          const isSelected = v.id === selectedVehicleId;

          return (
            <div
              key={v.id}
              onClick={() => onSelectVehicle(v.id)}
              className={`rounded-2xl p-5 sm:p-6 border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-ots-yellow bg-amber-50/20 shadow-md ring-1 ring-ots-yellow'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Vehicle details */}
                <div className="flex items-start sm:items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-ots-yellow text-black' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Car className="w-8 h-8" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        {v.name}
                      </h3>
                      {v.id.includes('exec') && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black text-ots-yellow uppercase">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Executive</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {v.description}
                    </p>

                    {/* Capacity indicators */}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1" title="Max Passengers">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>Max {v.capacity.passengers}</span>
                      </div>
                      <div className="flex items-center space-x-1" title="Large Suitcases">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span>{v.capacity.suitcases} Suitcases</span>
                      </div>
                      <div className="flex items-center space-x-1" title="Hand Luggage">
                        <ShoppingBag className="w-4 h-4 text-gray-500" />
                        <span>{v.capacity.handLuggage} Hand</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Selection */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] uppercase font-semibold text-gray-400 block">
                      Total Fare
                    </span>
                    <span className="text-2xl font-extrabold text-gray-900">
                      {formatPrice(v.finalPrice)}
                    </span>
                    {quote.bookReturn && (
                      <span className="text-[10px] text-green-700 font-bold block">
                        Includes Return (-5% OFF)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(v.id);
                    }}
                    className={`mt-2 px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-ots-yellow text-black shadow-sm ring-2 ring-black'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 text-black stroke-[3]" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select Vehicle</span>
                    )}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Extras and Add-ons */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Complimentary Extras &amp; Add-ons
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Select any complimentary child seats or extra services you require for your transfer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {extrasList.map((extra) => {
            const isChecked = selectedExtras.includes(extra.id);

            return (
              <label
                key={extra.id}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  isChecked
                    ? 'border-ots-yellow bg-amber-50/40 ring-1 ring-ots-yellow'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleExtra(extra.id)}
                  className="mt-0.5 w-4 h-4 rounded text-yellow-500 focus:ring-ots-yellow border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">
                      {extra.title}
                    </span>
                    <span className={`text-xs font-extrabold ml-2 ${
                      extra.price === 'Free' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {extra.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                    {extra.desc}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Continue CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-4 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <span>Continue to Passenger Details</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
