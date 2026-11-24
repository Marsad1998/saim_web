"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CurrencyCode, CURRENCIES, formatPrice, convertFromGbp } from "@/lib/currency";

export interface SiteSettings {
  primary_color: string;
  primary_hover_color: string;
  secondary_color: string;
  brand_name: string;
  brand_tagline: string;
  logo_dark: string;
  logo_light: string;
  logo_icon: string;
  support_phone: string;
  support_email: string;
  emergency_whatsapp: string;
  office_address: string;
  company_number: string;
  vat_number: string;
  copyright_text: string;
  google_maps_api_key?: string;
  bank_name?: string;
  account_name?: string;
  account_type?: string;
  account_number?: string;
  sort_code?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  primary_color: "#FFCC00",
  primary_hover_color: "#E6B800",
  secondary_color: "#141720",
  brand_name: "QUICK CAR MIDLANDS LTD",
  brand_tagline: "Airport Transfers & Private Hire | Based in Birmingham",
  logo_dark: "",
  logo_light: "",
  logo_icon: "",
  support_phone: "01212433112",
  support_email: "qcm023@gmail.com",
  emergency_whatsapp: "00447892609314",
  office_address: "Birmingham, West Midlands, United Kingdom",
  company_number: "12345678",
  vat_number: "GB 123 4567 89",
  copyright_text: "© 2026 QUICK CAR MIDLANDS LTD. All Rights Reserved.",
  google_maps_api_key: "",
  bank_name: "QUICK CAR MIDLANDS LTD",
  account_name: "QUICK CAR MIDLANDS LTD",
  account_type: "Business",
  account_number: "50470328",
  sort_code: "82-19-74",
};

export function getContrastColor(hexColor: string): string {
  try {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 135 ? "#000000" : "#ffffff";
  } catch {
    return "#000000";
  }
}

export function adjustBrightness(hexColor: string, percent: number): string {
  try {
    const hex = hexColor.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16) || 0;
    let g = parseInt(hex.substring(2, 4), 16) || 0;
    let b = parseInt(hex.substring(4, 6), 16) || 0;
    r = Math.max(0, Math.min(255, Math.floor(r * (1 + percent / 100))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 + percent / 100))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 + percent / 100))));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return hexColor;
  }
}

