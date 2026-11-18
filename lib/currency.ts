export type CurrencyCode = "GBP" | "EUR" | "USD";

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number; // multiplier from GBP
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GBP: { code: "GBP", name: "Pound Sterling", symbol: "£", rate: 1.0 },
  EUR: { code: "EUR", name: "Euro", symbol: "€", rate: 1.18 },
  USD: { code: "USD", name: "US Dollar", symbol: "$", rate: 1.30 },
};

export function convertFromGbp(amountGbp: number = 0, targetCurrency: CurrencyCode = "GBP"): number {
  const num = Number(amountGbp) || 0;
  const rate = CURRENCIES[targetCurrency]?.rate || 1.0;
  return Math.round(num * rate * 100) / 100;
}

export function formatPrice(amountGbp: number, currency: CurrencyCode = "GBP"): string {
  const converted = convertFromGbp(amountGbp, currency);
  const symbol = CURRENCIES[currency]?.symbol || "£";
  return `${symbol}${converted.toFixed(2)}`;
}
