import type { MetadataRoute } from "next";
import { artSrc } from "@/data/art";
import { blogPosts } from "@/data/blog";
import { styleShowcases } from "@/data/gallery";
import { site } from "@/data/site";
import { allStyles } from "@/data/styles";

function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${site.url}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/portraits`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/how-it-works`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/reviews`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${site.url}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/shipping`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/refund-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const stylePages: MetadataRoute.Sitemap = allStyles.map((s) => {
    const showcase = styleShowcases[s.slug];
    const images = showcase
      ? [
          absoluteUrl(showcase.slider.after),
          ...showcase.examples.map((e) => absoluteUrl(e.src)),
        ]
      : undefined;

    return {
      url: `${site.url}/portraits/${s.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(images && { images }),
    };
  });

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
    ...(p.heroImage && { images: [absoluteUrl(artSrc(p.heroImage))] }),
  }));

  return [...staticPages, ...stylePages, ...blogPages];
}
