import type { PortraitStyle } from "./types";
import { animeStyles } from "./styles-anime";
import { cartoonStyles } from "./styles-cartoon";

export const allStyles: PortraitStyle[] = [...animeStyles, ...cartoonStyles];

export const bestSellers: PortraitStyle[] = allStyles.filter(
  (s) => s.badge === "bestseller"
);

export function getStyleBySlug(slug: string): PortraitStyle | undefined {
  return allStyles.find((s) => s.slug === slug);
}

export { animeStyles, cartoonStyles };
