'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowUpDown, 
  Plus, 
  Check, 
  Loader2, 
  AlertCircle,
  Percent
} from 'lucide-react';
import LocationModal, { SelectedLocationItem } from './LocationModal';
import WaypointModal from './WaypointModal';
import TimePickerModal from './TimePickerModal';

interface LocationItem {
  id?: string;
  name: string;
  address?: string;
  location?: string;
  type?: string;
  postcode?: string;
  lat?: number;
  lng?: number;
  locationType?: number;
  code?: string;
}

export default function BookingForm({ initialValues }: { initialValues?: any }) {
  const router = useRouter();

  // State
  const [pickup, setPickup] = useState<LocationItem | null>(() => {
    if (!initialValues?.pickup) return null;
    const name = typeof initialValues.pickup === 'string' ? initialValues.pickup : initialValues.pickup.name;
    return { name, location: name };
  });
  
  const [dropoff, setDropoff] = useState<LocationItem | null>(() => {
    if (!initialValues?.dropoff) return null;
    const name = typeof initialValues.dropoff === 'string' ? initialValues.dropoff : initialValues.dropoff.name;
    return { name, location: name };
  });

  const [waypoints, setWaypoints] = useState<string[]>([]);
  
  // Date & Time
  const today = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState<string>(today);
  const [pickupTime, setPickupTime] = useState<string>('12:00');

  // Passengers
  const [passengers, setPassengers] = useState<number>(1);

  // Return trip
  const [isReturn, setIsReturn] = useState<boolean>(false);
  const [returnDate, setReturnDate] = useState<string>(today);
  const [returnTime, setReturnTime] = useState<string>('18:00');

  // Modals
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalTarget, setLocationModalTarget] = useState<'pickup' | 'dropoff'>('pickup');
  const [waypointModalOpen, setWaypointModalOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'pickup' | 'return' | null>(null);

  // Error & loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleOpenLocation = (target: 'pickup' | 'dropoff') => {
    setLocationModalTarget(target);
    setLocationModalOpen(true);
  };

  const handleSelectLocation = (loc: SelectedLocationItem) => {
    const locName = loc.name || loc.location || '';
    const normalized: LocationItem = {
      name: locName,
      location: locName,
      address: locName,
      code: loc.code,
      locationType: loc.locationType || (locName.toLowerCase().includes('airport') ? 1 : 2),
      lat: loc.lat,
      lng: loc.lng,
      postcode: loc.postcode,
    };

    if (locationModalTarget === 'pickup') {
      setPickup(normalized);
    } else {
      setDropoff(normalized);
    }
    setErrorMessage(null);
  };

  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const pickupName = pickup?.name || pickup?.location || '';
    const dropoffName = dropoff?.name || dropoff?.location || '';

    if (!pickupName) {
      setErrorMessage('Please select a Pick-up location or airport');
      return;
    }
    if (!dropoffName) {
      setErrorMessage('Please select a Drop-off destination or airport');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        pickup: pickupName,
        dropoff: dropoffName,
        fromDestination: pickupName,
        toDestination: dropoffName,
        fromCoords: pickup?.lat && pickup?.lng ? { lat: pickup.lat, lng: pickup.lng } : undefined,
        toCoords: dropoff?.lat && dropoff?.lng ? { lat: dropoff.lat, lng: dropoff.lng } : undefined,
        fromLocationType: pickup?.locationType || (pickupName.toLowerCase().includes('airport') ? 1 : 2),
        toLocationType: dropoff?.locationType || (dropoffName.toLowerCase().includes('airport') ? 1 : 2),
        pickupDate,
        pickupTime,
        waypoints,
        isReturn,
        bookReturn: isReturn,
        returnDate: isReturn ? returnDate : undefined,
        returnTime: isReturn ? returnTime : undefined,
        passengers,
      };

      const res = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status && data.quoteRef) {
        router.push(`/quote/${data.quoteRef}`);
      } else {
        setErrorMessage(data.message || 'Unable to calculate quote. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Quote submission error:', err);
      setErrorMessage('Network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const currentPickupName = pickup?.name || pickup?.location;
  const currentDropoffName = dropoff?.name || dropoff?.location;

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl p-5 md:p-8 border border-gray-100 relative">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center space-x-2 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Pick-up & Drop-off with Swap button */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Pick-up */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Pick-up Location
            </label>
            <button
              type="button"
              onClick={() => handleOpenLocation('pickup')}
              className="w-full h-13 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left flex items-center space-x-3 transition-colors focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            >
              <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 truncate">
                {currentPickupName ? (
                  <span className="font-semibold text-gray-900 text-sm md:text-base">
                    {currentPickupName}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">
                    Pick-up address, airport or postcode...
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Swap Button (desktop center, mobile row) */}
          <div className="hidden md:flex absolute left-1/2 top-7 -translate-x-1/2 z-10">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Locations"
              className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:text-black hover:bg-ots-yellow flex items-center justify-center transition-transform hover:rotate-180"
            >
              <ArrowUpDown className="w-4 h-4 rotate-90" />
            </button>
          </div>

          <div className="flex md:hidden justify-end -my-1 z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="px-3 py-1.5 bg-gray-100 hover:bg-ots-yellow text-gray-700 hover:text-black rounded-xl text-xs font-bold flex items-center space-x-1.5 transition min-h-[36px]"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Swap Locations</span>
            </button>
          </div>

          {/* Drop-off */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Drop-off Destination
            </label>
            <button
              type="button"
              onClick={() => handleOpenLocation('dropoff')}
              className="w-full h-13 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left flex items-center space-x-3 transition-colors focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            >
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 truncate">
                {currentDropoffName ? (
                  <span className="font-semibold text-gray-900 text-sm md:text-base">
                    {currentDropoffName}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">
                    Drop-off address, airport or postcode...
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Via Stops Indicator / Add button */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setWaypointModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-ots-yellow" />
            <span>
              {waypoints.length > 0 
                ? `Via Stops (${waypoints.length} added)` 
                : '+ Add Via Stop'}
            </span>
          </button>

          {/* Mobile Swap trigger */}
          <button
            type="button"
            onClick={handleSwap}
            className="md:hidden text-xs text-gray-500 hover:text-black flex items-center space-x-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
        </div>

        {/* Row 2: Date, Time, Passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-1">
          {/* Pickup Date */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Pick-up Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={today}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Pick-up Time
            </label>
            <button
              type="button"
              onClick={() => setTimePickerTarget('pickup')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left flex items-center justify-between text-gray-900 font-medium text-sm transition-colors focus:ring-2 focus:ring-ots-yellow focus:outline-none"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{pickupTime}</span>
              </div>
              <span className="text-xs text-gray-400">24-hr</span>
            </button>
          </div>

          {/* Passengers */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
              Passengers
            </label>
            <div className="relative">
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm appearance-none focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Return Trip Checkbox / Discount Banner */}
        <div className="pt-2">
          <label className="flex items-center space-x-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
            <input
              type="checkbox"
              checked={isReturn}
              onChange={(e) => setIsReturn(e.target.checked)}
              className="w-5 h-5 rounded text-yellow-500 focus:ring-ots-yellow border-gray-300"
            />
            <div className="flex-1">
              <span className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                <span>Add return journey</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold bg-ots-yellow text-black uppercase tracking-wide">
                  <Percent className="w-3 h-3 mr-0.5" /> 5% OFF
                </span>
              </span>
              <p className="text-xs text-gray-500">
                Save 5% discount automatically applied to your return transfer
              </p>
            </div>
          </label>
        </div>

        {/* Return Date & Time (Conditional) */}
        {isReturn && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Return Date
              </label>
              <input
                type="date"
                min={pickupDate || today}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 font-medium text-sm focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Return Time
              </label>
              <button
                type="button"
                onClick={() => setTimePickerTarget('return')}
                className="w-full px-4 py-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-left flex items-center justify-between text-gray-900 font-medium text-sm transition-colors focus:ring-2 focus:ring-ots-yellow focus:outline-none"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{returnTime}</span>
                </div>
                <span className="text-xs text-gray-400">24-hr</span>
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Calculating Best Fares...</span>
              </>
            ) : (
              <span>Get Instant Quote & Book</span>
            )}
          </button>
        </div>

        {/* Trust Guarantees under form */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-gray-500">
          <div className="flex items-center justify-center space-x-1">
            <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>Fixed Low Prices</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>Free Flight Tracking</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>Meet & Greet Included</span>
          </div>
        </div>
      </form>

      {/* Modals */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={handleSelectLocation}
        title={locationModalTarget === 'pickup' ? 'Select Pick-up Location' : 'Select Drop-off Destination'}
      />

      <WaypointModal
        isOpen={waypointModalOpen}
        onClose={() => setWaypointModalOpen(false)}
        waypoints={waypoints}
        onAddWaypoint={(w) => setWaypoints((prev) => [...prev, w])}
        onRemoveWaypoint={(idx) => setWaypoints((prev) => prev.filter((_, i) => i !== idx))}
      />

      <TimePickerModal
        isOpen={timePickerTarget !== null}
        onClose={() => setTimePickerTarget(null)}
        value={timePickerTarget === 'pickup' ? pickupTime : returnTime}
        onChange={(time) => {
          if (timePickerTarget === 'pickup') {
            setPickupTime(time);
          } else {
            setReturnTime(time);
          }
        }}
        title={timePickerTarget === 'pickup' ? 'Select Pick-up Time' : 'Select Return Pick-up Time'}
      />
    </div>
  );
}
