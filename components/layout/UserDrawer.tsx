"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/components/context/AppContext";
import { X, User, PlusCircle, LogOut, CalendarCheck } from "lucide-react";

export default function UserDrawer() {
  const { isUserDrawerOpen, setIsUserDrawerOpen, user, logout } = useApp();

  if (!isUserDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsUserDrawerOpen(false)}
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-sm bg-black text-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 border-l border-neutral-800">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
            <h3 className="text-base font-bold text-white">Account Management</h3>
            <button
              onClick={() => setIsUserDrawerOpen(false)}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User state */}
          {user ? (
            <div className="mt-8 space-y-6">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="w-12 h-12 rounded-full bg-ots-yellow text-black flex items-center justify-center font-bold text-lg mb-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h4 className="text-lg font-bold text-white">{user.name}</h4>
                <p className="text-xs text-ots-mutedText">{user.email}</p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/account/dashboard"
                  onClick={() => setIsUserDrawerOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-semibold transition"
                >
                  <CalendarCheck className="w-4 h-4 text-ots-yellow" />
                  <span>My Bookings & Trips</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsUserDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-900 hover:bg-red-950/40 text-red-400 rounded-lg text-sm font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-white">Hello!</h4>
                <p className="text-sm text-ots-mutedText mt-2">
                  Login into your account to manage your airport transfers, view invoices, and track drivers.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/account/login"
                  onClick={() => setIsUserDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm border border-neutral-700 transition"
                >
                  <User className="w-4 h-4 text-ots-yellow" />
                  <span>Login to your account</span>
                </Link>

                <Link
                  href="/account/register"
                  onClick={() => setIsUserDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-ots-yellow hover:bg-ots-yellowHover text-black font-bold text-sm transition shadow-lg shadow-ots-yellow/10"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register account</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Support Footer */}
        <div className="pt-6 border-t border-neutral-800 text-xs text-ots-mutedText">
          <p>Protected by 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
}
