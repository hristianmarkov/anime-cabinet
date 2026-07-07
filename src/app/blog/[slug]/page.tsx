import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { blogPosts, getPostBySlug } from "@/data/blog";
import { site } from "@/data/site";
import { getStyleBySlug } from "@/data/styles";

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
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const ctaStyle = getStyleBySlug(post.ctaStyle);

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
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-faint">
          <Link href="/blog" className="hover:text-cream">
            ← Back to blog
          </Link>
        </nav>

        <header className="mt-6">
          <h1 className="font-display text-3xl leading-tight text-cream sm:text-4xl">
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

        <p className="mt-8 text-lg leading-relaxed text-muted">{post.intro}</p>

        {post.sections.map((section) => (
          <section key={section.heading ?? section.paragraphs[0].slice(0, 24)} className="mt-10">
            {section.heading && (
              <h2 className="text-xl font-semibold text-cream">{section.heading}</h2>
            )}
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="mt-4 leading-relaxed text-muted">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
                {section.list.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
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
