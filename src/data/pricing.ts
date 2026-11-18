import { convertFromUsd, type CurrencyCode } from "./currencies";

export const DIGITAL_PRICE_USD = 39.99;
export const EXTRA_CHARACTER_PRICE = 15;
export const EXPEDITED_PRICE = 10;
export const MAX_CHARACTERS = 6;

export interface PrintFormat {
  id: string;
  label: string;
  description: string;
  addOnUsd: number;
}

export const PRINT_FORMATS: PrintFormat[] = [
  {
    id: "digital",
    addOnUsd: 0,
    label: "Digital File Only",
    description: "High-resolution file delivered by email, ready to print locally",
  },
  {
    id: "poster-12x16",
    addOnUsd: 25,
    label: 'Poster Print — 12x16"',
    description: "Premium matte poster + digital file. Free standard delivery.",
  },
  {
    id: "poster-18x24",
    addOnUsd: 35,
    label: 'Poster Print — 18x24"',
    description: "Premium matte poster + digital file. Free standard delivery.",
  },
  {
    id: "canvas-12x16",
    addOnUsd: 50,
    label: 'Canvas Wrap — 12x16"',
    description: "Gallery-wrapped canvas + digital file. Free standard delivery.",
  },
  {
    id: "canvas-18x24",
    addOnUsd: 70,
    label: 'Canvas Wrap — 18x24"',
    description: "Gallery-wrapped canvas + digital file. Free standard delivery.",
  },
  {
    id: "framed-12x16",
    addOnUsd: 60,
    label: 'Framed Print — 12x16"',
    description: "Black frame + digital file. Free standard delivery.",
  },
  {
    id: "framed-18x24",
    addOnUsd: 90,
    label: 'Framed Print — 18x24"',
    description: "Black frame + digital file. Free standard delivery.",
  },
];

export function priceCents(usd: number, currency: CurrencyCode): number {
  return usd === 0 ? 0 : Math.round(convertFromUsd(usd, currency) * 100);
}

export function orderTotalCents({ characters, currency, expedited, formatId }: {
  characters: number;
  currency: CurrencyCode;
  expedited: boolean;
  formatId: string;
}): number {
  const format = PRINT_FORMATS.find((option) => option.id === formatId);
  if (!format) throw new Error("Unknown order format");
  return priceCents(DIGITAL_PRICE_USD, currency) +
    (characters - 1) * priceCents(EXTRA_CHARACTER_PRICE, currency) +
    (expedited ? priceCents(EXPEDITED_PRICE, currency) : 0) +
    priceCents(format.addOnUsd, currency);
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
