"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/context/AppContext";
import { X, Home, Plane, CheckCircle2, User, Mail } from "lucide-react";

export default function MobileDrawer() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useApp();
  const pathname = usePathname();

  if (!isMobileMenuOpen) return null;

  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Airports", href: "/airports", icon: Plane },
    { label: "Partners", href: "/partners", icon: CheckCircle2 },
    { label: "About Us", href: "/about-us", icon: User },
    { label: "Contact Us", href: "/contact-us", icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-black text-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 border-r border-neutral-800">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
              <span className="text-xl font-black text-ots-yellow tracking-wider">OTS</span>
              <span className="text-xl font-bold text-white tracking-tight ml-1">TAXI</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav List */}
          <ul className="mt-6 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? "text-ots-yellow bg-neutral-900"
                        : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-ots-yellow" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer info in drawer */}
        <div className="pt-6 border-t border-neutral-800 text-xs text-ots-mutedText space-y-2">
          <p>24/7 Support Hotline:</p>
          <a href="tel:+443330047131" className="text-ots-yellow font-bold block">
            +443330047131
          </a>
        </div>
      </div>
    </div>
  );
}
