"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/context/AppContext";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";
import { 
  X, 
  Home, 
  Plane, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Car, 
  CalendarCheck, 
  LogOut, 
  Globe, 
  Coins,
  ChevronRight,
  ExternalLink,
  FileText
} from "lucide-react";

export default function MobileDrawer() {
  const { 
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    siteSettings,
    user, 
    logout, 
    currency, 
    setCurrency, 
    language, 
    setLanguage 
  } = useApp();
  const pathname = usePathname();

  const brandName = siteSettings?.brand_name || "OTS Taxi";
  const brandWords = brandName.trim().split(/\s+/);
  const brandFirstWord = brandWords[0] || "OTS";
  const brandRestWords = brandWords.slice(1).join(" ");

  if (!isMobileMenuOpen) return null;

  const mainLinks = [
    { label: "Book a Transfer", href: "/", icon: Home },
    { label: "Official Rate Card", href: "/rates", icon: FileText },
    { label: "UK Airports Guide", href: "/airports", icon: Plane },
    { label: "Corporate Partners", href: "/partners", icon: CheckCircle2 },
    { label: `About ${brandName}`, href: "/about-us", icon: User },
    { label: "Help & Support", href: "/contact-us", icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation Sidebar">
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside
        className="relative w-4/5 max-w-xs bg-[#141720] text-white h-full shadow-2xl flex flex-col justify-between z-10 border-r border-neutral-800 overflow-y-auto"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-800 sticky top-0 bg-[#141720]/95 backdrop-blur z-10">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-1.5"
            >
              {siteSettings?.logo_dark ? (
                <img
                  src={siteSettings.logo_dark}
                  alt={brandName}
                  className="h-9 w-auto max-w-[170px] object-contain flex-shrink-0"
                />
              ) : (
                <div className="flex items-center whitespace-nowrap overflow-hidden min-w-0">
                  <span className="text-2xl font-black text-ots-yellow tracking-wider flex-shrink-0">
                    {brandFirstWord}
                  </span>
                  {brandRestWords ? (
                    <span className="text-2xl font-bold text-white tracking-tight ml-1.5 truncate max-w-[160px]">
                      {brandRestWords}
                    </span>
                  ) : null}
                </div>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
              aria-label="Close Navigation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Account Quick Card */}
          <div className="p-4 bg-neutral-900/80 border-b border-neutral-800">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-ots-yellow text-black flex items-center justify-center font-extrabold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-neutral-400 truncate">{user.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ots-yellow/20 text-ots-yellow border border-ots-yellow/30">
                    {user.role === "admin" ? "Admin" : user.role === "driver" ? "Driver" : "Passenger"}
                  </span>
                </div>

                {/* Direct Dashboard Link */}
                <Link
                  href={user.role === "admin" ? "/admin" : user.role === "driver" ? "/driver/dashboard" : "/account/dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 bg-ots-yellow hover:bg-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-between transition shadow-sm min-h-[44px]"
                >
                  <span className="flex items-center space-x-2">
                    {user.role === "admin" ? (
                      <Shield className="w-4 h-4" />
                    ) : user.role === "driver" ? (
                      <Car className="w-4 h-4" />
                    ) : (
                      <CalendarCheck className="w-4 h-4" />
                    )}
                    <span>
                      {user.role === "admin"
                        ? "Admin Dispatch Console"
                        : user.role === "driver"
                        ? "Chauffeur Portal & Jobs"
                        : "My Bookings & Transfers"}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-neutral-400">Welcome to {brandName}</div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/account/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition min-h-[44px] flex items-center justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/account/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center bg-ots-yellow hover:bg-yellow-400 text-black rounded-xl text-xs font-bold transition min-h-[44px] flex items-center justify-center shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1">
              Explore &amp; Book
            </div>
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-semibold transition min-h-[44px] ${
                    isActive
                      ? "text-ots-yellow bg-neutral-900 border border-ots-yellow/30 font-bold"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-ots-yellow" />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </Link>
              );
            })}
          </nav>

          {/* Currency & Language Selectors */}
          <div className="p-4 border-t border-neutral-800 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-1">
              Preferences
            </div>

            {/* Currency Pills */}
            <div className="flex items-center space-x-1.5 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
              <Coins className="w-4 h-4 text-neutral-400 ml-1.5 mr-1" />
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] ${
                    currency === c
                      ? "bg-ots-yellow text-black shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {CURRENCIES[c].symbol} {c}
                </button>
              ))}
            </div>

            {/* Language Pills */}
            <div className="flex items-center space-x-1.5 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
              <Globe className="w-4 h-4 text-neutral-400 ml-1.5 mr-1" />
              {["ENG", "DEU", "TUR"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition min-h-[36px] ${
                    language === l
                      ? "bg-ots-yellow text-black shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Area with 24/7 Dispatch Hotline */}
        <div className="p-4 border-t border-neutral-800 bg-[#0d0f15] space-y-3">
          <a
            href={`tel:${siteSettings?.support_phone || "+443330047131"}`}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md min-h-[44px]"
          >
            <Phone className="w-4 h-4" />
            <span>Call 24/7 Dispatch ({siteSettings?.support_phone || "+44 333 004 7131"})</span>
          </a>

          {user && (
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 text-red-400 hover:bg-red-950/30 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>
          )}

          <div className="text-[10px] text-neutral-500 text-center">
            {brandName} Limited • Lic. No. {siteSettings?.company_number || "06783060"}
          </div>
        </div>
      </aside>
    </div>
  );
}
