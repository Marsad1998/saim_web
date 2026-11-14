'use client';

import React, { useState } from 'react';
import { X, Clock, Check } from 'lucide-react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string; // e.g. "14:30"
  onChange: (time: string) => void;
  title?: string;
}

export default function TimePickerModal({
  isOpen,
  onClose,
  value,
  onChange,
  title = 'Select Pick-up Time',
}: TimePickerModalProps) {
  const [initialHour, initialMinute] = value ? value.split(':') : ['12', '00'];
  const [selectedHour, setSelectedHour] = useState(initialHour || '12');
  const [selectedMinute, setSelectedMinute] = useState(initialMinute || '00');

  if (!isOpen) return null;

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const handleConfirm = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#141720] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-ots-yellow" />
            <h3 className="font-semibold text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Display */}
        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6 text-center">
          <div className="inline-flex items-center text-3xl font-bold text-gray-900 tracking-wider bg-white px-5 py-2 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-black font-extrabold">{selectedHour}</span>
            <span className="mx-1 text-ots-yellow font-extrabold animate-pulse">:</span>
            <span className="text-black font-extrabold">{selectedMinute}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">24-Hour UK Standard Time</p>
        </div>

        {/* Pickers Body */}
        <div className="p-5 grid grid-cols-2 gap-4">
          {/* Hours column */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 text-center pb-1 border-b">
              Hour
            </div>
            <div className="h-56 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
              {hours.map((h) => {
                const isSelected = h === selectedHour;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHour(h)}
                    className={`w-full py-1.5 px-3 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-ots-yellow text-black font-bold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{h}:00</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minutes column */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 text-center pb-1 border-b">
              Minute
            </div>
            <div className="h-56 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
              {minutes.map((m) => {
                const isSelected = m === selectedMinute;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMinute(m)}
                    className={`w-full py-1.5 px-3 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-ots-yellow text-black font-bold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>:{m}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2 bg-ots-yellow hover:bg-yellow-400 text-black text-sm font-bold rounded-lg shadow transition-colors flex items-center space-x-1"
          >
            <span>Confirm Time</span>
          </button>
        </div>
      </div>
    </div>
  );
}
