export type StyleCategory = "anime" | "cartoon";

export type StyleBadge = "bestseller" | "popular" | "new";

export interface StyleFaq {
  q: string;
  a: string;
}

export interface PortraitStyle {
  /** URL segment, e.g. "naruto" -> /portraits/naruto */
  slug: string;
  /** Short display name, e.g. "Naruto" */
  name: string;
  /** Full product name used in H1s and titles, e.g. "Custom Naruto Portrait" */
  productName: string;
  category: StyleCategory;
  /** One-liner used on cards and under headings */
  tagline: string;
  /** SEO title tag (~60 chars) */
  metaTitle: string;
  /** SEO meta description (~155 chars) */
  metaDescription: string;
  /** Target keywords, first one is primary */
  keywords: string[];
  /** Product page hero heading */
  heroHeading: string;
  /** Two to three paragraphs of unique product copy */
  description: string[];
  /** Style-specific FAQs (merged with global product FAQs on page) */
  faqs: StyleFaq[];
  badge?: StyleBadge;
  /** Accent hex used for card gradient tint */
  accent: string;
  /** Base price in USD for 1 character, digital */
  priceFrom: number;
}
