import fs from "node:fs";
import path from "node:path";
import { COMPETITORS_CACHE_DIR, ensureDir, readJson, writeJson, urlToSlug } from "./paths";
import type { CompetitorAnalysis } from "./types";

const SKIP_DOMAINS = [
  "youtube.com",
  "reddit.com",
  "instagram.com",
  "facebook.com",
  "amazon.com",
  "etsy.com",
  "pinterest.com",
  "canva.com",
  "reface.ai",
  "apps.apple.com",
  "play.google.com",
];

function shouldSkip(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SKIP_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return true;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const re = /<(h[23])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && headings.length < 20) {
    const text = stripHtml(m[2]);
    if (text.length > 2) headings.push(text);
  }
  return headings;
}

function classifyIntent(text: string, headings: string[]): CompetitorAnalysis["intent"] {
  const blob = `${text} ${headings.join(" ")}`.toLowerCase();
  if (/gift guide|best gifts|present ideas/.test(blob)) return "gift-guide";
  if (/how to|tutorial|step by step|guide/.test(blob)) return "how-to";
  if (/ vs |versus|comparison|compared/.test(blob)) return "comparison";
  if (/order|buy|custom portrait|commission|from your photo/.test(blob)) return "product";
  return "other";
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AnimeCabinetContentGen/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function analyzeCompetitor(url: string, refresh = false): Promise<CompetitorAnalysis | null> {
  if (shouldSkip(url)) return null;

  ensureDir(COMPETITORS_CACHE_DIR);
  const slug = urlToSlug(new URL(url).pathname || url);
  const cacheFile = path.join(COMPETITORS_CACHE_DIR, `${slug}.json`);

  if (!refresh) {
    const cached = readJson<CompetitorAnalysis>(cacheFile);
    if (cached) return cached;
  }

  const html = await fetchHtml(url);
  if (!html) return null;

  const text = stripHtml(html);
  const headings = extractHeadings(html);
  const words = text.split(/\s+/).filter(Boolean).length;

  const analysis: CompetitorAnalysis = {
    url,
    wordCount: words,
    headings,
    intent: classifyIntent(text, headings),
    excerpt: text.slice(0, 400),
  };

  writeJson(cacheFile, analysis);
  return analysis;
}

export async function analyzeSerpCompetitors(
  serp: Array<{ url: string }>,
  refresh = false,
  limit = 5
): Promise<CompetitorAnalysis[]> {
  const out: CompetitorAnalysis[] = [];
  for (const row of serp) {
    if (out.length >= limit) break;
    if (!row.url || shouldSkip(row.url)) continue;
    const a = await analyzeCompetitor(row.url, refresh);
    if (a) out.push(a);
  }
  return out;
}

export async function analyzeUrlList(
  urls: string[],
  refresh = false,
  limit = 5
): Promise<CompetitorAnalysis[]> {
  const out: CompetitorAnalysis[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    if (out.length >= limit) break;
    if (!url || seen.has(url) || shouldSkip(url)) continue;
    seen.add(url);
    const a = await analyzeCompetitor(url, refresh);
    if (a) out.push(a);
  }
  return out;
}
