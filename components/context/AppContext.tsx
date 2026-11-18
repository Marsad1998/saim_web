"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrencyCode, CURRENCIES, formatPrice } from "@/lib/currency";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "customer" | "admin" | "driver" | string;
}

interface AppContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  language: string;
  setLanguage: (lang: string) => void;
  formatPrice: (amountGbp: number) => string;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isUserDrawerOpen: boolean;
  setIsUserDrawerOpen: (open: boolean) => void;
  isCountryModalOpen: boolean;
  setIsCountryModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("GBP");
  const [language, setLanguage] = useState<string>("ENG");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  // Initialize currency & verify live session with server
  useEffect(() => {
    try {
      const savedCurr = localStorage.getItem("ots_currency") as CurrencyCode;
      if (savedCurr && CURRENCIES[savedCurr]) {
        setCurrencyState(savedCurr);
      }
      const savedUser = localStorage.getItem("ots_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {}

    // Verify session with server HTTP-Only cookie
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
          localStorage.setItem("ots_user", JSON.stringify(data.user));
        } else if (data && !data.authenticated) {
          setUser(null);
          localStorage.removeItem("ots_user");
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem("ots_currency", code);
      document.cookie = `selectedcurrency=${code}; path=/; max-age=31536000`;
    } catch (e) {}
  };

  const logout = (redirectUrl: string = "/account/login") => {
    setUser(null);
    try {
      localStorage.removeItem("ots_user");
    } catch (e) {}
    fetch("/api/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        window.location.href = redirectUrl;
      });
  };

  const customFormatPrice = (amountGbp: number) => {
    return formatPrice(amountGbp, currency);
  };

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        formatPrice: customFormatPrice,
        user,
        setUser: (u) => {
          setUser(u);
          if (u) {
            localStorage.setItem("ots_user", JSON.stringify(u));
          } else {
            localStorage.removeItem("ots_user");
          }
        },
        logout,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isUserDrawerOpen,
        setIsUserDrawerOpen,
        isCountryModalOpen,
        setIsCountryModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
