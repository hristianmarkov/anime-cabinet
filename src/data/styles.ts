import type { PortraitStyle } from "./types";
import { mergeStyle } from "./generated/merge";
import { animeStyles } from "./styles-anime";
import { cartoonStyles } from "./styles-cartoon";

export const allStyles: PortraitStyle[] = [...animeStyles, ...cartoonStyles];

export const bestSellers: PortraitStyle[] = allStyles.filter(
  (s) => s.badge === "bestseller"
);

export function getStyleBySlug(slug: string): PortraitStyle | undefined {
  const base = allStyles.find((s) => s.slug === slug);
  return base ? mergeStyle(base) : undefined;
}

export { animeStyles, cartoonStyles };
