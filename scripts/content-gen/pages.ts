import fs from "node:fs";
import { PAGES_JSON } from "./paths";
import type { LayoutId } from "../../content-schema/layouts";
import type { PageEntry, PagesRegistry, Priority } from "./types";
import { seedCandidatesForPage } from "./seeds";
import { getBlogWordCount } from "./word-count";

export function loadRegistry(): PagesRegistry {
  if (!fs.existsSync(PAGES_JSON)) {
    throw new Error(`Missing ${PAGES_JSON}. Run: npx tsx scripts/build-content-schema.ts`);
  }
  return JSON.parse(fs.readFileSync(PAGES_JSON, "utf8")) as PagesRegistry;
}

export function loadPage(url: string): PageEntry {
  const registry = loadRegistry();
  const page = registry.pages.find((p) => p.url === url);
  if (!page) {
    throw new Error(`URL not in pages.json: ${url}`);
  }
  return page;
}

export function listPages(filters: {
  layout?: LayoutId;
  priority?: Priority;
  under600?: boolean;
  all?: boolean;
  limit?: number;
}): PageEntry[] {
  const registry = loadRegistry();
  let pages = [...registry.pages];

  if (filters.layout) {
    pages = pages.filter((p) => p.layout === filters.layout);
  }
  if (filters.priority) {
    pages = pages.filter((p) => p.priority === filters.priority);
  }
  if (filters.under600) {
    pages = pages.filter((p) => p.url.startsWith("/blog/") && getBlogWordCount(p.slug) < 600);
  }

  pages.sort((a, b) => {
    const pri = { P0: 0, P1: 1, P2: 2 };
    return pri[a.priority] - pri[b.priority] || a.url.localeCompare(b.url);
  });

  if (filters.limit && filters.limit > 0) {
    pages = pages.slice(0, filters.limit);
  }

  return pages;
}

export { seedCandidatesForPage };
