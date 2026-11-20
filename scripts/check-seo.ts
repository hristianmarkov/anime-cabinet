import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { blogPosts, getRelatedPosts } from "../src/data/blog";
import redirects from "../src/data/content-redirects.json";
import { getShowcase } from "../src/data/gallery";
import { allStyles } from "../src/data/styles";
import sitemap from "../src/app/sitemap";
import { MERCHANT_PRINT_FORMATS, merchantPrint } from "../src/data/merchantPrints";
import { buildGoogleMerchantFeed } from "../src/lib/googleMerchantFeed";
import { site } from "../src/data/site";

const entries = sitemap();
const urls = new Set(entries.map((entry) => entry.url));
const paths = new Set(entries.map((entry) => new URL(entry.url).pathname));
assert.equal(urls.size, entries.length, "Sitemap contains duplicate URLs");

for (const [source, destination] of Object.entries(redirects)) {
  assert(!paths.has(source), `Redirected URL remains in sitemap: ${source}`);
  assert(paths.has(destination), `Redirect destination is not a canonical page: ${destination}`);
  assert(!(destination in redirects), `Redirect chain from ${source}`);
}

const titles = new Set<string>();
const feed = buildGoogleMerchantFeed(allStyles);
const merchantItems = feed.match(/<item>[\s\S]*?<\/item>/g) ?? [];
assert.equal(merchantItems.length, allStyles.length * MERCHANT_PRINT_FORMATS.length,
  "Merchant feed must retain every purchasable print variant");
for (const style of allStyles) {
  const canonical = `${site.url}/portraits/${style.slug}`;
  assert(urls.has(canonical), `Product canonical missing from sitemap: ${canonical}`);
  for (const format of MERCHANT_PRINT_FORMATS) {
    const variant = merchantPrint(style, format);
    assert(variant.title.length <= 60, `Print title is too long: ${variant.sku}`);
    assert(!paths.has(variant.path), `Noncanonical print variant remains in sitemap: ${variant.path}`);
    const item = merchantItems.find((xml) => xml.includes(`<g:id>${variant.sku}</g:id>`));
    assert(item?.includes(`<g:link>${site.url}${variant.path}</g:link>`), `Missing variant landing URL: ${variant.sku}`);
    assert(item.includes(`<g:canonical_link>${canonical}</g:canonical_link>`), `Conflicting Merchant canonical: ${variant.sku}`);
    assert(item.includes(`<g:price>${format.priceUsd.toFixed(2)} USD</g:price>`), `Wrong variant price: ${variant.sku}`);
  }
  const guides = getRelatedPosts(style.slug);
  assert(guides.length > 0, `Product has no planning guides: ${style.slug}`);
  for (const guide of guides) assert(paths.has(`/blog/${guide.slug}`));
}

for (const page of [...allStyles, ...blogPosts]) {
  const title = "productName" in page ? page.metaTitle : page.metaTitle ?? page.title;
  assert(title.trim(), `Empty title: ${page.slug}`);
  assert(title.length <= 60, `Title is too long: ${page.slug}`);
  assert(!/[|\n\r]|\(20\d{2}\)/.test(title), `Title contains an extra suffix or year label: ${page.slug}`);
  if ("title" in page) assert(page.title.length <= 70, `Article heading is too long: ${page.slug}`);
  assert(!titles.has(title), `Duplicate title: ${title}`);
  titles.add(title);
  assert(!title.includes("Anime Cabinet"), `Brand suffix is duplicated by the layout: ${page.slug}`);
  const content = JSON.stringify(page);
  assert(!/\bAI\b|hand[- ]drawn|human[- ]drawn|gift codes?|Popular searches include/i.test(content),
    `Unsupported production claim or unrelated search copy: ${page.slug}`);
  for (const match of content.matchAll(/\]\((\/[^)]+)\)/g)) {
    assert(paths.has(match[1].split(/[?#]/)[0]), `Broken content link on ${page.slug}: ${match[1]}`);
  }
}

for (const post of blogPosts) {
  const related = getRelatedPosts(post.ctaStyle, post.slug);
  assert(!related.some((candidate) => candidate.slug === post.slug), `Article links to itself: ${post.slug}`);
  assert.equal(new Set(related.map((candidate) => candidate.slug)).size, related.length);
  assert(post.intro.trim(), `Empty introduction: ${post.slug}`);
  assert(post.sections.length, `Empty article: ${post.slug}`);
  const headings = post.sections.map((section) => section.heading?.trim()).filter(Boolean);
  assert.equal(new Set(headings).size, headings.length, `Repeated section headings: ${post.slug}`);
  for (const section of post.sections) {
    assert(section.paragraphs.some((text) => text.trim()) || section.list?.length || section.blocks?.length,
      `Empty section in ${post.slug}: ${section.heading}`);
    for (const block of section.blocks ?? []) {
      if (block.type === "productShowcase") assert(paths.has(`/portraits/${block.slug}`));
      if (block.type === "stylePills") {
        for (const slug of block.slugs) assert(paths.has(`/portraits/${slug}`));
      }
    }
  }
}

for (const style of allStyles) {
  assert(style.description.length >= 2 && style.faqs.length >= 2, `Incomplete product: ${style.slug}`);
  const showcase = getShowcase(style.slug);
  assert(showcase, `Missing product examples: ${style.slug}`);
  for (const src of [showcase.slider.before, showcase.slider.after, ...showcase.examples.map((item) => item.src)]) {
    if (src.startsWith("/")) assert(existsSync(`public${src}`), `Missing product image: ${src}`);
  }
}

console.log(`SEO checks passed: ${allStyles.length} products, ${blogPosts.length} articles, ${entries.length} sitemap URLs, ${Object.keys(redirects).length} direct redirects.`);
