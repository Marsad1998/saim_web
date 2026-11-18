"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/context/AppContext";
import { Home, Plane, Calendar, PhoneCall, Menu, Shield, Car, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, setIsMobileMenuOpen } = useApp();

  // Role-based target for the "Trips/Console" tab
  const getRoleDashboard = () => {
    if (user?.role === "admin") {
      return { href: "/admin", label: "Admin", icon: Shield };
    }
    if (user?.role === "driver") {
      return { href: "/driver/dashboard", label: "Jobs", icon: Car };
    }
    return { href: user ? "/account/dashboard" : "/account/login", label: "My Trips", icon: Calendar };
  };

  const tripsTab = getRoleDashboard();
  const TripsIcon = tripsTab.icon;

  const isHomeActive = pathname === "/";
  const isAirportsActive = pathname.startsWith("/airport");
  const isTripsActive = pathname.startsWith(tripsTab.href);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141720]/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.35)]"
    >
      <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Book / Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[44px] ${
            isHomeActive ? "text-ots-yellow" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Book</span>
        </Link>

        {/* Tab 2: Airports Directory */}
        <Link
          href="/airports"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[44px] ${
            isAirportsActive ? "text-ots-yellow" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Plane className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Airports</span>
        </Link>

        {/* Tab 3: My Trips / Driver Jobs / Admin */}
        <Link
          href={tripsTab.href}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-h-[44px] ${
            isTripsActive ? "text-ots-yellow" : "text-neutral-400 hover:text-white"
          }`}
        >
          <TripsIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">{tripsTab.label}</span>
        </Link>

        {/* Tab 4: App Menu Drawer */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-neutral-400 hover:text-ots-yellow transition min-h-[44px]"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
