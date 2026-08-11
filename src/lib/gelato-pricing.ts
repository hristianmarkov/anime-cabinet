import { roundUpTo99 } from "@/data/currencies";
import { getGelatoProductUid } from "@/data/gelato-products";
import { isPrintFormat, PRINT_FORMATS } from "@/data/pricing";
import { isGelatoConfigured } from "@/lib/gelato";

const GELATO_PRODUCT_BASE = "https://product.gelatoapis.com";

function apiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY is not set");
  return key;
}

function printMarkup(): number {
  const raw = Number(process.env.GELATO_PRINT_MARKUP ?? "2");
  return Number.isFinite(raw) && raw > 0 ? raw : 2;
}

/** Convert Gelato wholesale print cost to customer add-on price (USD). */
export function gelatoCostToPrintAddOn(gelatoCostUsd: number): number {
  return roundUpTo99(gelatoCostUsd * printMarkup());
}

export async function fetchGelatoProductCostUsd(
  productUid: string,
  country: string,
  currency = "USD"
): Promise<number> {
  const params = new URLSearchParams({ country, currency });
  const res = await fetch(
    `${GELATO_PRODUCT_BASE}/v3/products/${encodeURIComponent(productUid)}/prices?${params}`,
    {
      headers: { "X-API-KEY": apiKey() },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gelato price lookup failed: ${err}`);
  }

  const rows = (await res.json()) as { quantity: number; price: number }[];
  const row = rows.find((r) => r.quantity === 1);
  if (!row) throw new Error(`No Gelato price for quantity 1 (${productUid})`);
  return row.price;
}

export async function getPrintAddOnForFormat(
  formatId: string,
  country: string,
  currency = "USD"
): Promise<number> {
  if (!isPrintFormat(formatId)) return 0;

  if (!isGelatoConfigured()) {
    return PRINT_FORMATS.find((f) => f.id === formatId)?.price ?? 0;
  }

  const productUid = getGelatoProductUid(formatId);
  if (!productUid) {
    return PRINT_FORMATS.find((f) => f.id === formatId)?.price ?? 0;
  }

  const cost = await fetchGelatoProductCostUsd(productUid, country, currency);
  return gelatoCostToPrintAddOn(cost);
}

export async function getAllPrintAddOns(
  country: string,
  currency = "USD"
): Promise<Record<string, number>> {
  const prices: Record<string, number> = { digital: 0 };

  await Promise.all(
    PRINT_FORMATS.filter((f) => isPrintFormat(f.id)).map(async (format) => {
      try {
        prices[format.id] = await getPrintAddOnForFormat(format.id, country, currency);
      } catch {
        prices[format.id] = format.price;
      }
    })
  );

  return prices;
}
