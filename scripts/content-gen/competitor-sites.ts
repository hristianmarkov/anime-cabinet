import fs from "node:fs";
import path from "node:path";
import { getStyleBySlug } from "../../src/data/styles";
import type { PageEntry } from "./types";
import { CACHE_DIR, ensureDir, readJson, writeJson } from "./paths";

/** Direct portrait-shop competitors (from SEO analysis). */
export const COMPETITOR_DOMAINS = [
  "animeportraits.us",
  "cartoonely.com",
  "happytooned.com",
  "cartoonizemeinto.com",
] as const;

const SITEMAP_ENTRYPOINTS: Record<string, string> = {
  "cartoonely.com": "https://cartoonely.com/server-sitemap.xml",
  "animeportraits.us": "https://www.animeportraits.us/sitemap.xml",
  "happytooned.com": "https://happytooned.com/sitemap.xml",
  "cartoonizemeinto.com": "https://cartoonizemeinto.com/sitemap.xml",
};

const STOP_TOKENS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "vs",
  "for",
  "from",
  "into",
  "with",
  "your",
  "photo",
  "custom",
  "inspired",
  "poster",
  "portrait",
  "portraits",
  "guide",
  "ideas",
  "gift",
  "best",
  "how",
  "to",
  "turn",
  "make",
  "generator",
  "blog",
  "anime",
  "cartoon",
  "style",
  "art",
  "artwork",
  "wanted",
]);

const CACHE_FILE = path.join(CACHE_DIR, "competitor-urls.json");

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]!);
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AnimeCabinetContentGen/1.0" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchSitemapUrls(entry: string): Promise<string[]> {
  const xml = await fetchText(entry);
  if (!xml) return [];

  const locs = extractLocs(xml);
  if (!/<sitemapindex/i.test(xml)) return locs;

  const nested = await Promise.all(locs.map((loc) => fetchSitemapUrls(loc)));
  return nested.flat();
}

export async function loadCompetitorUrlIndex(refresh = false): Promise<Record<string, string[]>> {
  ensureDir(CACHE_DIR);
  if (!refresh) {
    const cached = readJson<Record<string, string[]>>(CACHE_FILE);
    if (cached) return cached;
  }

  const index: Record<string, string[]> = {};
  for (const domain of COMPETITOR_DOMAINS) {
    const entry = SITEMAP_ENTRYPOINTS[domain];
    const urls = entry ? await fetchSitemapUrls(entry) : [];
    index[domain] = [...new Set(urls.filter((u) => u.includes(domain.replace("www.", ""))))];
  }

  writeJson(CACHE_FILE, index);
  return index;
}

function pageTokens(page: PageEntry): string[] {
  const tokens = new Set<string>();
  const parts = [page.styleSlug, page.slug, page.category].filter(Boolean).join("-");
  for (const token of parts.split(/[^a-z0-9]+/i)) {
    const t = token.toLowerCase();
    if (t.length > 2 && !STOP_TOKENS.has(t)) tokens.add(t);
  }
  if (page.styleSlug) tokens.add(page.styleSlug.toLowerCase());
  return [...tokens];
}

function scoreUrl(url: string, page: PageEntry, tokens: string[]): number {
  const hay = url.toLowerCase();
  let score = 0;

  if (page.styleSlug && hay.includes(page.styleSlug)) score += 12;
  for (const token of tokens) {
    if (hay.includes(token)) score += 3;
  }
  if (/\/products?\//.test(hay)) score += 6;
  if (/\/blog\//.test(hay) || /\/blogs\//.test(hay)) score += 2;
  try {
    if (new URL(hay).pathname === "/") score -= 4;
  } catch {
    /* ignore */
  }
  return score;
}

/** Pick rival product/blog pages that mirror this page (e.g. Happy Tooned Rick & Morty product URL). */
export async function matchCompetitorUrls(
  page: PageEntry,
  limit = 5,
  refresh = false
): Promise<string[]> {
  const tokens = pageTokens(page);
  const index = await loadCompetitorUrlIndex(refresh);
  const ranked: Array<{ url: string; score: number }> = [];

  for (const domain of COMPETITOR_DOMAINS) {
    for (const url of index[domain] ?? []) {
      const score = scoreUrl(url, page, tokens);
      if (score > 0) ranked.push({ url, score });
    }
  }

  ranked.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of ranked) {
    if (seen.has(row.url)) continue;
    seen.add(row.url);
    out.push(row.url);
    if (out.length >= limit) break;
  }
  return out;
}

/** Extra Ahrefs keyword tries when page seeds have no SERP — does NOT replace the page primary keyword. */
export function serpFallbackKeywords(page: PageEntry, pageSeeds: string[]): string[] {
  const style = page.styleSlug?.replace(/-/g, " ");
  const styleData = page.styleSlug ? getStyleBySlug(page.styleSlug) : undefined;
  const out: string[] = [];

  if (style) {
    out.push(
      `custom ${style} portrait`,
      `${style} custom portrait`,
      `${style} portrait from photo`
    );
    if (page.slug.includes("wanted-poster")) {
      out.push(`custom ${style} wanted poster`, `${style} wanted poster maker`);
    }
  }

  if (styleData?.category === "cartoon") {
    out.push("custom cartoon portrait", "personalized cartoon portrait");
  } else if (styleData?.category === "anime") {
    out.push("custom anime portrait");
  }

  switch (page.layout) {
    case "blog-style-transform":
      if (style) out.push(`turn photo into ${style} poster`, `${style} custom poster`);
      break;
    case "blog-style-gift":
      if (style) out.push(`${style} portrait gift`);
      out.push("anime portrait gift");
      break;
    case "blog-comparison":
      out.push("custom portrait vs ai", "anime portrait vs ai");
      break;
    case "blog-gift-guide":
    case "blog-gift-intent":
      out.push("anime portrait gift", "custom anime gift");
      break;
    case "style-landing":
      break;
    default:
      out.push("custom anime portrait", "anime portrait");
  }

  // Generic head terms only for non-product pages (avoid product/blog cannibalization)
  if (page.layout !== "style-landing") {
    out.push("anime portrait");
  }

  return [...new Set(out.map((s) => s.trim()).filter(Boolean))].filter((s) => !pageSeeds.includes(s));
}

/** @deprecated use serpFallbackKeywords */
export function broadKeywordFallbacks(page: PageEntry): string[] {
  return serpFallbackKeywords(page, []);
}
