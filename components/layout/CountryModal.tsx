"use client";

import React, { useState } from "react";
import { useApp } from "@/components/context/AppContext";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";
import { X, Globe, Check } from "lucide-react";

export default function CountryModal() {
  const {
    isCountryModalOpen,
    setIsCountryModalOpen,
    currency,
    setCurrency,
    language,
    setLanguage,
  } = useApp();

  const [tempCurrency, setTempCurrency] = useState<CurrencyCode>(currency);
  const [tempLanguage, setTempLanguage] = useState<string>(language);

  if (!isCountryModalOpen) return null;

  const handleApply = () => {
    setCurrency(tempCurrency);
    setLanguage(tempLanguage);
    setIsCountryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setIsCountryModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white text-neutral-900 rounded-2xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-950">Change Currency & Language</h3>
          <button
            onClick={() => setIsCountryModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Select Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: "ENG", label: "English" },
                { code: "DEU", label: "Deutsch" },
                { code: "TUR", label: "Türkçe" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTempLanguage(lang.code)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-between transition ${
                    tempLanguage === lang.code
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  <span>{lang.label}</span>
                  {tempLanguage === lang.code && <Check className="w-3.5 h-3.5 text-ots-yellow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Select Currency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((curr) => {
                const conf = CURRENCIES[curr];
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setTempCurrency(curr)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-between transition ${
                      tempCurrency === curr
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    <span>{conf.symbol} {curr}</span>
                    {tempCurrency === curr && <Check className="w-3.5 h-3.5 text-ots-yellow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3.5 px-4 rounded-xl bg-ots-yellow hover:bg-ots-yellowHover text-black font-bold text-sm transition shadow-lg shadow-ots-yellow/20"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
