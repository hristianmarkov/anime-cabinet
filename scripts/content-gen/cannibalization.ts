import type { PageEntry } from "./types";

export interface CannibalizationNote {
  url: string;
  note: string;
}

export function getCannibalizationRules(page: PageEntry): CannibalizationNote[] {
  const notes: CannibalizationNote[] = [];

  if (page.url === "/") {
    notes.push({
      url: "/portraits",
      note: "Homepage owns 'custom anime portrait' — link to /portraits hub, do not duplicate full style list",
    });
  }

  if (page.layout === "style-landing" && page.styleSlug) {
    notes.push({
      url: `/blog/${page.styleSlug}-inspired-custom-poster`,
      note: "Link to transform guide for how-to intent; style page owns product keywords",
    });
    notes.push({
      url: `/blog/best-gifts-for-${page.styleSlug}-fans`,
      note: "Link to gift guide for gift intent",
    });
    notes.push({
      url: "/",
      note: "Link to homepage for brand; do not compete on generic 'custom anime portrait'",
    });
  }

  if (page.layout === "blog-style-transform" && page.styleSlug) {
    notes.push({
      url: `/portraits/${page.styleSlug}`,
      note: "Primary product page owns 'custom [style] portrait' — use how-to long-tail only, link with markdown",
    });
    notes.push({
      url: `/blog/${page.styleSlug}-inspired-poster-gift-ideas`,
      note: "Cross-link gift post, different intent",
    });
  }

  if (page.layout === "blog-style-gift" && page.styleSlug) {
    notes.push({
      url: `/portraits/${page.styleSlug}`,
      note: "Link to product page as main CTA destination",
    });
    notes.push({
      url: `/blog/${page.styleSlug}-inspired-custom-poster`,
      note: "Link to transform guide for process details",
    });
  }

  if (page.layout === "blog-gift-guide" && page.styleSlug) {
    notes.push({
      url: `/portraits/${page.styleSlug}`,
      note: "Portrait product page is the hero recommendation",
    });
  }

  if (page.styleSlug === "one-piece-wanted-poster") {
    notes.push({
      url: "/portraits/one-piece",
      note: "Wanted poster page owns all bounty/poster keywords — do not split to generic One Piece portrait",
    });
  }

  return notes;
}
