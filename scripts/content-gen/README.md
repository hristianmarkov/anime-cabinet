# Anime Cabinet Content-Gen

SEO content pipeline: **research → brief → draft → apply**. Does not deploy — writes JSON into `content-schema/generated/` for the site to merge at build time.

## Setup

1. Rebuild page registry:
   ```bash
   npx tsx scripts/build-content-schema.ts
   ```

2. Environment (`.env.local`):
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   DATASEO_PYTHON=C:\Users\Hrist\dataseo-mcp\.venv\Scripts\python.exe
   ```

3. DataSEO uses the same Python package as the Cursor dataseo MCP (`seo_mcp.services`). Ensure `~/.cursor/mcp.json` points at your dataseo venv, or set `DATASEO_PYTHON`.

## How research works

DataSEO searches **keywords**, not URLs. For `/portraits/rick-and-morty`:

1. **Primary keyword** stays product-specific: `custom rick and morty portrait` (from `styles-*.ts` keywords).
2. **SERP lookup** tries page seeds first; if Ahrefs has no data, tries style fallbacks like `rick and morty custom portrait`.
3. **Rival product pages** are matched from competitor sitemaps — e.g. Happy Tooned’s `/products/rick-and-morty-custom-portrait` — and scraped for headings/word count.

Product pages never fall back to generic `anime portrait` as the primary keyword (avoids cannibalization with blogs).

## Research fallbacks

When page-specific keywords have no Ahrefs SERP data:

1. **Style fallbacks** — `custom [style] portrait`, category terms (`custom cartoon portrait` / `custom anime portrait`).
2. **Known competitors** — sitemap match on `animeportraits.us`, `cartoonely.com`, `happytooned.com`, `cartoonizemeinto.com` (cached in `content-schema/cache/competitor-urls.json`).

## Commands

```bash
# Research only (DataSEO + competitors + brief)
npx tsx scripts/content-gen.ts research --url /portraits/one-piece-wanted-poster

# Draft + apply (requires brief; runs research if missing)
npx tsx scripts/content-gen.ts draft --url /blog/naruto-inspired-custom-poster

# Full pipeline (one page)
npx tsx scripts/content-gen.ts run --url /portraits/naruto
npx tsx scripts/content-gen.ts run /portraits/naruto   # positional URL also works

# Batch — must pass --all explicitly (never defaults to all pages)
npx tsx scripts/content-gen.ts run --all --parallel 3 --limit 5
npx tsx scripts/content-gen.ts run --layout blog-style-transform --parallel 2
npx tsx scripts/content-gen.ts run --priority P0
npx tsx scripts/content-gen.ts run --under-600 --limit 10
npx tsx scripts/content-gen.ts research --url /portraits/ghibli-style --refresh
```

## Output files

| Stage | Path |
|-------|------|
| Page registry | `content-schema/pages.json` |
| Brief | `content-schema/briefs/{slug}.json` |
| Draft | `content-schema/drafts/{slug}.json` |
| Applied (per page) | `content-schema/generated/styles/`, `blog/`, `pages/` |
| Site merge | `content-schema/generated/all-blog.json`, `all-styles.json` |

Cache (gitignored): `content-schema/cache/`

## Site integration

- [`src/data/generated/merge.ts`](../../src/data/generated/merge.ts) imports aggregate JSON and merges over TS fallbacks.
- [`src/data/blog.ts`](../../src/data/blog.ts) and [`getStyleBySlug`](../../src/data/styles.ts) use merged content automatically.

## Verification

```bash
npx tsx scripts/count-blog-words.ts
npm run build
```

Review generated copy before committing. Request GSC re-indexing after publishing.
