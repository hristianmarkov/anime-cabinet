"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES, type CurrencyCode } from "@/data/currencies";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      aria-label="Select currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs font-semibold text-cream focus:border-accent focus:outline-none"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code}
        </option>
      ))}
    </select>
  );
}
