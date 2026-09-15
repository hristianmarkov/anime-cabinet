/**
 * Scan styles + blog posts + static routes → content-schema/pages.json
 */
import { blogPosts } from "../src/data/blog";
import { allStyles } from "../src/data/styles";
import type { LayoutId } from "../content-schema/layouts";
import type { PageEntry, PagesRegistry, Priority } from "./content-gen/types";
import { PAGES_JSON, writeJson } from "./content-gen/paths";

const P0_STYLE_SLUGS = new Set([
  "one-piece-wanted-poster",
  "naruto",
  "one-piece",
  "demon-slayer",
  "ghibli-style",
  "the-simpsons",
  "rick-and-morty",
]);

const STATIC_PAGES: Array<{ url: string; layout: LayoutId; slug: string; priority: Priority }> = [
  { url: "/", layout: "home", slug: "home", priority: "P0" },
  { url: "/portraits", layout: "static-page", slug: "portraits", priority: "P0" },
  { url: "/how-it-works", layout: "static-page", slug: "how-it-works", priority: "P1" },
  { url: "/reviews", layout: "static-page", slug: "reviews", priority: "P1" },
  { url: "/faq", layout: "static-page", slug: "faq", priority: "P1" },
  { url: "/about", layout: "static-page", slug: "about", priority: "P2" },
  { url: "/contact", layout: "static-page", slug: "contact", priority: "P2" },
  { url: "/blog", layout: "static-page", slug: "blog", priority: "P1" },
  { url: "/shipping", layout: "static-page", slug: "shipping", priority: "P2" },
  { url: "/refund-policy", layout: "static-page", slug: "refund-policy", priority: "P2" },
  { url: "/privacy-policy", layout: "static-page", slug: "privacy-policy", priority: "P2" },
  { url: "/terms", layout: "static-page", slug: "terms", priority: "P2" },
];

function detectBlogLayout(slug: string, category?: string): LayoutId {
  if (slug.endsWith("-inspired-custom-poster")) return "blog-style-transform";
  if (slug.endsWith("-inspired-poster-gift-ideas")) return "blog-style-gift";
  if (slug.startsWith("best-gifts-for-") && slug.endsWith("-fans")) return "blog-gift-guide";
  if (category === "comparison") return "blog-comparison";
  if (category === "gift") return "blog-gift-intent";
  if (category === "transformation") return "blog-before-after";
  if (category === "style") return "blog-style-guide";
  return "blog-editorial";
}

function extractStyleSlug(slug: string): string | undefined {
  if (slug.endsWith("-inspired-custom-poster")) {
    return slug.slice(0, -"-inspired-custom-poster".length);
  }
  if (slug.endsWith("-inspired-poster-gift-ideas")) {
    return slug.slice(0, -"-inspired-poster-gift-ideas".length);
  }
  if (slug.startsWith("best-gifts-for-") && slug.endsWith("-fans")) {
    return slug.slice("best-gifts-for-".length, -"-fans".length);
  }
  return undefined;
}

function blogPriority(layout: LayoutId, styleSlug?: string): Priority {
  if (layout === "blog-comparison" || layout === "blog-gift-intent") return "P1";
  if (styleSlug && P0_STYLE_SLUGS.has(styleSlug)) return "P1";
  if (layout === "blog-style-transform" || layout === "blog-style-gift") return "P2";
  return "P2";
}

function buildRegistry(): PagesRegistry {
  const pages: PageEntry[] = [];

  for (const s of allStyles) {
    pages.push({
      url: `/portraits/${s.slug}`,
      layout: "style-landing",
      slug: s.slug,
      styleSlug: s.slug,
      priority: P0_STYLE_SLUGS.has(s.slug) ? "P0" : "P1",
      fallbackFile: s.category === "anime" ? "src/data/styles-anime.ts" : "src/data/styles-cartoon.ts",
    });
  }

  for (const post of blogPosts) {
    const layout = detectBlogLayout(post.slug, post.category);
    const styleSlug = extractStyleSlug(post.slug);
    pages.push({
      url: `/blog/${post.slug}`,
      layout,
      slug: post.slug,
      styleSlug,
      priority: blogPriority(layout, styleSlug),
      fallbackFile: "src/data/blog.ts",
      category: post.category,
    });
  }

  for (const sp of STATIC_PAGES) {
    pages.push({
      url: sp.url,
      layout: sp.layout,
      slug: sp.slug,
      priority: sp.priority,
      fallbackFile: `src/app${sp.url === "/" ? "" : sp.url}/page.tsx`,
    });
  }

  return { generatedAt: new Date().toISOString(), pages };
}

const registry = buildRegistry();
writeJson(PAGES_JSON, registry);
console.log(`Wrote ${registry.pages.length} pages to ${PAGES_JSON}`);
