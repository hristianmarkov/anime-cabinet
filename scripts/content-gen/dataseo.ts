import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { resolveDataseoRuntime } from "./env";
import { KEYWORDS_CACHE_DIR, ensureDir, readJson, writeJson } from "./paths";
import type { KeywordResearch } from "./types";

function bridgeCall(action: string, args: Record<string, unknown>): unknown {
  const { python, env: dataseoEnv } = resolveDataseoRuntime();
  const bridge = path.join(import.meta.dirname, "dataseo_bridge.py");
  const result = spawnSync(
    python,
    [bridge, action, JSON.stringify(args)],
    {
      encoding: "utf8",
      env: {
        ...dataseoEnv,
        PYTHONPATH: process.env.DATASEO_PYTHONPATH ?? path.join(os.homedir(), "dataseo-mcp", "src"),
      },
    }
  );

  if (result.error) throw result.error;
  const stdout = result.stdout?.trim() || "{}";
  const parsed = JSON.parse(stdout) as { ok?: boolean; data?: unknown; error?: string };
  if (parsed.error) throw new Error(parsed.error);
  if (result.status !== 0) {
    throw new Error(result.stderr || stdout || "dataseo bridge failed");
  }
  return parsed.data;
}

function cacheKey(seed: string, country: string): string {
  return path.join(KEYWORDS_CACHE_DIR, `${seed.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${country}.json`);
}

export async function researchKeyword(
  seed: string,
  country = "us",
  refresh = false
): Promise<KeywordResearch> {
  ensureDir(KEYWORDS_CACHE_DIR);
  const cacheFile = cacheKey(seed, country);
  if (!refresh) {
    const cached = readJson<KeywordResearch>(cacheFile);
    if (cached) return cached;
  }

  const ideasRaw = bridgeCall("keyword_generator", { keyword: seed, country }) as Array<{
    label?: string;
    value?: { keyword: string; difficulty?: number; volume?: number };
  }>;

  type IdeaRow = { keyword: string; difficulty?: number; volume?: number };
  const ideas: IdeaRow[] = (ideasRaw ?? [])
    .map((row) => {
      if (row && typeof row === "object" && "value" in row && row.value) return row.value as IdeaRow;
      return row as IdeaRow;
    })
    .filter((v): v is IdeaRow => Boolean(v && typeof v.keyword === "string"))
    .map((v) => ({
      keyword: v.keyword,
      difficulty: v.difficulty,
      volume: v.volume,
    }));

  const difficultyRaw = bridgeCall("keyword_difficulty", { keyword: seed, country }) as {
    difficulty?: number;
    serp?: { results?: Array<Record<string, unknown>> };
  } | null;

  const serpResults = difficultyRaw?.serp?.results ?? [];
  const research: KeywordResearch = {
    seed,
    country,
    ideas,
    difficulty: difficultyRaw
      ? {
          keyword: seed,
          difficulty: difficultyRaw.difficulty ?? 0,
          serp: serpResults.map((r) => ({
            title: String(r.title ?? ""),
            url: String(r.url ?? ""),
            position: Number(r.position ?? 0),
            domainRating: r.domainRating != null ? Number(r.domainRating) : undefined,
            traffic: r.traffic != null ? Number(r.traffic) : undefined,
          })),
        }
      : null,
  };

  writeJson(cacheFile, research);
  return research;
}

function dedupeIdeas(ideas: KeywordResearch["ideas"]): KeywordResearch["ideas"] {
  const seen = new Set<string>();
  return ideas.filter((i) => {
    const key = i.keyword.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Research keywords for a page.
 * - `primary` keyword always stays page-specific (first page seed).
 * - SERP/ideas are merged from page seeds, then serp-only fallbacks if needed.
 */
export async function researchPageKeywords(
  pageSeeds: string[],
  serpFallbackSeeds: string[],
  country = "us",
  refresh = false
): Promise<{ primary: string; research: KeywordResearch; serpVia?: string }> {
  if (!pageSeeds.length) throw new Error("No page seeds provided");

  const primary = pageSeeds[0]!;
  let ideas: KeywordResearch["ideas"] = [];
  let serp: NonNullable<KeywordResearch["difficulty"]>["serp"] = [];
  let difficulty = 0;
  let serpVia: string | undefined;

  for (const seed of pageSeeds) {
    const result = await researchKeyword(seed, country, refresh);
    ideas.push(...result.ideas);
    if (!serp.length && result.difficulty?.serp.length) {
      serp = result.difficulty.serp;
      difficulty = result.difficulty.difficulty;
      serpVia = seed;
    }
  }

  if (!serp.length) {
    for (const seed of serpFallbackSeeds) {
      const result = await researchKeyword(seed, country, refresh);
      ideas.push(...result.ideas);
      if (result.difficulty?.serp.length) {
        serp = result.difficulty.serp;
        difficulty = result.difficulty.difficulty;
        serpVia = seed;
        break;
      }
    }
  }

  const research: KeywordResearch = {
    seed: primary,
    country,
    ideas: dedupeIdeas(ideas),
    difficulty: { keyword: primary, difficulty, serp },
  };

  return { primary, research, serpVia };
}
