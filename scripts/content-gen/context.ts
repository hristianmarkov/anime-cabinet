import { getPostBySlug } from "../../src/data/blog";
import { styleBlogConfigs } from "../../src/data/blog-per-style-config";
import { allStyles, getStyleBySlug } from "../../src/data/styles";
import { site } from "../../src/data/site";
import type { PageEntry } from "./types";

export function loadDraftContext(page: PageEntry): Record<string, unknown> {
  const style = page.styleSlug ? getStyleBySlug(page.styleSlug) : undefined;
  const config = page.styleSlug
    ? styleBlogConfigs.find((c) => c.slug === page.styleSlug)
    : undefined;
  const post = page.url.startsWith("/blog/") ? getPostBySlug(page.slug) : undefined;

  const portraitLinks = allStyles.slice(0, 12).map((s) => ({
    name: s.name,
    url: `/portraits/${s.slug}`,
  }));

  return {
    site: {
      name: site.name,
      url: site.url,
      deliveryHours: site.deliveryHours,
      expeditedHours: site.expeditedHours,
    },
    page: {
      url: page.url,
      layout: page.layout,
      slug: page.slug,
      styleSlug: page.styleSlug,
    },
    style: style
      ? {
          slug: style.slug,
          name: style.name,
          productName: style.productName,
          category: style.category,
          tagline: style.tagline,
          keywords: style.keywords,
          priceFrom: style.priceFrom,
        }
      : null,
    styleBlogConfig: config
      ? {
          inspiredLabel: config.inspiredLabel,
          aesthetic: config.aesthetic,
          photoTips: config.photoTips,
          posterIdeas: config.posterIdeas,
          recogniseDetail: config.recogniseDetail,
          relatedSlugs: config.relatedSlugs,
        }
      : null,
    existingPost: post
      ? {
          title: post.title,
          description: post.description,
          keywords: post.keywords,
          category: post.category,
          ctaStyle: post.ctaStyle,
        }
      : null,
    internalLinkExamples: portraitLinks,
  };
}
