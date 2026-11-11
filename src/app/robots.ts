import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Keep Google's specific group aligned with the wildcard group: crawlers
      // use their most specific group instead of inheriting wildcard rules.
      {
        userAgent: ["AdsBot-Google", "Googlebot", "Googlebot-Image"],
        allow: "/",
        disallow: ["/admin", "/api/", "/order/"],
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
