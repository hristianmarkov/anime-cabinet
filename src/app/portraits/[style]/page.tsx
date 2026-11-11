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
import { reviews } from "@/data/reviews";
import { EXTRA_CHARACTER_PRICE, MAX_CHARACTERS, EXPEDITED_PRICE } from "@/data/pricing";
import { PriceFrom } from "@/components/PriceFrom";
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
  const shownReviews = reviews.filter((r) => r.style === style.name).slice(0, 3);
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
    // Store-wide ratings are not ratings for this specific product. Add product
    // ratings only when their provenance and per-product totals are verified.
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

      <section className="mx-auto max-w-7xl border-t border-line px-4 py-12 sm:px-6">
        <h2 className="font-display text-3xl text-cream">What your portrait includes</h2>
        <dl className="mt-6 grid gap-6 text-sm leading-relaxed sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-semibold text-cream">Personalisation</dt>
            <dd className="mt-2 text-muted">Your photos, chosen outfits, pose and background. Order up to {MAX_CHARACTERS} people or pets; for larger groups, <Link href="/contact" className="text-accent underline">contact us</Link>.</dd>
          </div>
          <div>
            <dt className="font-semibold text-cream">Price and options</dt>
            <dd className="mt-2 text-muted">One character and a digital file from <PriceFrom usd={style.priceFrom} prefix="" />. Additional people or pets cost <PriceFrom usd={EXTRA_CHARACTER_PRICE} prefix="" /> each. Prints and shipping cost extra; your total appears before payment.</dd>
          </div>
          <div>
            <dt className="font-semibold text-cream">Preview and revisions</dt>
            <dd className="mt-2 text-muted">Preview within {site.deliveryHours} hours, with unlimited revisions before approval. Priority {site.expeditedHours}-hour preview costs an extra <PriceFrom usd={EXPEDITED_PRICE} prefix="" />. This is preview timing; print delivery takes longer.</dd>
          </div>
          <div>
            <dt className="font-semibold text-cream">Final artwork</dt>
            <dd className="mt-2 text-muted">A high-resolution digital file after approval. Optional posters, canvases and framed prints are produced after you approve. See <Link href="/shipping" className="text-accent underline">shipping details</Link> and our <Link href="/refund-policy" className="text-accent underline">refund policy</Link>.</dd>
          </div>
        </dl>
      </section>

      {/* Reviews for this style only */}
      {shownReviews.length > 0 && (
      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl text-cream">Customer Reviews</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shownReviews.map((r) => (
              <ReviewCard key={r.title} review={r} />
            ))}
          </div>
        </div>
      </section>
      )}

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
