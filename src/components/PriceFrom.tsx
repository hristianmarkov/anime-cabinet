"use client";

import { useCurrency } from "@/context/CurrencyContext";

export function PriceFrom({ usd, prefix = "from " }: { usd: number; prefix?: string }) {
  const { formatPrice } = useCurrency();
  return (
    <>
      {prefix}
      {formatPrice(usd)}
    </>
  );
}
