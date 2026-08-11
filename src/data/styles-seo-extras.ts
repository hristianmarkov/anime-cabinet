import { allStyles } from "./styles";
import { site } from "./site";

/**
 * Extra SEO paragraph per style — rendered on product pages below main copy.
 */
export const styleSeoExtras: Record<string, string> = Object.fromEntries(
  allStyles.map((s) => {
    const primary = s.keywords[0] ?? `custom ${s.name.toLowerCase()} portrait`;
    const secondary = s.keywords.slice(1, 4).join(", ");
    return [
      s.slug,
      `Looking for a ${primary}? Anime Cabinet creates personalised ${s.name} artwork from your photos — ideal as a custom anime poster gift, wall art, or anniversary surprise. Popular searches include ${secondary}. Order online in minutes: upload your photo, pick your scene, and our artists deliver a preview within ${site.deliveryHours} hours with unlimited free revisions.`,
    ];
  })
);

export function getStyleSeoExtra(slug: string): string | undefined {
  return styleSeoExtras[slug];
}
