export type CurrencyCode = "USD" | "GBP" | "EUR" | "CAD" | "AUD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  /** Multiply USD base price by this rate for display/charge */
  rateFromUsd: number;
  locale: string;
}

/** Update rates periodically. Base prices in the codebase are USD. */
export const CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", rateFromUsd: 1, locale: "en-US" },
  { code: "GBP", symbol: "£", rateFromUsd: 0.79, locale: "en-GB" },
  { code: "EUR", symbol: "€", rateFromUsd: 0.92, locale: "de-DE" },
  { code: "CAD", symbol: "CA$", rateFromUsd: 1.36, locale: "en-CA" },
  { code: "AUD", symbol: "A$", rateFromUsd: 1.53, locale: "en-AU" },
];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function getCurrency(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function convertFromUsd(usd: number, code: CurrencyCode): number {
  return Math.round(usd * getCurrency(code).rateFromUsd * 100) / 100;
}

export function formatMoney(amountUsd: number, code: CurrencyCode = "USD"): string {
  const cfg = getCurrency(code);
  const converted = convertFromUsd(amountUsd, code);
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.code,
  }).format(converted);
}
