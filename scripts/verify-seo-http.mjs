import assert from "node:assert/strict";

// Exercise the served HTML and XML, not just metadata source objects.
const base = new URL(process.argv[2] ?? "http://localhost:3100");
const canonicalOrigin = "https://www.animecabinet.com";
async function get(path, redirect = "follow") {
  const response = await fetch(new URL(path, base), { redirect, signal: AbortSignal.timeout(30000) });
  return { response, body: await response.text() };
}
function tags(xml, name) {
  return [...xml.matchAll(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "g"))].map((match) => match[1]);
}
function canonical(html) {
  return html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
}

const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.response.status, 200);
const urls = tags(sitemap.body, "loc");
assert(urls.length > 0, "Sitemap must contain canonical pages");
assert.equal(new Set(urls).size, urls.length);
const expected = new Set(urls);
const feed = await get("/google-merchant-feed.xml");
assert.equal(feed.response.status, 200);
const items = tags(feed.body, "item");
assert(items.length > 0, "Merchant feed must contain purchasable prints");

const jobs = urls.map((url) => ({ path: new URL(url).pathname, canonical: url }));
for (const item of items) {
  const link = tags(item, "g:link")[0];
  const parent = tags(item, "g:canonical_link")[0];
  assert(expected.has(parent), `Merchant canonical is absent from sitemap: ${parent}`);
  assert(!expected.has(link), `Variant is duplicated in sitemap: ${link}`);
  jobs.push({ path: new URL(link).pathname, canonical: parent, price: tags(item, "g:price")[0].split(" ")[0] });
}

let index = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (index < jobs.length) {
    const job = jobs[index++];
    const { response, body } = await get(job.path);
    assert.equal(response.status, 200, `Page failed: ${job.path}`);
    assert.equal(canonical(body), job.canonical, `Wrong canonical on ${job.path}`);
    const title = body.match(/<title>(.*?)<\/title>/)?.[1];
    assert(title?.trim(), `Missing HTML title on ${job.path}`);
    assert(title.length <= 80, `Overlong HTML title on ${job.path}: ${title}`);
    assert((title.match(/Anime Cabinet/g) ?? []).length <= 1, `Repeated brand in title on ${job.path}`);
    assert(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(body), `Unexpected noindex: ${job.path}`);
    assert(!response.headers.get("x-robots-tag")?.includes("noindex"));
    assert.equal((body.match(/<h1\b/g) ?? []).length, 1, `Expected one H1 on ${job.path}`);
    if (job.price) {
      const schemas = [...body.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
      const product = schemas.find((schema) => schema["@type"] === "Product");
      assert.equal(product?.offers?.price, job.price, `Variant price mismatch on ${job.path}`);
      assert.equal(product?.offers?.url, canonicalOrigin + job.path, `Variant offer URL lost on ${job.path}`);
    }
  }
}));

const redirect = await get("/blog/best-gifts-for-custom-anime-style-fans", "manual");
assert.equal(redirect.response.status, 308);
assert.equal(new URL(redirect.response.headers.get("location"), base).pathname, "/blog/gift-for-anime-fan-who-has-everything");
for (const path of ["/portraits/berserk", "/blog/best-gifts-for-chainsaw-man-fans"]) {
  assert.equal((await get(path)).response.status, 404, `Retired content must not become a soft 404: ${path}`);
}
for (const path of ["/portraits/arcane", "/portraits/solo-leveling"]) {
  const { body } = await get(path);
  assert(body.includes("Plan your "), `Missing planning guide section: ${path}`);
  assert((body.match(/href="\/blog\//g) ?? []).length >= 3, `Missing crawlable related guides: ${path}`);
}
console.log(`HTTP SEO verification passed: ${urls.length} canonical pages, ${items.length} variant pages and prices, feed canonicals, related links, legacy redirect and intentional 404s.`);
