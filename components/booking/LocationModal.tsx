"use client";

import React, { useState, useEffect } from "react";
import { SearchLocationItem, searchLocations } from "@/lib/locations-data";
import { X, Search, Plane, MapPin, Check, Sparkles } from "lucide-react";

export interface SelectedLocationItem {
  name: string;
  location: string;
  code?: string;
  locationType?: number;
  terminal?: string;
  lat?: number;
  lng?: number;
  postcode?: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSelect: (item: SelectedLocationItem) => void;
}

export default function LocationModal({
  isOpen,
  onClose,
  title,
  onSelect,
}: LocationModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Quick suggestions when empty
  const quickAirports = searchLocations("Airport").slice(0, 8);

  const handleSelectItem = (item: any) => {
    const locName = item.location || item.name || item.description || "";
    onSelect({
      name: locName,
      location: locName,
      code: item.code || "",
      locationType: item.locationType || (locName.toLowerCase().includes("airport") ? 1 : 2),
      terminal: item.terminal,
      lat: item.lat,
      lng: item.lng,
      postcode: item.postcode,
    });
    onClose();
  };

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch("/api/search-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: searchTerm }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setResults(data);
          } else {
            // Local fallback
            const local = searchLocations(searchTerm);
            setResults(
              local.length > 0
                ? local
                : [
                    {
                      location: searchTerm.trim(),
                      name: searchTerm.trim(),
                      code: "UK",
                      locationType: 2,
                      lat: 51.5074,
                      lng: -0.1278,
                    },
                  ]
            );
          }
        })
        .catch(() => {
          setResults(searchLocations(searchTerm));
        })
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-900 text-white">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-ots-yellow" />
            <h3 className="text-base font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim()) {
                  if (results.length > 0) {
                    handleSelectItem(results[0]);
                  } else {
                    handleSelectItem({ location: searchTerm.trim() });
                  }
                }
              }}
              placeholder="Airport, UK postcode, hotel or street address..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 rounded-xl text-sm font-medium outline-none transition"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-4 divide-y divide-neutral-100">
          {loading && (
            <div className="py-6 text-center text-xs text-neutral-400 flex items-center justify-center space-x-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-ots-yellow"></span>
              <span>Searching Google Places &amp; UK locations...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Matching Locations
                </p>
                <span className="text-[10px] text-neutral-400">
                  {results.length} found
                </span>
              </div>
              <div className="space-y-1">
                {results.map((item, idx) => {
                  const locText = item.location || item.name || "";
                  const isAirport = item.locationType === 1 || locText.toLowerCase().includes("airport");

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="w-full text-left p-3 hover:bg-neutral-50 rounded-xl flex items-center gap-3 transition group border border-transparent hover:border-neutral-200"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isAirport ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {isAirport ? <Plane className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate group-hover:text-amber-600">
                          {locText}
                        </p>
                        {item.code && (
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {item.code} {item.terminal ? `• ${item.terminal}` : ""}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback option when user types custom text */}
          {!loading && searchTerm.trim().length >= 2 && (
            <div className="pt-3 pb-2 px-2">
              <button
                type="button"
                onClick={() => handleSelectItem({ location: searchTerm.trim() })}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-between"
              >
                <span>Use custom address: &ldquo;{searchTerm}&rdquo;</span>
                <Check className="w-4 h-4 text-amber-700" />
              </button>
            </div>
          )}

          {/* Quick Popular Airports */}
          {!searchTerm && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-2">
                Quick Select UK Airports
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickAirports.map((airport, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectItem(airport)}
                    className="text-left p-3 hover:bg-neutral-50 rounded-xl flex items-center gap-2.5 transition border border-neutral-100 group"
                  >
                    <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-900 truncate group-hover:text-amber-600">
                        {airport.location}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono font-bold">
                        {airport.code}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Search any UK airport, train station, address or postcode</span>
          <span className="font-semibold text-neutral-700">OTS Taxi System</span>
        </div>

      </div>
    </div>
  );
}
