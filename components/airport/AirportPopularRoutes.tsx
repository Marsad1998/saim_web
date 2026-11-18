'use client';

import React from 'react';
import { useApp } from '@/components/context/AppContext';

export interface RouteItem {
  destination: string;
  distance: string;
  priceGbp: number;
}

interface AirportPopularRoutesProps {
  routes: RouteItem[];
  airportName: string;
}

export default function AirportPopularRoutes({ routes, airportName }: AirportPopularRoutesProps) {
  const { formatPrice } = useApp();

  return (
    <div className="pt-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Popular Fixed-Price Routes from {airportName}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Estimated fixed fares for Standard Saloon vehicles. All airport car park exit barriers are included.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900">{route.destination}</h4>
              <span className="text-[11px] text-gray-500">{route.distance}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-gray-900 block">{formatPrice(route.priceGbp)}</span>
              <span className="text-[10px] text-green-600 font-semibold">Fixed Fare</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
