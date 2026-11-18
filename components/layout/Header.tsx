"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/context/AppContext";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";
import { User, Plus, Globe, Menu, ChevronDown, Check } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const {
    currency,
    setCurrency,
    language,
    setLanguage,
    user,
    logout,
    setIsMobileMenuOpen,
    setIsUserDrawerOpen,
    setIsCountryModalOpen,
  } = useApp();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "CONTACT US", href: "/contact-us" },
    { label: "ABOUT US", href: "/about-us" },
    { label: "AIRPORTS", href: "/airports" },
    { label: "PARTNERS", href: "/partners" },
  ];

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-wider text-ots-yellow">OTS</span>
                <span className="text-2xl font-bold tracking-tight text-white ml-1">TAXI</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-item-link px-3 py-2 text-[13px] font-bold tracking-wide transition-colors ${
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

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/account/dashboard"
                  className="px-3 py-2 rounded bg-ots-cardDark text-white text-xs font-semibold hover:text-ots-yellow transition"
                >
                  My Account ({user.name})
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-ots-mutedText hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link href="/account/login" className="btn-login-skew">
                  LOGIN
                  <User className="w-3.5 h-3.5 ml-1.5 inline" />
                </Link>
                <Link href="/account/register" className="btn-register-skew -ml-3 z-10">
                  REGISTER
                  <Plus className="w-3.5 h-3.5 ml-1.5 inline" />
                </Link>
              </div>
            )}

            {/* Currency Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                  setIsLangDropdownOpen(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 border border-neutral-700 hover:border-ots-yellow rounded text-xs font-bold transition bg-neutral-900"
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
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-neutral-100 ${
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
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsCurrencyDropdownOpen(false);
                }}
                className="flex items-center space-x-1 px-3 py-2 border border-neutral-700 hover:border-ots-yellow rounded text-xs font-bold transition bg-neutral-900"
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
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-neutral-100 ${
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

          {/* Mobile Right Icons */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setIsCountryModalOpen(true)}
              className="p-2 border border-neutral-800 rounded text-neutral-300 hover:text-white flex items-center gap-1 text-xs"
              title="Currency & Language"
            >
              <span>{CURRENCIES[currency].symbol}</span>
              <span className="text-neutral-600">|</span>
              <span>{language}</span>
            </button>

            <button
              onClick={() => setIsUserDrawerOpen(true)}
              className="p-2 border border-neutral-800 rounded text-neutral-300 hover:text-ots-yellow"
              title="User Account"
            >
              <User className="w-5 h-5" />
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
