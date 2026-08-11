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

/** Round up to the next *.99 price (e.g. 38.42 → 38.99, 39.01 → 39.99). */
export function roundUpTo99(amount: number): number {
  const whole = Math.floor(amount);
  const with99 = whole + 0.99;
  if (amount <= with99) return with99;
  return whole + 1 + 0.99;
}

export function convertFromUsd(usd: number, code: CurrencyCode): number {
  const converted = usd * getCurrency(code).rateFromUsd;
  if (code === "USD") {
    return Math.round(converted * 100) / 100;
  }
  return roundUpTo99(converted);
}

export function formatMoney(amountUsd: number, code: CurrencyCode = "USD"): string {
  const cfg = getCurrency(code);
  const converted = convertFromUsd(amountUsd, code);
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.code,
  }).format(converted);
}
