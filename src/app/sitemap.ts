import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { allStyles } from "@/data/styles";
import { blogPosts } from "@/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/portraits`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/reviews`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${site.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const stylePages: MetadataRoute.Sitemap = allStyles.map((s) => ({
    url: `${site.url}/portraits/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...stylePages, ...blogPages];
}
