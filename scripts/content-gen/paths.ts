import fs from "node:fs";
import path from "node:path";

export const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

export const SCHEMA_DIR = path.join(REPO_ROOT, "content-schema");
export const PAGES_JSON = path.join(SCHEMA_DIR, "pages.json");
export const BRIEFS_DIR = path.join(SCHEMA_DIR, "briefs");
export const DRAFTS_DIR = path.join(SCHEMA_DIR, "drafts");
export const GENERATED_DIR = path.join(SCHEMA_DIR, "generated");
export const CACHE_DIR = path.join(SCHEMA_DIR, "cache");
export const KEYWORDS_CACHE_DIR = path.join(CACHE_DIR, "keywords");
export const COMPETITORS_CACHE_DIR = path.join(CACHE_DIR, "competitors");

export function urlToSlug(url: string): string {
  const clean = url.replace(/\/+$/, "") || "/";
  if (clean === "/") return "home";
  return clean.split("/").filter(Boolean).join("-");
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function briefPath(slug: string): string {
  return path.join(BRIEFS_DIR, `${slug}.json`);
}

export function draftPath(slug: string): string {
  return path.join(DRAFTS_DIR, `${slug}.json`);
}

export function generatedStylePath(slug: string): string {
  return path.join(GENERATED_DIR, "styles", `${slug}.json`);
}

export function generatedBlogPath(slug: string): string {
  return path.join(GENERATED_DIR, "blog", `${slug}.json`);
}

export function generatedPagePath(slug: string): string {
  return path.join(GENERATED_DIR, "pages", `${slug}.json`);
}
