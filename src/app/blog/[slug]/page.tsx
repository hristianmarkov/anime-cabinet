import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogSectionContent } from "@/components/BlogContent";
import { JsonLd } from "@/components/JsonLd";
import { blogPosts, getPostBySlug, type BlogCategory } from "@/data/blog";
import { resolveBlockImage } from "@/data/blog-blocks";
import { site } from "@/data/site";
import { getStyleBySlug } from "@/data/styles";

const categoryLabels: Record<BlogCategory, string> = {
  gift: "Gift guide",
  style: "Style guide",
  transformation: "Before & after",
  comparison: "Comparison",
  editorial: "Editorial",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const hero = post.heroImage ? resolveBlockImage(post.heroImage) : null;
  const ogImage = hero
    ? { url: `${site.url}${hero.src}`, width: 1200, height: 514, alt: hero.alt }
    : undefined;
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: "summary_large_image",
      ...(ogImage && { images: [ogImage.url] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const ctaStyle = getStyleBySlug(post.ctaStyle);
  const hero = post.heroImage ? resolveBlockImage(post.heroImage) : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/logo.png` },
    },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    ...(hero && { image: `${site.url}${hero.src}` }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${site.url}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-faint">
          <Link href="/blog" className="hover:text-cream">
            ← Back to blog
          </Link>
        </nav>

        <header className="mt-6">
          {post.category && (
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {categoryLabels[post.category]}
            </p>
          )}
          <h1 className="font-display text-3xl leading-tight text-cream sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-faint">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {post.readingMinutes} min read · By the {site.name} team
          </p>
        </header>

        {post.heroImage && (
          <figure className="mt-8">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-line shadow-card">
              <Image
                src={resolveBlockImage(post.heroImage).src}
                alt={resolveBlockImage(post.heroImage).alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          </figure>
        )}

        <p className="mt-8 text-lg leading-[1.85] text-muted">{post.intro}</p>

        {post.sections.map((section) => (
          <BlogSectionContent key={section.heading ?? section.paragraphs[0]?.slice(0, 24) ?? section.blocks?.[0]?.type} section={section} />
        ))}

        {ctaStyle && (
          <aside className="mt-14 rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
            <h2 className="font-display text-2xl text-cream">
              Ready to see yourself <span className="text-gradient">animated?</span>
            </h2>
            <p className="mt-2 text-sm text-muted">
              Professional artists · Unlimited revisions · Preview in{" "}
              {site.deliveryHours} hours
            </p>
            <Link
              href={`/portraits/${ctaStyle.slug}`}
              className="mt-6 inline-block rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-glow transition hover:bg-accent-bright"
            >
              {post.ctaLabel}
            </Link>
          </aside>
        )}
      </article>
    </>
  );
}
