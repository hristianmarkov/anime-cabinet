import type { CurrencyCode } from "@/data/currencies";
import { getGelatoProductUid } from "@/data/gelato-products";
import { isPrintFormat, PRINT_FORMATS, type PrintQuote } from "@/data/pricing";
import { quoteGelatoOrder } from "@/lib/gelato";
import type { ShippingAddress } from "@/lib/schema";

const DEFAULT_PRINT_SURCHARGE = 5;
const GELATO_PRODUCT_BASE = "https://product.gelatoapis.com";

function getLiveProductUid(formatId: string): string {
  if (!PRINT_FORMATS.some((format) => format.id === formatId && isPrintFormat(format.id))) {
    throw new Error("Unknown print format");
  }

  const productUid = getGelatoProductUid(formatId);
  if (!productUid) throw new Error(`Missing Gelato product UID for ${formatId}`);

  const [category, size] = formatId.split("-");
  const otherSize = size === "12x16" ? "18x24" : "12x16";
  if (productUid === getGelatoProductUid(`${category}-${otherSize}`)) {
    throw new Error(`Gelato product UID is shared by both ${category} sizes`);
  }
  return productUid;
}

async function fetchPrintPriceCents(productUid: string, country: string, currency: CurrencyCode) {
  const apiKey = process.env.GELATO_API_KEY;
  if (!apiKey) throw new Error("GELATO_API_KEY is not set");

  const params = new URLSearchParams({ country, currency });
  const res = await fetch(
    `${GELATO_PRODUCT_BASE}/v3/products/${encodeURIComponent(productUid)}/prices?${params}`,
    { headers: { "X-API-KEY": apiKey }, next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`Gelato price lookup failed (HTTP ${res.status})`);

  const data = await res.json();
  const rows: { quantity: number; price: number; currency?: string; country?: string }[] =
    Array.isArray(data) ? data : data.prices;
  const row = rows?.find((row) =>
    row.quantity === 1 && (!row.currency || row.currency === currency) &&
    (!row.country || row.country === country)
  );
  if (!row || !Number.isFinite(row.price) || row.price <= 0) {
    throw new Error("Gelato returned no matching unit price");
  }

  const configuredSurcharge = process.env.GELATO_PRINT_SURCHARGE?.trim();
  const surcharge = configuredSurcharge ? Number(configuredSurcharge) : DEFAULT_PRINT_SURCHARGE;
  const flatMarkup = Number.isFinite(surcharge) && surcharge >= 0 ? surcharge : DEFAULT_PRINT_SURCHARGE;
  return Math.round((row.price + flatMarkup) * 100);
}

export async function getAllPrintPrices(country: string, currency: CurrencyCode) {
  const prices: Partial<Record<string, number>> = {};
  await Promise.all(PRINT_FORMATS.filter((format) => isPrintFormat(format.id)).map(async (format) => {
    try {
      prices[format.id] = await fetchPrintPriceCents(getLiveProductUid(format.id), country, currency);
    } catch (error) {
      console.warn(`Print price unavailable for ${format.id} (${country}, ${currency}):`, error);
    }
  }));
  return prices;
}

function deliveryDays(value: number | undefined) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : undefined;
}

export async function getPrintQuote(
  formatId: string,
  recipient: ShippingAddress,
  currency: CurrencyCode
): Promise<PrintQuote> {
  const productUid = getLiveProductUid(formatId);
  const [printPriceCents, quote] = await Promise.all([
    fetchPrintPriceCents(productUid, recipient.country, currency),
    quoteGelatoOrder({ productUid, currency, recipient }),
  ]);

  const eligibleMethods = quote.methods
    .filter((method) => method.shipmentMethodUid && method.name && method.currency === currency &&
      method.isPrivate && Number.isFinite(method.price) && method.price >= 0)
    .sort((a, b) => a.price - b.price);

  const economy = eligibleMethods.find((method) => method.type === "normal" || method.type === "standard");
  const express = eligibleMethods.find((method) => method.type === "express");
  const methods = [
    { method: economy, tier: "Economy" },
    { method: express, tier: "Express" },
  ].flatMap(({ method, tier }) => method ? [{
    uid: method.shipmentMethodUid,
    name: `${method.name} (${tier})`,
    priceCents: Math.round(method.price * 100),
    minDays: deliveryDays(method.minDeliveryDays),
    maxDays: deliveryDays(method.maxDeliveryDays),
  }] : []);

  return { quoteId: quote.quoteId, printPriceCents, methods };
}
