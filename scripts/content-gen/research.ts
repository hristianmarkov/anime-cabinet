import { analyzeSerpCompetitors, analyzeUrlList } from "./competitors";
import { matchCompetitorUrls, serpFallbackKeywords } from "./competitor-sites";
import { researchPageKeywords } from "./dataseo";
import { buildBrief, attachGeoQueries } from "./brief";
import { seedCandidatesForPage } from "./seeds";
import { loadPage } from "./pages";
import { briefPath, readJson } from "./paths";
import type { ContentBrief, KeywordResearch } from "./types";

function fallbackResearch(seed: string, country: string): KeywordResearch {
  console.warn("  DataSEO unavailable — using seed-only fallback brief");
  return {
    seed,
    country,
    ideas: [{ keyword: seed }],
    difficulty: { keyword: seed, difficulty: 0, serp: [] },
  };
}

export async function research(url: string, options: { country?: string; refresh?: boolean } = {}): Promise<ContentBrief> {
  const page = loadPage(url);
  const seeds = seedCandidatesForPage(page);
  const country = options.country ?? "us";
  const refresh = options.refresh ?? false;

  console.log(`Researching ${url} with seeds: ${seeds.slice(0, 3).join(", ")}`);

  const primarySeed = seeds[0]!;
  let kwResearch: KeywordResearch;
  let serpVia: string | undefined;

  const serpFallbacks = serpFallbackKeywords(page, seeds);

  try {
    const result = await researchPageKeywords(seeds, serpFallbacks, country, refresh);
    kwResearch = result.research;
    serpVia = result.serpVia;
  } catch (err) {
    console.warn(`  DataSEO error: ${err instanceof Error ? err.message : err}`);
    kwResearch = fallbackResearch(primarySeed, country);
  }

  console.log(`  Primary keyword: "${primarySeed}"`);
  if (serpVia && serpVia !== primarySeed) {
    console.log(`  SERP data via: "${serpVia}" (${kwResearch.difficulty?.serp.length ?? 0} results)`);
  } else {
    console.log(`  SERP results: ${kwResearch.difficulty?.serp.length ?? 0}`);
  }

  let competitors = [];

  // Product pages: rival product URLs first (e.g. happytooned.com/.../rick-and-morty-custom-portrait)
  if (page.layout === "style-landing") {
    const rivalUrls = await matchCompetitorUrls(page, 5, refresh);
    if (rivalUrls.length) {
      console.log(`  Matched rival pages: ${rivalUrls.slice(0, 2).join(", ")}${rivalUrls.length > 2 ? "…" : ""}`);
    }
    competitors = await analyzeUrlList(rivalUrls, refresh, 5);
  }

  const serp = kwResearch.difficulty?.serp ?? [];
  if (competitors.length < 5) {
    const fromSerp = await analyzeSerpCompetitors(serp, refresh, 5 - competitors.length);
    competitors = [...competitors, ...fromSerp];
  }

  if (competitors.length < 3) {
    const extraUrls = await matchCompetitorUrls(page, 8, refresh);
    const extra = await analyzeUrlList(
      extraUrls.filter((u) => !competitors.some((c) => c.url === u)),
      refresh,
      5 - competitors.length
    );
    if (extra.length) {
      console.log(`  Competitor-site fallback: ${extra.length} extra page(s)`);
      competitors = [...competitors, ...extra];
    }
  }

  console.log(`  Analyzed ${competitors.length} competitor pages`);

  let brief = buildBrief(page, kwResearch, competitors);
  brief = await attachGeoQueries(brief);
  console.log(`  Brief written: ${briefPath(page.slug)}`);
  return brief;
}

export function loadBrief(slug: string): ContentBrief | null {
  return readJson<ContentBrief>(briefPath(slug));
}
