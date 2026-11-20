import type { PortraitStyle } from "@/data/types";
import { getShowcase } from "@/data/gallery";
import { merchantPrint, MERCHANT_PRINT_FORMATS } from "@/data/merchantPrints";
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
  const items = styles.flatMap((style) => {
    const showcase = getShowcase(style.slug);
    if (!showcase) throw new Error(`Missing Merchant images for ${style.slug}`);

    return MERCHANT_PRINT_FORMATS.map((format) => {
      const product = merchantPrint(style, format);
      return [
        "    <item>",
        element("g:id", product.sku),
        element("g:item_group_id", product.groupId),
        element("g:title", product.title),
        "      <g:structured_description>",
        element("g:digital_source_type", "trained_algorithmic_media"),
        element("g:content", product.description),
        "      </g:structured_description>",
        element("g:link", `${site.url}${product.path}`),
        element("g:canonical_link", `${site.url}/portraits/${style.slug}`),
        element("g:image_link", `${site.url}${showcase.slider.after}`),
        ...showcase.examples.map((example) =>
          element("g:additional_image_link", `${site.url}${example.src}`)
        ),
        element("g:video_link", `${site.url}${product.videoPath}`),
        element("g:availability", "in_stock"),
        element("g:condition", "new"),
        element("g:price", `${format.priceUsd.toFixed(2)} USD`),
        element("g:brand", site.name),
        element("g:identifier_exists", "no"),
        element("g:custom_product", "true"),
        element("g:size", format.sizeLabel),
        element("g:material", format.material),
        element("g:product_type", `Arts & Entertainment > Custom Portraits > ${format.label}`),
        element("g:google_product_category", "500044"),
        "      <g:shipping>",
        element("g:country", "US"),
        element("g:service", "Standard"),
        element("g:price", "0.00 USD"),
        "      </g:shipping>",
        "    </item>",
      ].join("\n");
    });
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
