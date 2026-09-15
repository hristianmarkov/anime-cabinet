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
  const sections = normalizeBlogSections(override.sections ?? base.sections);
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
