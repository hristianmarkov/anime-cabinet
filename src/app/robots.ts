import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Merchant Center uses AdsBot to validate product landing pages. Keep an
      // explicit rule in addition to the wildcard so this remains crawlable if
      // the general rules below are tightened in the future.
      {
        userAgent: ["AdsBot-Google", "Googlebot", "Googlebot-Image"],
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/order/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
