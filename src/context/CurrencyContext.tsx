"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type CurrencyCode,
  DEFAULT_CURRENCY,
  convertFromUsd,
  formatMoney,
  getCurrency,
} from "@/data/currencies";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (usdAmount: number) => string;
  toChargeAmount: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "ac_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && getCurrency(stored)) setCurrencyState(stored);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      formatPrice: (usd: number) => formatMoney(usd, currency),
      toChargeAmount: (usd: number) => convertFromUsd(usd, currency),
    }),
    [currency, setCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {},
      formatPrice: (usd: number) => formatMoney(usd, DEFAULT_CURRENCY),
      toChargeAmount: (usd: number) => usd,
    };
  }
  return ctx;
}
