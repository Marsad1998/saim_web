"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/context/AppContext";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";
import {
  User,
  Plus,
  Globe,
  Menu,
  ChevronDown,
  Check,
  Shield,
  Car,
  Calendar,
  LogOut,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const {
    currency,
    setCurrency,
    language,
    setLanguage,
    siteSettings,
    user,
    logout,
    setIsMobileMenuOpen,
    setIsUserDrawerOpen,
    setIsCountryModalOpen,
  } = useApp();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "RATE CARD", href: "/rates" },
    { label: "AIRPORTS", href: "/airports" },
    { label: "ABOUT US", href: "/about-us" },
    { label: "PARTNERS", href: "/partners" },
    { label: "CONTACT US", href: "/contact-us" },
  ];

  const brandName = siteSettings?.brand_name || "OTS Taxi";
  const brandWords = brandName.trim().split(/\s+/);
  const brandFirstWord = brandWords[0] || "OTS";
  const brandRestWords = brandWords.slice(1).join(" ");

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo & Brand Name (Protected against long names wrapping into lumpy layout) */}
          <div className="flex-shrink-0 flex items-center min-w-0 max-w-[200px] sm:max-w-[260px] md:max-w-[320px]">
            <Link href="/" className="flex items-center gap-2 group min-w-0">
              {siteSettings?.logo_dark ? (
                <img
                  src={siteSettings.logo_dark}
                  alt={siteSettings.brand_name || "OTS Taxi"}
                  className="h-10 md:h-12 w-auto max-w-[180px] sm:max-w-[220px] object-contain transition-transform group-hover:scale-105 flex-shrink-0"
                />
              ) : (
                <div className="flex items-center whitespace-nowrap overflow-hidden min-w-0">
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-ots-yellow flex-shrink-0">
                    {brandFirstWord}
                  </span>
                  {brandRestWords ? (
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white ml-1.5 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px]">
                      {brandRestWords}
                    </span>
                  ) : null}
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation (Protected against wrapping & shrinking) */}
          <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-item-link px-2.5 xl:px-3.5 py-2 text-xs xl:text-[13px] font-bold tracking-wide transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive ? "text-ots-yellow active" : "text-white hover:text-ots-yellow"
                  }`}
                >
                  <div className="nav-dots-container">
                    <span></span>
                    <span></span>
                  </div>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area (Protected against long user names distorting navbar) */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            {user ? (
              <div className="relative flex-shrink-0" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsCurrencyDropdownOpen(false);
                    setIsLangDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 hover:border-ots-yellow text-white text-xs font-semibold transition whitespace-nowrap group max-h-[38px] shadow-sm"
                  title={user.name}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-6 h-6 rounded-full bg-ots-yellow text-black flex items-center justify-center font-black text-[11px] flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="truncate max-w-[100px] sm:max-w-[120px] xl:max-w-[160px] text-xs font-bold text-neutral-200 group-hover:text-ots-yellow transition-colors">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-ots-yellow transition-transform duration-200 flex-shrink-0 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#141720] border border-neutral-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2.5 border-b border-neutral-800/80">
                      <p className="text-xs font-extrabold text-white truncate" title={user.name}>
                        {user.name}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate" title={user.email}>
                        {user.email}
                      </p>
                      <div className="mt-1.5">
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-ots-yellow/20 text-ots-yellow border border-ots-yellow/30">
                          {user.role === "admin"
                            ? "Administrator"
                            : user.role === "driver"
                            ? "Chauffeur"
                            : "Passenger"}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800/80 transition"
                        >
                          <Shield className="w-3.5 h-3.5 text-ots-yellow flex-shrink-0" />
                          <span>Admin OS Console</span>
                        </Link>
                      )}

                      {user.role === "driver" && (
                        <Link
                          href="/driver/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800/80 transition"
                        >
                          <Car className="w-3.5 h-3.5 text-ots-yellow flex-shrink-0" />
                          <span>Chauffeur Dashboard</span>
                        </Link>
                      )}

                      <Link
                        href="/account/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800/80 transition"
                      >
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>My Bookings & Trips</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                      >
                        <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center whitespace-nowrap flex-shrink-0">
                <Link href="/account/login" className="btn-login-skew whitespace-nowrap">
                  LOGIN
                  <User className="w-3.5 h-3.5 ml-1.5 inline" />
                </Link>
                <Link href="/account/register" className="btn-register-skew -ml-3 z-10 whitespace-nowrap">
                  REGISTER
                  <Plus className="w-3.5 h-3.5 ml-1.5 inline" />
                </Link>
              </div>
            )}

            {/* Currency Dropdown */}
            <div className="relative flex-shrink-0" ref={currencyMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                  setIsLangDropdownOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 border border-neutral-700 hover:border-ots-yellow rounded text-xs font-bold transition bg-neutral-900 whitespace-nowrap"
              >
                <span>{CURRENCIES[currency].symbol} {currency}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white text-neutral-900 rounded shadow-xl border border-neutral-200 py-1 z-50">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-neutral-100 whitespace-nowrap ${
                        currency === c ? "text-neutral-950 font-bold bg-neutral-50" : "text-neutral-700"
                      }`}
                    >
                      <span>{CURRENCIES[c].symbol} {c}</span>
                      {currency === c && <Check className="w-3.5 h-3.5 text-ots-green" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative flex-shrink-0" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsCurrencyDropdownOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 border border-neutral-700 hover:border-ots-yellow rounded text-xs font-bold transition bg-neutral-900 whitespace-nowrap"
              >
                <Globe className="w-3.5 h-3.5 text-ots-yellow" />
                <span>{language}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-white text-neutral-900 rounded shadow-xl border border-neutral-200 py-1 z-50">
                  {["ENG", "DEU", "TUR"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-neutral-100 whitespace-nowrap ${
                        language === lang ? "text-neutral-950 font-bold bg-neutral-50" : "text-neutral-700"
                      }`}
                    >
                      <span>{lang}</span>
                      {language === lang && <Check className="w-3.5 h-3.5 text-ots-green" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Icons (Protected against wrapping) */}
          <div className="flex lg:hidden items-center space-x-2 flex-shrink-0 whitespace-nowrap">
            <button
              onClick={() => setIsCountryModalOpen(true)}
              className="p-2 border border-neutral-800 rounded text-neutral-300 hover:text-white flex items-center gap-1 text-xs whitespace-nowrap"
              title="Currency & Language"
            >
              <span>{CURRENCIES[currency].symbol}</span>
              <span className="text-neutral-600">|</span>
              <span>{language}</span>
            </button>

            <button
              onClick={() => setIsUserDrawerOpen(true)}
              className="p-2 border border-neutral-800 rounded text-neutral-300 hover:text-ots-yellow relative"
              title="User Account"
            >
              {user ? (
                <div className="w-5 h-5 rounded-full bg-ots-yellow text-black flex items-center justify-center font-black text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded text-ots-yellow hover:text-white"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
