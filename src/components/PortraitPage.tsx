import type { Metadata } from "next";
import Link from "next/link";
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
import { PriceFrom, PrintPrice } from "@/components/PriceFrom";
import { site } from "@/data/site";
import { allStyles } from "@/data/styles";
import { merchantPrint, MERCHANT_PRINT_FORMATS, type MerchantPrintFormat } from "@/data/merchantPrints";
import type { PortraitStyle } from "@/data/types";

export function portraitMetadata(style: PortraitStyle, format?: MerchantPrintFormat): Metadata {
  const print = format ? merchantPrint(style, format) : undefined;
  const title = print?.title ?? style.metaTitle;
  const description = print
    ? `${print.title}, personalized from your photo. Includes your digital artwork and free standard delivery.`
    : style.metaDescription;
  const canonical = print?.path ?? `/portraits/${style.slug}`;
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
    title,
    description,
    keywords: style.keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${site.url}${canonical}`,
      type: "website",
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: "summary_large_image",
      ...(ogImage && { images: [ogImage.url] }),
    },
  };
}

export function PortraitPage({ style, format }: { style: PortraitStyle; format?: MerchantPrintFormat }) {
  const print = format ? merchantPrint(style, format) : undefined;
  const productUrl = `${site.url}${print?.path ?? `/portraits/${style.slug}`}`;

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
    name: print?.title ?? style.productName,
    description: print?.description ?? style.metaDescription,
    brand: { "@type": "Brand", name: site.name },
    url: productUrl,
    ...(print && format && {
      sku: print.sku,
      size: format.sizeLabel,
      material: format.material,
      inProductGroupWithID: print.groupId,
      isVariantOf: {
        "@type": "ProductGroup",
        productGroupID: print.groupId,
        name: `${style.productName} – ${format.label}`,
        variesBy: ["https://schema.org/size"],
        hasVariant: MERCHANT_PRINT_FORMATS
          .filter((other) => other.kind === format.kind && other.id !== format.id)
          .map((other) => ({ "@type": "Product", url: `${site.url}${merchantPrint(style, other).path}` })),
      },
    }),
    ...(showcase && { image: `${site.url}${showcase.slider.after}` }),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (format?.priceUsd ?? style.priceFrom).toFixed(2),
      availability: "https://schema.org/InStock",
      url: productUrl,
      ...(print && {
        itemCondition: "https://schema.org/NewCondition",
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
        },
      }),
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
      ...(print ? [{ "@type": "ListItem", position: 4, name: print.title, item: productUrl }] : []),
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
          <li className="text-muted">
            {print ? <Link href={`/portraits/${style.slug}`} className="hover:text-cream">{style.productName}</Link> : style.productName}
          </li>
          {format && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-muted">{format.label}, {format.sizeLabel}</li>
            </>
          )}
        </ol>
      </nav>

      {/* Hero + configurator */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
        <div>
          <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl">
            {print?.title ?? style.heroHeading}
          </h1>
          {!print && <p className="mt-2 text-lg text-muted">{style.productName}</p>}
          <ProductStyleHero style={style} print={format && print ? { formatId: format.id, description: print.description } : undefined} />
          {print && showcase && (
            <details className="mt-6 rounded-xl border border-line px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-cream">Watch the portrait transformation</summary>
              <video
                className="mt-3 aspect-square w-full max-w-sm rounded-lg bg-ink"
                src={print.videoPath}
                poster={showcase.slider.after}
                preload="none"
                controls
                muted
                playsInline
                aria-label={`Before-and-after artwork preview for ${style.productName}`}
              />
            </details>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderConfigurator style={style} initialPrint={format} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t border-line px-4 py-10 sm:px-6">
        <h2 className="font-display text-3xl text-cream">Print formats and sizes</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {MERCHANT_PRINT_FORMATS.map((option) => {
            const variant = merchantPrint(style, option);
            return (
              <li key={option.id}>
                <Link
                  href={variant.path}
                  aria-current={format?.id === option.id ? "page" : undefined}
                  className="flex justify-between gap-2 rounded-lg border border-line px-3 py-2 text-muted hover:border-accent hover:text-cream"
                >
                  <span>{option.label} · {option.sizeLabel}</span>
                  <span className="shrink-0 font-semibold text-cream"><PrintPrice formatId={option.id} /></span>
                </Link>
              </li>
            );
          })}
        </ul>
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
            <dd className="mt-2 text-muted">{format ? (
              <>One character, a digital file, and the {format.sizeLabel} {format.label.toLowerCase()} for <PrintPrice formatId={format.id} /> with free standard delivery.</>
            ) : (
              <>One character and a digital file from <PriceFrom usd={style.priceFrom} prefix="" />. Add a poster, canvas or framed print with free standard delivery.</>
            )} Additional people or pets cost <PriceFrom usd={EXTRA_CHARACTER_PRICE} prefix="" /> each. Your total appears before payment.</dd>
          </div>
          <div>
            <dt className="font-semibold text-cream">Preview and revisions</dt>
            <dd className="mt-2 text-muted">Preview within {site.deliveryHours} hours, with unlimited revisions before approval. Priority {site.expeditedHours}-hour preview costs an extra <PriceFrom usd={EXPEDITED_PRICE} prefix="" />. This is preview timing; print delivery takes longer.</dd>
          </div>
          <div>
            <dt className="font-semibold text-cream">Final artwork</dt>
            <dd className="mt-2 text-muted">A high-resolution digital file after approval. Optional posters, canvases and framed prints are produced after approval and include free standard delivery. See <Link href="/shipping" className="text-accent underline">shipping details</Link> and our <Link href="/refund-policy" className="text-accent underline">refund policy</Link>.</dd>
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
