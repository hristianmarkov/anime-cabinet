#!/usr/bin/env npx tsx
/**
 * Anime Cabinet SEO content-gen CLI
 *
 * Usage:
 *   npx tsx scripts/content-gen.ts research --url /portraits/naruto
 *   npx tsx scripts/content-gen.ts draft --url /blog/naruto-inspired-custom-poster
 *   npx tsx scripts/content-gen.ts run --url /portraits/one-piece-wanted-poster
 *   npx tsx scripts/content-gen.ts run --all --parallel 3 --limit 5
 *   npx tsx scripts/content-gen.ts run --layout blog-style-transform --priority P0
 */
import type { LayoutId } from "../content-schema/layouts";
import type { Priority } from "./content-gen/types";
import { loadEnvLocal } from "./content-gen/env";
import { applyDraft } from "./content-gen/apply";
import { writeDraft } from "./content-gen/draft";
import { listPages, loadPage } from "./content-gen/pages";
import { research, loadBrief } from "./content-gen/research";

interface CliOptions {
  command: "research" | "draft" | "run";
  url?: string;
  layout?: LayoutId;
  priority?: Priority;
  all?: boolean;
  under600?: boolean;
  parallel: number;
  limit?: number;
  refresh: boolean;
  country: string;
}

function parseArgs(argv: string[]): CliOptions {
  const [, , commandRaw, ...rest] = argv;
  const command = (commandRaw ?? "run") as CliOptions["command"];
  const opts: CliOptions = {
    command,
    parallel: 1,
    refresh: false,
    country: "us",
  };

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--url" && rest[i + 1]) opts.url = rest[++i];
    else if (arg.startsWith("/") && !opts.url) opts.url = arg;
    else if (arg === "--layout" && rest[i + 1]) opts.layout = rest[++i] as LayoutId;
    else if (arg === "--priority" && rest[i + 1]) opts.priority = rest[++i] as Priority;
    else if (arg === "--parallel" && rest[i + 1]) opts.parallel = Number(rest[++i]) || 1;
    else if (arg === "--limit" && rest[i + 1]) opts.limit = Number(rest[++i]) || undefined;
    else if (arg === "--country" && rest[i + 1]) opts.country = rest[++i];
    else if (arg === "--refresh") opts.refresh = true;
    else if (arg === "--all") opts.all = true;
    else if (arg === "--under-600") opts.under600 = true;
  }

  return opts;
}

async function processUrl(url: string, opts: CliOptions): Promise<void> {
  const page = loadPage(url);
  console.log(`\n=== ${opts.command.toUpperCase()} ${url} (${page.layout}) ===`);

  if (opts.command === "research" || opts.command === "run") {
    await research(url, { country: opts.country, refresh: opts.refresh });
  }

  if (opts.command === "draft" || opts.command === "run") {
    let brief = loadBrief(page.slug);
    if (!brief) {
      brief = await research(url, { country: opts.country, refresh: opts.refresh });
    }
    let draft = await writeDraft(url, brief);
    let result = applyDraft(brief, draft);
    if (brief.layout === "style-landing" && result.words < 350) {
      console.warn(`  Re-drafting ${url} — only ${result.words} words (min 350)`);
      draft = await writeDraft(url, brief, { retryThin: true });
      result = applyDraft(brief, draft);
    }
    console.log(`  Applied → ${result.path} (${result.words} words)`);
  }
}

async function runPool(urls: string[], opts: CliOptions): Promise<void> {
  const queue = [...urls];
  const workers = Array.from({ length: opts.parallel }, async () => {
    while (queue.length) {
      const url = queue.shift();
      if (!url) break;
      try {
        await processUrl(url, opts);
      } catch (err) {
        console.error(`Failed ${url}:`, err instanceof Error ? err.message : err);
      }
    }
  });
  await Promise.all(workers);
}

async function main(): Promise<void> {
  loadEnvLocal();
  const opts = parseArgs(process.argv);

  if (!["research", "draft", "run"].includes(opts.command)) {
    console.error("Command must be: research | draft | run");
    process.exit(1);
  }

  let pages;
  if (opts.url) {
    pages = [loadPage(opts.url)];
  } else if (opts.all || opts.layout || opts.priority || opts.under600) {
    pages = listPages({
      layout: opts.layout,
      priority: opts.priority,
      under600: opts.under600,
      all: opts.all ?? true,
      limit: opts.limit,
    });
  } else {
    console.error(
      "No pages selected. Use one of:\n" +
        "  --url /portraits/naruto\n" +
        "  run /portraits/naruto          (positional URL)\n" +
        "  --all                          (all 138 pages)\n" +
        "  --layout style-landing --priority P0\n" +
        "  --under-600 --limit 10"
    );
    process.exit(1);
  }

  if (!pages.length) {
    console.error("No pages matched. Run: npx tsx scripts/build-content-schema.ts");
    process.exit(1);
  }

  console.log(`Processing ${pages.length} page(s)...`);
  await runPool(
    pages.map((p) => p.url),
    opts
  );
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
