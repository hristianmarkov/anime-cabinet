import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductStyleHero } from "@/components/ProductStyleHero";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { OrderConfigurator } from "@/components/OrderConfigurator";
import { ReviewCard } from "@/components/ReviewCard";
import { StyleCard } from "@/components/StyleCard";
import { getGiftGuideForStyle } from "@/data/blog";
import { globalFaqs } from "@/data/faqs";
import { getShowcase } from "@/data/gallery";
import { REVIEWS_ARE_REAL, reviews } from "@/data/reviews";
import { site } from "@/data/site";
import { allStyles, getStyleBySlug } from "@/data/styles";

interface Props {
  params: Promise<{ style: string }>;
}

export function generateStaticParams() {
  return allStyles.map((s) => ({ style: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { style: slug } = await params;
  const style = getStyleBySlug(slug);
  if (!style) return {};
  const showcase = getShowcase(style.slug);
  const ogImage = showcase
    ? {
        url: `${site.url}${showcase.slider.after}`,
        width: 800,
        height: 1000,
        alt: showcase.slider.afterAlt,
      }
    : undefined;
  return {
    title: style.metaTitle,
    description: style.metaDescription,
    keywords: style.keywords,
    alternates: { canonical: `/portraits/${style.slug}` },
    openGraph: {
      title: style.metaTitle,
      description: style.metaDescription,
      url: `${site.url}/portraits/${style.slug}`,
      type: "website",
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: "summary_large_image",
      ...(ogImage && { images: [ogImage.url] }),
    },
  };
}

export default async function StylePage({ params }: Props) {
  const { style: slug } = await params;
  const style = getStyleBySlug(slug);
  if (!style) notFound();

  const pageFaqs = [...style.faqs, ...globalFaqs.slice(0, 4)];
  const styleReviews = reviews.filter((r) => r.style === style.name).slice(0, 3);
  const shownReviews = styleReviews.length > 0 ? styleReviews : reviews.slice(0, 3);
  const related = allStyles
    .filter((s) => s.slug !== style.slug && s.category === style.category)
    .slice(0, 4);
  const giftGuide = getGiftGuideForStyle(style.slug);
  const showcase = getShowcase(style.slug);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: style.productName,
    description: style.metaDescription,
    brand: { "@type": "Brand", name: site.name },
    url: `${site.url}/portraits/${style.slug}`,
    ...(showcase && { image: `${site.url}${showcase.slider.after}` }),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: style.priceFrom.toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${site.url}/portraits/${style.slug}`,
    },
    // Star ratings intentionally omitted from structured data until
    // REVIEWS_ARE_REAL is true (see src/data/reviews.ts).
    ...(REVIEWS_ARE_REAL && reviews.length >= 5
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pageFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "All Styles", item: `${site.url}/portraits` },
      {
        "@type": "ListItem",
        position: 3,
        name: style.productName,
        item: `${site.url}/portraits/${style.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-faint">
          <li>
            <Link href="/" className="hover:text-cream">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/portraits" className="hover:text-cream">All Styles</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-muted">{style.productName}</li>
        </ol>
      </nav>

      {/* Hero + configurator */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
        <div>
          <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl">
            {style.heroHeading}
          </h1>
          <p className="mt-2 text-lg text-muted">{style.productName}</p>
          <ProductStyleHero style={style} />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderConfigurator style={style} />
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-cream">Customer Reviews</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shownReviews.map((r) => (
              <div
                key={r.title}
                className={r.image ? "md:col-span-2 lg:col-span-2" : undefined}
              >
                <ReviewCard review={r} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-center text-3xl text-cream">
          {style.name} Portrait FAQs
        </h2>
        {giftGuide && (
          <p className="mt-4 text-center text-sm text-muted">
            Shopping for a fan?{" "}
            <Link href={`/blog/${giftGuide.slug}`} className="text-accent hover:text-accent-bright">
              Read our {style.name} gift guide
            </Link>
          </p>
        )}
        <div className="mt-8">
          <FaqAccordion faqs={pageFaqs} />
        </div>
      </section>

      {/* Related styles */}
      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-cream">
            You Might Also Like
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((s) => (
              <StyleCard key={s.slug} style={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
