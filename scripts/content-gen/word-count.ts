import { blogPosts } from "../../src/data/blog";
import type { ContentBrief } from "./types";

export function extractBlogPostText(post: {
  intro: string;
  sections: Array<{
    heading?: string;
    paragraphs?: string[];
    list?: string[];
    blocks?: Array<{ type: string; text?: string; items?: string[] }>;
  }>;
}): string[] {
  const texts: string[] = [post.intro];
  for (const s of post.sections) {
    if (s.heading) texts.push(s.heading);
    if (s.paragraphs) texts.push(...s.paragraphs);
    if (s.list) texts.push(...s.list);
    if (s.blocks) {
      for (const b of s.blocks) {
        if (b.type === "paragraph" && b.text) texts.push(b.text);
        if (b.type === "list" && b.items) texts.push(...b.items);
        if (b.type === "pullQuote" && b.text) texts.push(b.text);
        if (b.type === "heading" && b.text) texts.push(b.text);
      }
    }
  }
  return texts;
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function getBlogWordCount(slug: string): number {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return 0;
  return countWords(extractBlogPostText(post).join(" "));
}

export function countDraftSlots(slots: Record<string, unknown>): number {
  const parts: string[] = [];
  for (const val of Object.values(slots)) {
    if (typeof val === "string") parts.push(val);
    else parts.push(JSON.stringify(val));
  }
  return countWords(parts.join(" "));
}

export function countStylePayload(payload: {
  metaDescription?: string;
  heroHeading?: string;
  description?: string[];
  faqs?: Array<{ q: string; a: string }>;
  keywords?: string[];
}): number {
  const parts = [
    payload.metaDescription ?? "",
    payload.heroHeading ?? "",
    ...(payload.description ?? []),
    ...(payload.faqs ?? []).flatMap((f) => [f.q, f.a]),
  ];
  return countWords(parts.join(" "));
}

export function validateWordCount(
  brief: ContentBrief,
  slots: Record<string, unknown>
): { ok: boolean; words: number; target: number; message?: string } {
  const words = countDraftSlots(slots);
  const minRequired = Math.round(brief.wordCount.target * 0.85);
  if (words < minRequired) {
    return {
      ok: false,
      words,
      target: brief.wordCount.target,
      message: `Word count ${words} below 85% of target ${brief.wordCount.target} (min ${minRequired})`,
    };
  }
  return { ok: true, words, target: brief.wordCount.target };
}

export function validateStylePayload(payload: {
  metaDescription?: string;
  heroHeading?: string;
  description?: string[];
  faqs?: Array<{ q: string; a: string }>;
}): { ok: boolean; words: number; min: number; message?: string } {
  const words = countStylePayload(payload);
  const min = 350;
  if (words < min) {
    return { ok: false, words, min, message: `Style page ${words} words — minimum is ${min}` };
  }
  return { ok: true, words, min };
}
