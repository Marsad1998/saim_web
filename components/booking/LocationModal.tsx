"use client";

import React, { useState, useEffect } from "react";
import { SearchLocationItem, searchLocations } from "@/lib/locations-data";
import { X, Search, Plane, MapPin } from "lucide-react";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSelect: (item: SearchLocationItem) => void;
}

export default function LocationModal({
  isOpen,
  onClose,
  title,
  onSelect,
}: LocationModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchLocationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Quick suggestions when empty
  const quickAirports = searchLocations("Airport").slice(0, 6);

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
          setResults(Array.isArray(data) ? data : []);
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
      <div className="relative w-full max-w-xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-950">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 border-b border-neutral-100 bg-neutral-50/60">
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Airport, address, hotel or postcode..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 rounded-xl text-sm font-medium outline-none transition"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-4 divide-y divide-neutral-100">
          {loading && (
            <div className="py-6 text-center text-xs text-neutral-400">
              Searching locations...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-2">
                Matching Results
              </p>
              {results.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-neutral-50 rounded-xl flex items-center gap-3 transition group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.locationType === 1 ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-600"
                  }`}>
                    {item.locationType === 1 ? <Plane className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate group-hover:text-amber-600">
                      {item.location}
                    </p>
                    {item.code && (
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {item.code} {item.terminal ? `• ${item.terminal}` : ""}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && searchTerm.trim().length >= 2 && results.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-500">
              No exact matches found. You can still use &quot;{searchTerm}&quot; as a custom address.
              <button
                type="button"
                onClick={() => {
                  onSelect({
                    location: searchTerm,
                    code: "CUSTOM",
                    locationType: 2,
                    lat: 51.5074,
                    lng: -0.1278,
                  });
                  onClose();
                }}
                className="mt-3 block mx-auto py-2 px-4 bg-ots-yellow text-black font-bold rounded-lg text-xs hover:bg-ots-yellowHover"
              >
                Use &quot;{searchTerm}&quot;
              </button>
            </div>
          )}

          {/* Quick Popular Airports */}
          {!searchTerm && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-2">
                Popular UK Airports
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickAirports.map((airport, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelect(airport);
                      onClose();
                    }}
                    className="text-left p-2.5 hover:bg-neutral-50 rounded-xl flex items-center gap-2.5 transition border border-neutral-100 group"
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

      </div>
    </div>
  );
}
