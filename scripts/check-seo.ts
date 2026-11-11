import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { blogPosts } from "../src/data/blog";
import redirects from "../src/data/content-redirects.json";
import { getShowcase } from "../src/data/gallery";
import { allStyles } from "../src/data/styles";
import sitemap from "../src/app/sitemap";

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
for (const page of [...allStyles, ...blogPosts]) {
  const title = "productName" in page ? page.metaTitle : page.metaTitle ?? page.title;
  assert(title.trim(), `Empty title: ${page.slug}`);
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
  assert(post.intro.trim(), `Empty introduction: ${post.slug}`);
  assert(post.sections.length, `Empty article: ${post.slug}`);
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
