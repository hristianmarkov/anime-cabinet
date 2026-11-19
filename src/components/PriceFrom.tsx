"use client";

import { orderTotalCents } from "@/data/pricing";
import { formatCurrencyAmount } from "@/data/currencies";
import { useCurrency } from "@/context/CurrencyContext";

export function PriceFrom({ usd, prefix = "from " }: { usd: number; prefix?: string }) {
  const { currency, formatPrice, toChargeAmount } = useCurrency();
  const comparisonPrice = formatCurrencyAmount(toChargeAmount(usd) * 2, currency);
  return (
    <>
      {prefix}
      <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
        <span className="sr-only">Comparison amount, twice the current price: </span>
        <s className="font-normal opacity-75" title="Twice the current price">{comparisonPrice}</s>
        <span className="sr-only">Current price: </span>
        <span>{formatPrice(usd)}</span>
      </span>
    </>
  );
}

export function PrintPrice({ formatId }: { formatId: string }) {
  const { currency } = useCurrency();
  const total = orderTotalCents({ formatId, characters: 1, currency, expedited: false });
  return <>{formatCurrencyAmount(total / 100, currency)}</>;
}
