import { getStyleBySlug } from "../../src/data/styles";
import { getPostBySlug } from "../../src/data/blog";
import { styleBlogConfigs } from "../../src/data/blog-per-style-config";
import type { PageEntry } from "./types";

export function seedCandidatesForPage(page: PageEntry): string[] {
  const style = page.styleSlug ? getStyleBySlug(page.styleSlug) : undefined;
  const config = page.styleSlug
    ? styleBlogConfigs.find((c) => c.slug === page.styleSlug)
    : undefined;
  const post = page.url.startsWith("/blog/") ? getPostBySlug(page.slug) : undefined;

  switch (page.layout) {
    case "style-landing":
      return style?.keywords?.length ? [...style.keywords] : [`custom ${page.styleSlug} portrait`];

    case "blog-style-transform":
      return config
        ? [config.transformKeywords[0] ?? `${config.inspiredLabel} custom poster`, ...config.transformKeywords.slice(0, 3)]
        : [`${page.styleSlug} custom poster from photo`];

    case "blog-style-gift":
      return config
        ? [config.giftKeywords[0] ?? `${config.name} portrait gift`, ...config.giftKeywords.slice(0, 3)]
        : [`${page.styleSlug} portrait gift ideas`];

    case "blog-gift-guide":
      return post?.keywords?.length ? [...post.keywords] : [`best gifts for ${page.styleSlug} fans`];

    case "blog-comparison":
    case "blog-gift-intent":
    case "blog-before-after":
    case "blog-style-guide":
    case "blog-editorial":
      return post?.keywords?.length ? [...post.keywords] : [post?.title ?? page.slug.replace(/-/g, " ")];

    case "home":
      return [
        "custom anime portrait",
        "anime portrait from photo",
        "custom anime portrait from photo",
      ];

    case "static-page":
      if (page.slug === "portraits") {
        return ["custom anime portrait", "anime portrait styles"];
      }
      return [`anime cabinet ${page.slug.replace(/-/g, " ")}`];

    default:
      return [page.slug.replace(/-/g, " ")];
  }
}