export function applyThemeColors(primary: string, hover?: string, secondary?: string) {
  if (typeof document === "undefined") return;
  const prim = primary || "#FFCC00";
  const hov = hover || adjustBrightness(prim, -10);
  const dark = adjustBrightness(prim, -18);
  const contrast = getContrastColor(prim);
  const sec = secondary || "#141720";

  document.documentElement.style.setProperty("--ots-primary", prim);
  document.documentElement.style.setProperty("--ots-primary-hover", hov);
  document.documentElement.style.setProperty("--ots-primary-dark", dark);
  document.documentElement.style.setProperty("--ots-primary-contrast", contrast);
  document.documentElement.style.setProperty("--ots-secondary", sec);
}

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
  convertPrice: (amountGbp: number) => number;
  siteSettings: SiteSettings;
  updateSiteSettingsState: (settings: Partial<SiteSettings>) => void;
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  // Synchronize document title and favicon with current brand settings on client
  useEffect(() => {
    if (typeof document !== "undefined" && siteSettings?.brand_name) {
      const brand = siteSettings.brand_name.trim();
      const tagline = siteSettings.brand_tagline ? siteSettings.brand_tagline.trim() : "";
      
      // Update document title to reflect dynamic brand name and tagline
      if (!document.title || !document.title.includes(brand)) {
        document.title = tagline ? `${brand} - ${tagline}` : brand;
      }

      // Update favicon if custom icon is uploaded
      if (siteSettings.logo_icon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement("link");
          link.type = "image/x-icon";
          link.rel = "shortcut icon";
          document.getElementsByTagName("head")[0].appendChild(link);
        }
        link.href = siteSettings.logo_icon;
      }
    }
  }, [siteSettings?.brand_name, siteSettings?.brand_tagline, siteSettings?.logo_icon]);

  const updateSiteSettingsState = useCallback((newSettings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      applyThemeColors(merged.primary_color, merged.primary_hover_color, merged.secondary_color);
      try {
        localStorage.setItem("ots_site_settings", JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("ots_settings_change", { detail: merged }));
      } catch (e) {}
      return merged;
    });
  }, []);

  // Initialize currency, live session & site settings with server
  useEffect(() => {
    try {
      const savedCurr = localStorage.getItem("ots_currency") as CurrencyCode;
      if (savedCurr && CURRENCIES[savedCurr]) {
        setCurrencyState(savedCurr);
      } else {
        const match = document.cookie.match(/(?:^|;\s*)selectedcurrency=([^;]+)/);
        if (match && match[1] && CURRENCIES[match[1] as CurrencyCode]) {
          setCurrencyState(match[1] as CurrencyCode);
        }
      }

      const cachedSettings = localStorage.getItem("ots_site_settings");
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        setSiteSettings(parsed);
        applyThemeColors(parsed.primary_color, parsed.primary_hover_color, parsed.secondary_color);
      }

      const savedUser = localStorage.getItem("ots_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {}

    // Fetch live website settings from API
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.status && data.settings) {
          setSiteSettings(data.settings);
          applyThemeColors(data.settings.primary_color, data.settings.primary_hover_color, data.settings.secondary_color);
          try {
            localStorage.setItem("ots_site_settings", JSON.stringify(data.settings));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // Listen to storage or cross-component currency and settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ots_currency" && e.newValue && CURRENCIES[e.newValue as CurrencyCode]) {
        setCurrencyState(e.newValue as CurrencyCode);
      }
      if (e.key === "ots_site_settings" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSiteSettings(parsed);
          applyThemeColors(parsed.primary_color, parsed.primary_hover_color, parsed.secondary_color);
        } catch {}
      }
    };
    const handleCustomChange = (e: any) => {
      if (e.detail && CURRENCIES[e.detail as CurrencyCode]) {
        setCurrencyState(e.detail as CurrencyCode);
      }
    };
    const handleSettingsCustomChange = (e: any) => {
      if (e.detail) {
        setSiteSettings(e.detail);
        applyThemeColors(e.detail.primary_color, e.detail.primary_hover_color, e.detail.secondary_color);
      }
    };

    // Automatic recovery from ChunkLoadError when dev server recompiles or new bundle is deployed
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg = 'message' in event ? event.message : (event.reason?.message || String(event.reason || ''));
      if (errorMsg && (/Loading chunk .* failed/i.test(errorMsg) || /ChunkLoadError/i.test(errorMsg))) {
        const retryKey = 'ots_chunk_reload';
        const lastRetry = sessionStorage.getItem(retryKey);
        const now = Date.now();
        if (!lastRetry || now - parseInt(lastRetry, 10) > 10000) {
          sessionStorage.setItem(retryKey, now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("ots_currency_change", handleCustomChange);
    window.addEventListener("ots_settings_change", handleSettingsCustomChange);

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

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("ots_currency_change", handleCustomChange);
      window.removeEventListener("ots_settings_change", handleSettingsCustomChange);
    };
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (!CURRENCIES[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem("ots_currency", code);
      document.cookie = `selectedcurrency=${code}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("ots_currency_change", { detail: code }));
    } catch (e) {}
  }, []);

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

  const customFormatPrice = useCallback(
    (amountGbp: number) => formatPrice(amountGbp, currency),
    [currency]
  );

  const customConvertPrice = useCallback(
    (amountGbp: number) => convertFromGbp(amountGbp, currency),
    [currency]
  );

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        formatPrice: customFormatPrice,
        convertPrice: customConvertPrice,
        siteSettings,
        updateSiteSettingsState,
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
