#!/usr/bin/env npx tsx
/** Re-apply keyword/description sanitization to existing generated style JSON. */
import fs from "node:fs";
import path from "node:path";
import { sanitizeDescriptionParagraphs, sanitizeFaqs, sanitizeKeywords } from "./content-gen/sanitize";
import { countStylePayload } from "./content-gen/word-count";
import { GENERATED_DIR } from "./content-gen/paths";

const stylesDir = path.join(GENERATED_DIR, "styles");
const aggPath = path.join(GENERATED_DIR, "all-styles.json");
const agg = JSON.parse(fs.readFileSync(aggPath, "utf8")) as Record<string, unknown>;

for (const file of fs.readdirSync(stylesDir).filter((f) => f.endsWith(".json"))) {
  const filePath = path.join(stylesDir, file);
  const entry = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    slug: string;
    description?: string[];
    faqs?: Array<{ q: string; a: string }>;
    keywords?: string[];
  };
  entry.description = sanitizeDescriptionParagraphs(entry.description ?? []);
  entry.faqs = sanitizeFaqs(entry.faqs ?? []);
  entry.keywords = sanitizeKeywords(entry.keywords ?? [], entry.keywords?.[0]);
  fs.writeFileSync(filePath, `${JSON.stringify(entry, null, 2)}\n`);
  agg[entry.slug] = entry;
  console.log(entry.slug.padEnd(28), countStylePayload(entry));
}

fs.writeFileSync(aggPath, `${JSON.stringify(agg, null, 2)}\n`);
console.log("\nSanitized all style pages.");
