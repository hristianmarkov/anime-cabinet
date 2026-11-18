import { convertFromUsd, type CurrencyCode } from "./currencies";

/**
 * Artwork and priority fees are based in USD. Gelato supplies print and
 * shipping amounts in the checkout currency.
 */

export const EXTRA_CHARACTER_PRICE = 15;
export const EXPEDITED_PRICE = 10;
export const MAX_CHARACTERS = 6;

export interface PrintFormat {
  id: string;
  label: string;
  description: string;
}

export const PRINT_FORMATS: PrintFormat[] = [
  {
    id: "digital",
    label: "Digital File Only",
    description: "High-resolution file delivered by email, ready to print locally",
  },
  {
    id: "poster-12x16",
    label: 'Poster Print — 12x16"',
    description: "Premium matte poster + digital file. Shipping calculated at checkout.",
  },
  {
    id: "poster-18x24",
    label: 'Poster Print — 18x24"',
    description: "Premium matte poster + digital file. Shipping calculated at checkout.",
  },
  {
    id: "canvas-12x16",
    label: 'Canvas Wrap — 12x16"',
    description: "Gallery-wrapped canvas + digital file. Shipping calculated at checkout.",
  },
  {
    id: "canvas-18x24",
    label: 'Canvas Wrap — 18x24"',
    description: "Gallery-wrapped canvas + digital file. Shipping calculated at checkout.",
  },
  {
    id: "framed-12x16",
    label: 'Framed Print — 12x16"',
    description: "Black frame + digital file. Shipping calculated at checkout.",
  },
  {
    id: "framed-18x24",
    label: 'Framed Print — 18x24"',
    description: "Black frame + digital file. Shipping calculated at checkout.",
  },
];

export interface ShippingOption {
  uid: string;
  name: string;
  priceCents: number;
  minDays?: number;
  maxDays?: number;
}

export interface PrintQuote {
  quoteId: string;
  printPriceCents: number;
  methods: ShippingOption[];
}

export function orderTotalCents({
  basePrice,
  characters,
  currency,
  expedited,
  printPriceCents = 0,
  shippingCents = 0,
}: {
  basePrice: number;
  characters: number;
  currency: CurrencyCode;
  expedited: boolean;
  printPriceCents?: number;
  shippingCents?: number;
}): number {
  const artworkUsd =
    basePrice + (characters - 1) * EXTRA_CHARACTER_PRICE + (expedited ? EXPEDITED_PRICE : 0);
  return Math.round(convertFromUsd(artworkUsd, currency) * 100) + printPriceCents + shippingCents;
}

export function formatDeliveryEstimate({ minDays, maxDays }: ShippingOption): string | null {
  if (minDays == null && maxDays == null) return null;
  if (minDays == null) return `Up to ${maxDays} days`;
  if (maxDays == null) return `${minDays}+ days`;
  if (maxDays < minDays) return null;
  if (minDays === maxDays) return `${minDays} ${minDays === 1 ? "day" : "days"}`;
  return `${minDays}–${maxDays} days`;
}

export function isPrintFormat(formatId: string): boolean {
  return formatId !== "digital";
}

export type PrintCategory = "digital" | "poster" | "canvas" | "framed";
export type PrintSize = "12x16" | "18x24";

export const PRINT_CATEGORIES: { id: PrintCategory; label: string; description: string }[] = [
  { id: "digital", label: "Digital File", description: "High-res file by email — print anywhere" },
  { id: "poster", label: "Poster", description: "Premium matte poster + digital file" },
  { id: "canvas", label: "Canvas", description: "Gallery-wrapped canvas + digital file" },
  { id: "framed", label: "Framed Print", description: "Black frame + digital file" },
];

export const PRINT_SIZES: PrintSize[] = ["12x16", "18x24"];

export function formatPrintSize(size: PrintSize | "12x18", country: string, locale?: string): string {
  const [width, height] = size.split("x").map(Number);
  if (["US", "LR", "MM"].includes(country)) return `${width} × ${height} in`;
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return `${number.format(width * 2.54)} × ${number.format(height * 2.54)} cm`;
}

export function formatIdFromCategory(category: PrintCategory, size: PrintSize): string {
  if (category === "digital") return "digital";
  return `${category}-${size}`;
}

export function getOrderFormatLabel(formatId: string, country?: string): string {
  const legacySize = formatId.endsWith("-12x18");
  const catalogId = legacySize ? formatId.replace(/12x18$/, "12x16") : formatId;
  const format = PRINT_FORMATS.find((format) => format.id === catalogId);
  if (!format) return formatId;

  const label = legacySize ? format.label.replace("12x16", "12x18") : format.label;
  const size = label.match(/(12x16|12x18|18x24)"$/)?.[1] as PrintSize | "12x18" | undefined;
  return size && country ? label.replace(`${size}"`, formatPrintSize(size, country)) : label;
}
