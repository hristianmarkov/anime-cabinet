/** Layout definitions for the content-gen pipeline. */

export type LayoutId =
  | "style-landing"
  | "blog-style-transform"
  | "blog-style-gift"
  | "blog-gift-guide"
  | "blog-comparison"
  | "blog-gift-intent"
  | "blog-before-after"
  | "blog-style-guide"
  | "blog-editorial"
  | "static-page"
  | "home";

export interface LayoutDef {
  id: LayoutId;
  label: string;
  slots: string[];
  wordCount: { min: number; target: number; max: number };
  slotInstructions: Record<string, string>;
}

export const LAYOUTS: Record<LayoutId, LayoutDef> = {
  "style-landing": {
    id: "style-landing",
    label: "Portrait style product page",
    slots: [
      "metaTitle",
      "metaDescription",
      "heroHeading",
      "description",
      "faqs",
      "keywords",
    ],
    wordCount: { min: 350, target: 500, max: 700 },
    slotInstructions: {
      metaTitle: "~60 chars, primary keyword first, include 'From Your Photo'",
      metaDescription: "~155 chars, CTA + delivery time + unlimited revisions",
      heroHeading: "Short punchy H1 alternative, fan-friendly tone",
      description: "JSON array of 2-3 paragraphs, unique per style, not generic",
      faqs: "JSON array of 2 objects {q, a}, style-specific",
      keywords: "JSON array of 5 SEO keyword strings",
    },
  },
  "blog-style-transform": {
    id: "blog-style-transform",
    label: "Style transformation guide",
    slots: ["metaTitle", "title", "description", "intro", "sections", "keywords", "ctaLabel"],
    wordCount: { min: 700, target: 1000, max: 1400 },
    slotInstructions: {
      metaTitle: "~60 chars, how-to / from photo angle, not primary product keyword",
      title: "H1, how to turn photo into style-inspired poster",
      description: "Meta description ~155 chars",
      intro: "2-3 sentences, link to gift post and portrait page in markdown",
      sections:
        "JSON array of {heading, blocks} where blocks are paragraph/list types only (images injected by apply)",
      keywords: "JSON array of 5-8 long-tail keywords",
      ctaLabel: "Short CTA button label",
    },
  },
  "blog-style-gift": {
    id: "blog-style-gift",
    label: "Style gift ideas post",
    slots: ["metaTitle", "title", "description", "intro", "sections", "keywords", "ctaLabel"],
    wordCount: { min: 700, target: 950, max: 1300 },
    slotInstructions: {
      metaTitle: "Gift-focused, ~60 chars",
      title: "Gift ideas H1",
      description: "Meta description ~155 chars",
      intro: "Gift occasion framing, link to transform post and portrait page",
      sections: "JSON array of {heading, blocks} with paragraph and list blocks",
      keywords: "JSON array of gift-intent keywords",
      ctaLabel: "Short CTA button label",
    },
  },
  "blog-gift-guide": {
    id: "blog-gift-guide",
    label: "Best gifts for X fans",
    slots: ["title", "description", "intro", "sections", "keywords"],
    wordCount: { min: 650, target: 900, max: 1200 },
    slotInstructions: {
      title: "Best gifts for [Fandom] fans",
      description: "Meta description ~155 chars",
      intro: "Why portraits beat merch clichés",
      sections: "JSON array with gift list sections",
      keywords: "JSON array of 5 keywords",
    },
  },
  "blog-comparison": {
    id: "blog-comparison",
    label: "Comparison article",
    slots: ["metaTitle", "title", "description", "intro", "sections", "keywords", "ctaLabel"],
    wordCount: { min: 700, target: 1000, max: 1300 },
    slotInstructions: {
      metaTitle: "Comparison angle in title",
      title: "Comparison H1 with both options",
      description: "Meta description",
      intro: "Set up the decision, mention hand-drawn vs alternatives if relevant",
      sections: "JSON array with comparison tables as lists",
      keywords: "JSON array",
      ctaLabel: "CTA label",
    },
  },
  "blog-gift-intent": {
    id: "blog-gift-intent",
    label: "Gift intent guide",
    slots: ["metaTitle", "title", "description", "intro", "sections", "keywords", "ctaLabel"],
    wordCount: { min: 650, target: 900, max: 1200 },
    slotInstructions: {
      metaTitle: "Occasion + anime portrait gift",
      title: "Gift guide H1",
      description: "Meta description",
      intro: "Occasion-specific hook",
      sections: "JSON array",
      keywords: "JSON array",
      ctaLabel: "CTA label",
    },
  },
  "blog-before-after": {
    id: "blog-before-after",
    label: "Before/after transformation",
    slots: ["metaTitle", "title", "description", "intro", "sections", "keywords", "ctaLabel"],
    wordCount: { min: 600, target: 850, max: 1100 },
    slotInstructions: {
      metaTitle: "Photo transformation focus",
      title: "Before/after H1",
      description: "Meta description",
      intro: "E-E-A-T: real process, hand-drawn",
      sections: "JSON array with photo tips",
      keywords: "JSON array",
      ctaLabel: "CTA label",
    },
  },
  "blog-style-guide": {
    id: "blog-style-guide",
    label: "Style guide / editorial style",
    slots: ["metaTitle", "title", "description", "intro", "sections", "keywords", "ctaLabel"],
    wordCount: { min: 700, target: 950, max: 1200 },
    slotInstructions: {
      metaTitle: "Style guide SEO title",
      title: "H1",
      description: "Meta description",
      intro: "Educational tone",
      sections: "JSON array with internal links to /portraits/*",
      keywords: "JSON array",
      ctaLabel: "CTA label",
    },
  },
  "blog-editorial": {
    id: "blog-editorial",
    label: "Editorial / culture post",
    slots: ["metaTitle", "title", "description", "intro", "sections", "keywords", "ctaLabel"],
    wordCount: { min: 600, target: 800, max: 1000 },
    slotInstructions: {
      metaTitle: "Editorial SEO title",
      title: "H1",
      description: "Meta description",
      intro: "Story-led opening",
      sections: "JSON array",
      keywords: "JSON array",
      ctaLabel: "CTA label",
    },
  },
  "static-page": {
    id: "static-page",
    label: "Static informational page",
    slots: ["metaTitle", "description", "heroHeading", "bodySections"],
    wordCount: { min: 200, target: 400, max: 600 },
    slotInstructions: {
      metaTitle: "Page title",
      description: "Meta description",
      heroHeading: "Page H1",
      bodySections: "JSON array of {heading?, paragraphs: string[]}",
    },
  },
  home: {
    id: "home",
    label: "Homepage",
    slots: ["metaTitle", "description", "heroHeading", "heroSubcopy", "bodySections"],
    wordCount: { min: 300, target: 500, max: 700 },
    slotInstructions: {
      metaTitle: "Homepage title with primary keyword",
      description: "Homepage meta description",
      heroHeading: "Hero H1 — custom anime portrait from photo",
      heroSubcopy: "1-2 sentence hero subcopy",
      bodySections: "JSON array of homepage sections",
    },
  },
};

export function getLayout(id: LayoutId): LayoutDef {
  return LAYOUTS[id];
}
