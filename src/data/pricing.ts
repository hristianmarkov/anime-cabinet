/**
 * Pricing model (USD base):
 * - Base price from style (priceFrom, 1 character digital)
 * - Extra characters + print format + expedite + Gelato shipping at checkout
 */

export const EXTRA_CHARACTER_PRICE = 15;
export const EXPEDITED_PRICE = 10;
export const MAX_CHARACTERS = 6;

export interface PrintFormat {
  id: string;
  label: string;
  description: string;
  price: number;
}

export const PRINT_FORMATS: PrintFormat[] = [
  {
    id: "digital",
    label: "Digital File Only",
    description: "High-resolution file delivered by email, ready to print locally",
    price: 0,
  },
  {
    id: "poster-12x18",
    label: 'Poster Print — 12x18"',
    description: "Premium matte poster + digital file. Shipping calculated at checkout.",
    price: 19,
  },
  {
    id: "poster-18x24",
    label: 'Poster Print — 18x24"',
    description: "Premium matte poster + digital file. Shipping calculated at checkout.",
    price: 29,
  },
  {
    id: "canvas-12x18",
    label: 'Canvas Wrap — 12x18"',
    description: "Gallery-wrapped canvas + digital file. Shipping calculated at checkout.",
    price: 49,
  },
  {
    id: "canvas-18x24",
    label: 'Canvas Wrap — 18x24"',
    description: "Gallery-wrapped canvas + digital file. Shipping calculated at checkout.",
    price: 69,
  },
  {
    id: "framed-12x18",
    label: 'Framed Print — 12x18"',
    description: "Black wood frame + digital file. Shipping calculated at checkout.",
    price: 59,
  },
];

export interface BackgroundOption {
  id: string;
  label: string;
  description: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: "classic-scene",
    label: "Classic Scene",
    description: "An iconic location from the show, chosen by our artists",
  },
  {
    id: "custom-scene",
    label: "Custom Scene",
    description: "Describe any scene or upload a photo of a place — we'll draw it",
  },
];

export interface ShippingOption {
  uid: string;
  name: string;
  priceUsd: number;
  minDays: number;
  maxDays: number;
}

export interface CalcTotalInput {
  basePrice: number;
  characters: number;
  formatId: string;
  expedited?: boolean;
  shippingUsd?: number;
}

export function calcTotal({
  basePrice,
  characters,
  formatId,
  expedited = false,
  shippingUsd = 0,
}: CalcTotalInput): number {
  const format = PRINT_FORMATS.find((f) => f.id === formatId) ?? PRINT_FORMATS[0];
  const extra = Math.max(0, characters - 1) * EXTRA_CHARACTER_PRICE;
  const rush = expedited ? EXPEDITED_PRICE : 0;
  return Math.round((basePrice + extra + format.price + rush + shippingUsd) * 100) / 100;
}

export function isPrintFormat(formatId: string): boolean {
  return formatId !== "digital";
}

export type PrintCategory = "digital" | "poster" | "canvas" | "framed";
export type PrintSize = "12x18" | "18x24";

export const PRINT_CATEGORIES: { id: PrintCategory; label: string; description: string }[] = [
  { id: "digital", label: "Digital File", description: "High-res file by email — print anywhere" },
  { id: "poster", label: "Poster", description: "Premium matte poster + digital file" },
  { id: "canvas", label: "Canvas", description: "Gallery-wrapped canvas + digital file" },
  { id: "framed", label: "Framed Print", description: "Black wood frame + digital file" },
];

export const PRINT_SIZES: { id: PrintSize; label: string }[] = [
  { id: "12x18", label: '12 × 18"' },
  { id: "18x24", label: '18 × 24"' },
];

export function formatIdFromCategory(category: PrintCategory, size: PrintSize): string {
  if (category === "digital") return "digital";
  if (category === "framed") return "framed-12x18";
  return `${category}-${size}`;
}

export function parseFormatId(formatId: string): { category: PrintCategory; size: PrintSize } {
  if (formatId === "digital") return { category: "digital", size: "12x18" };
  if (formatId.startsWith("framed")) return { category: "framed", size: "12x18" };
  const size = formatId.endsWith("18x24") ? "18x24" : "12x18";
  if (formatId.startsWith("poster")) return { category: "poster", size };
  if (formatId.startsWith("canvas")) return { category: "canvas", size };
  return { category: "digital", size: "12x18" };
}

export function getFormatPrice(category: PrintCategory, size: PrintSize): number {
  const id = formatIdFromCategory(category, size);
  return PRINT_FORMATS.find((f) => f.id === id)?.price ?? 0;
}

/** @deprecated use formatPrice from CurrencyContext */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
