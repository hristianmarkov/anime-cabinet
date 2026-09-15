import { getLayout } from "../../content-schema/layouts";
import type { CompetitorAnalysis, ContentBrief, PageEntry } from "./types";
import type { KeywordResearch } from "./types";
import { getCannibalizationRules } from "./cannibalization";
import { sanitizeKeywords } from "./sanitize";
import { briefPath, writeJson } from "./paths";

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function buildBrief(
  page: PageEntry,
  research: KeywordResearch,
  competitors: CompetitorAnalysis[]
): ContentBrief {
  const layout = getLayout(page.layout);
  const competitorWords = competitors.map((c) => c.wordCount).filter((n) => n > 100);
  const medianWords = median(competitorWords);
  const target = clamp(Math.round(medianWords * 1.1) || layout.wordCount.target, layout.wordCount.min, layout.wordCount.max);

  const onPage = sanitizeKeywords(
    [research.seed, ...research.ideas.slice(0, 8).map((i) => i.keyword)],
    research.seed
  );

  const sendElsewhere = getCannibalizationRules(page).map((c) => c.url);

  const outline = competitors
    .flatMap((c) => c.headings)
    .filter((h, i, a) => a.indexOf(h) === i)
    .slice(0, 8);

  if (!outline.length) {
    outline.push("Introduction", "What makes this unique", "How to order", "FAQ");
  }

  const slots = layout.slots.map((name) => ({
    name,
    instruction: layout.slotInstructions[name] ?? `Write ${name}`,
  }));

  const brief: ContentBrief = {
    url: page.url,
    slug: page.slug,
    layout: page.layout,
    styleSlug: page.styleSlug,
    generatedAt: new Date().toISOString(),
    keywords: {
      primary: research.seed,
      onPage,
      sendElsewhere,
    },
    wordCount: { min: layout.wordCount.min, target, max: layout.wordCount.max },
    serp: research.difficulty,
    competitors,
    geoQueries: [],
    outline,
    slots,
    uniqueAngle:
      "Hand-drawn human artist (not AI filters). 24 anime & cartoon styles. Preview within 72 hours. Unlimited free revisions. Fan-art inspired style — customers as original characters, not copyrighted impersonation.",
    cannibalization: getCannibalizationRules(page),
  };

  writeJson(briefPath(page.slug), brief);
  return brief;
}

export async function attachGeoQueries(brief: ContentBrief): Promise<ContentBrief> {
  const { generateGeoQueries } = await import("./geo");
  brief.geoQueries = await generateGeoQueries(brief.keywords.primary, {
    seed: brief.keywords.primary,
    country: "us",
    ideas: brief.keywords.onPage.map((k) => ({ keyword: k })),
    difficulty: brief.serp,
  });
  writeJson(briefPath(brief.slug), brief);
  return brief;
}
