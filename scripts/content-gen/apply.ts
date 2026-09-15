import { getPostBySlug } from "../../src/data/blog";
import { normalizeBlogBlock, productShowcase } from "../../src/data/blog-blocks";
import { styleBlogConfigs } from "../../src/data/blog-per-style-config";
import { getStyleBySlug } from "../../src/data/styles";
import type { ContentBrief, ContentDraft } from "./types";
import path from "node:path";
import {
  GENERATED_DIR,
  generatedBlogPath,
  generatedPagePath,
  generatedStylePath,
  readJson,
  writeJson,
} from "./paths";
import { sanitizeDescriptionParagraphs, sanitizeFaqs, sanitizeKeywords } from "./sanitize";
import { countDraftSlots, countStylePayload, validateStylePayload, validateWordCount } from "./word-count";

function parseJsonField<T>(val: unknown, fallback: T): T {
  if (val == null) return fallback;
  if (typeof val === "object") return val as T;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function readingMinutes(words: number): number {
  return Math.max(3, Math.round(words / 200));
}

type RawBlogSection = {
  heading?: string;
  blocks?: unknown[];
  paragraphs?: string[];
  body?: string;
  table?: string[][];
  steps?: string[];
  faq?: Array<{ question: string; answer: string }>;
  links?: string;
};

function normalizeBlogSection(section: RawBlogSection): { heading?: string; paragraphs: string[]; blocks: unknown[] } {
  if (section.blocks?.length) {
    const blocks = section.blocks
      .map((block) => normalizeBlogBlock(block))
      .filter((block) => block !== null);
    return { heading: section.heading, paragraphs: section.paragraphs ?? [], blocks };
  }

  const blocks: unknown[] = [];

  if (section.body) {
    for (const paragraph of section.body.split(/\n\n+/).filter(Boolean)) {
      blocks.push({ type: "paragraph", text: paragraph.trim() });
    }
  }

  for (const paragraph of section.paragraphs ?? []) {
    blocks.push({ type: "paragraph", text: paragraph });
  }

  if (section.table?.length) {
    const [header, ...rows] = section.table;
    if (header?.length) {
      for (const row of rows) {
        const items = row.map((cell, i) => `${header[i] ?? `Column ${i + 1}`}: ${cell}`);
        blocks.push({ type: "list", items });
      }
    }
  }

  if (section.steps?.length) {
    blocks.push({ type: "list", items: section.steps });
  }

  if (section.links) {
    blocks.push({ type: "paragraph", text: section.links });
  }

  if (section.faq?.length) {
    for (const item of section.faq) {
      blocks.push({ type: "heading", text: item.question });
      blocks.push({ type: "paragraph", text: item.answer });
    }
  }

  return { heading: section.heading, paragraphs: [], blocks };
}

function mergeAggregate(filename: string, slug: string, entry: Record<string, unknown>): void {
  const file = path.join(GENERATED_DIR, filename);
  const current = readJson<Record<string, unknown>>(file) ?? {};
  current[slug] = entry;
  writeJson(file, current);
}

function injectStyleBlogBlocks(
  sections: Array<{ heading?: string; blocks?: unknown[] }>,
  styleSlug: string,
  layout: string
): Array<{ heading?: string; blocks: unknown[] }> {
  const config = styleBlogConfigs.find((c) => c.slug === styleSlug);
  if (!config) {
    return sections.map((s) => ({
      heading: s.heading,
      paragraphs: [],
      blocks: (s.blocks ?? []) as unknown[],
    }));
  }

  return sections.map((section, idx) => {
    const blocks = [...((section.blocks ?? []) as unknown[])];

    if (idx === 0 && layout === "blog-style-transform") {
      blocks.push({
        type: "figure",
        artFile: config.galleryFile,
        caption: `${config.inspiredLabel} custom artwork — hand-drawn style study from our gallery.`,
      });
      blocks.push(
        productShowcase(
          styleSlug,
          `Turn your photo into ${config.inspiredLabel} custom artwork — hand-drawn by a real artist with unlimited revisions.`
        )
      );
    }

    if (idx === 1 && layout === "blog-style-transform") {
      blocks.push({
        type: "beforeAfter",
        beforeFile: `${styleSlug}-before.jpg`,
        afterFile: `${styleSlug}-after.jpg`,
        styleName: config.name,
      });
    }

    if (idx === 0 && layout === "blog-style-gift") {
      blocks.push(
        productShowcase(
          styleSlug,
          `Order a ${config.inspiredLabel} custom portrait — preview within 72 hours, unlimited revisions.`
        )
      );
    }

    return { heading: section.heading, paragraphs: [], blocks };
  });
}

export function applyDraft(brief: ContentBrief, draft: ContentDraft): { path: string; words: number } {
  const slots = draft.slots;
  const validation = validateWordCount(brief, slots);
  if (!validation.ok) {
    console.warn(`Warning: ${validation.message}`);
  }
  const words = validation.words;

  if (brief.layout === "style-landing") {
    const style = getStyleBySlug(brief.slug);
    const payload = {
      slug: brief.slug,
      metaTitle: String(slots.metaTitle ?? style?.metaTitle ?? ""),
      metaDescription: String(slots.metaDescription ?? style?.metaDescription ?? ""),
      heroHeading: String(slots.heroHeading ?? style?.heroHeading ?? ""),
      description: sanitizeDescriptionParagraphs(
        parseJsonField<string[]>(slots.description, style?.description ?? [])
      ),
      faqs: sanitizeFaqs(parseJsonField<Array<{ q: string; a: string }>>(slots.faqs, style?.faqs ?? [])),
      keywords: sanitizeKeywords(
        parseJsonField<string[]>(slots.keywords, style?.keywords ?? []),
        brief.keywords.primary
      ),
      generatedAt: draft.generatedAt,
    };
    const styleValidation = validateStylePayload(payload);
    if (!styleValidation.ok) {
      console.warn(`Warning: ${styleValidation.message}`);
    }
    const out = generatedStylePath(brief.slug);
    writeJson(out, payload);
    mergeAggregate("all-styles.json", brief.slug, payload);
    return { path: out, words: countStylePayload(payload) };
  }

  if (brief.layout.startsWith("blog-")) {
    const existing = getPostBySlug(brief.slug);
    const styleSlug = existing?.ctaStyle ?? brief.slug.replace(/-inspired.*/, "");

    let sections = parseJsonField<RawBlogSection[]>(slots.sections, existing?.sections ?? []).map(
      normalizeBlogSection
    );

    if (brief.styleSlug && (brief.layout === "blog-style-transform" || brief.layout === "blog-style-gift")) {
      sections = injectStyleBlogBlocks(sections, brief.styleSlug, brief.layout);
    }

    const payload = {
      slug: brief.slug,
      title: String(slots.title ?? existing?.title ?? ""),
      metaTitle: slots.metaTitle ? String(slots.metaTitle) : existing?.metaTitle,
      description: String(slots.description ?? existing?.description ?? ""),
      date: existing?.date ?? new Date().toISOString().slice(0, 10),
      readingMinutes: readingMinutes(words),
      keywords: parseJsonField<string[]>(slots.keywords, existing?.keywords ?? []),
      intro: String(slots.intro ?? existing?.intro ?? ""),
      sections,
      ctaStyle: existing?.ctaStyle ?? styleSlug,
      ctaLabel: String(slots.ctaLabel ?? existing?.ctaLabel ?? "Order Your Portrait"),
      category: existing?.category,
      heroImage: existing?.heroImage ?? (brief.styleSlug ? `${brief.styleSlug}-after.jpg` : undefined),
      generatedAt: draft.generatedAt,
    };

    const out = generatedBlogPath(brief.slug);
    writeJson(out, payload);
    mergeAggregate("all-blog.json", brief.slug, payload);
    return { path: out, words };
  }

  const payload = {
    slug: brief.slug,
    layout: brief.layout,
    metaTitle: String(slots.metaTitle ?? ""),
    description: String(slots.description ?? ""),
    heroHeading: String(slots.heroHeading ?? ""),
    heroSubcopy: slots.heroSubcopy ? String(slots.heroSubcopy) : undefined,
    bodySections: parseJsonField<Array<{ heading?: string; paragraphs: string[] }>>(
      slots.bodySections,
      []
    ),
    generatedAt: draft.generatedAt,
  };

  const out = generatedPagePath(brief.slug);
  writeJson(out, payload);
  mergeAggregate("all-pages.json", brief.slug, payload);
  return { path: out, words: countDraftSlots(slots) };
}
