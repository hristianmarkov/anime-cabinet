import type { PortraitStyle } from "@/data/types";
import { getShowcase } from "@/data/gallery";
import { site } from "@/data/site";

const GOOGLE_NAMESPACE = "http://base.google.com/ns/1.0";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function element(name: string, value: string): string {
  return `      <${name}>${escapeXml(value)}</${name}>`;
}

/** Build a Google Merchant Center-compatible RSS 2.0 primary product feed. */
export function buildGoogleMerchantFeed(styles: PortraitStyle[]): string {
  const items = styles.map((style) => {
    const showcase = getShowcase(style.slug);
    const productUrl = `${site.url}/portraits/${style.slug}`;
    const imageUrl = showcase
      ? `${site.url}${showcase.slider.after}`
      : `${site.url}/opengraph-image`;

    return [
      "    <item>",
      element("g:id", `portrait-${style.slug}`),
      element("g:title", style.productName),
      element("g:description", style.metaDescription),
      element("g:link", productUrl),
      element("g:image_link", imageUrl),
      ...(showcase?.examples ?? []).map((example) =>
        element("g:additional_image_link", `${site.url}${example.src}`)
      ),
      element("g:availability", "in_stock"),
      element("g:condition", "new"),
      element("g:price", `${style.priceFrom.toFixed(2)} USD`),
      element("g:brand", site.name),
      element("g:identifier_exists", "no"),
      element("g:custom_product", "true"),
      element("g:product_type", `Arts & Entertainment > Custom ${style.category} portraits`),
      "    </item>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<rss xmlns:g="${GOOGLE_NAMESPACE}" version="2.0">`,
    "  <channel>",
    `    <title>${escapeXml(`${site.name} Product Feed`)}</title>`,
    `    <link>${escapeXml(site.url)}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
