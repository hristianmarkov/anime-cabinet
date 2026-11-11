import type { BlogPost } from "../blog";
import { normalizeBlogSections } from "../blog-blocks";
import type { PortraitStyle } from "../types";
import allBlogJson from "../../../content-schema/generated/all-blog.json";
import allStylesJson from "../../../content-schema/generated/all-styles.json";

type BlogOverrides = Record<string, Partial<BlogPost>>;
type StyleOverrides = Record<string, Partial<PortraitStyle>>;

const blogOverrides = allBlogJson as BlogOverrides;
const styleOverrides = allStylesJson as StyleOverrides;

export function mergeBlogPost(base: BlogPost): BlogPost {
  const override = blogOverrides[base.slug];
  if (!override) return base;
  const generatedSections = normalizeBlogSections(override.sections ?? []);
  // Some saved generations contain headings with empty bodies. Keep the
  // complete editorial article rather than publishing those empty outlines.
  const hasCompleteSections = generatedSections.length > 0 && generatedSections.every(
    (section) => section.paragraphs.some((text) => text.trim()) ||
      section.list?.some((text) => text.trim()) || section.blocks?.length
  );
  const sections = hasCompleteSections ? generatedSections : normalizeBlogSections(base.sections);
  return {
    ...base,
    ...override,
    sections,
    keywords: override.keywords ?? base.keywords,
  };
}

export function mergeBlogPosts(posts: BlogPost[]): BlogPost[] {
  return posts.map(mergeBlogPost);
}

export function mergeStyle(base: PortraitStyle): PortraitStyle {
  const override = styleOverrides[base.slug];
  if (!override) return base;
  return {
    ...base,
    ...override,
    description: override.description ?? base.description,
    faqs: override.faqs ?? base.faqs,
    keywords: override.keywords ?? base.keywords,
  };
}

export function getGeneratedStyleOverride(slug: string): Partial<PortraitStyle> | undefined {
  return styleOverrides[slug];
}
