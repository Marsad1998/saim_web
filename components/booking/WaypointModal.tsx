"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, MapPin } from "lucide-react";
import { searchLocations } from "@/lib/locations-data";

interface WaypointModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypoints: string[];
  onAddWaypoint: (address: string) => void;
  onRemoveWaypoint: (index: number) => void;
}

export default function WaypointModal({
  isOpen,
  onClose,
  waypoints,
  onAddWaypoint,
  onRemoveWaypoint,
}: WaypointModalProps) {
  const [inputVal, setInputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!inputVal.trim()) return;
    if (waypoints.length >= 3) {
      setErrorMsg("You can add up to 3 waypoints.");
      return;
    }
    onAddWaypoint(inputVal.trim());
    setInputVal("");
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="text-base font-bold text-neutral-950">Waypoint Management</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Waypoints List */}
          {waypoints.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Added Stops ({waypoints.length}/3)
              </h4>
              <ul className="space-y-2">
                {waypoints.map((wp, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 h-5 rounded-full bg-ots-yellow text-black flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate text-neutral-800">{wp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveWaypoint(idx)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                      title="Remove stop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add Waypoint Form */}
          {waypoints.length < 3 ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-700">
                Add Intermediate Stop (Airport, address or postcode)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value);
                      setErrorMsg("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                    }}
                    placeholder="e.g. Oxford, Hotel or Heathrow Terminal 2"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-200 focus:border-ots-yellow focus:ring-2 focus:ring-ots-yellow/20 rounded-xl text-xs font-medium outline-none transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inputVal.trim()}
                  className="px-4 py-2.5 bg-ots-yellow hover:bg-ots-yellowHover disabled:opacity-50 text-black font-bold text-xs rounded-xl flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop</span>
                </button>
              </div>
              {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 bg-neutral-100 p-3 rounded-xl text-center">
              Maximum of 3 waypoints reached for this transfer.
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
