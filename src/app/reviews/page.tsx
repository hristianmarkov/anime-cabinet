import type { Metadata } from "next";
import Link from "next/link";
import { CustomersSection } from "@/components/CustomersSection";
import { JsonLd } from "@/components/JsonLd";
import { REVIEWS_ARE_REAL, reviews } from "@/data/reviews";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description:
    "Read what customers say about their custom anime and cartoon portraits from Anime Cabinet — likeness, revisions, delivery and print quality.",
  alternates: { canonical: "/reviews" },
};

const aggregateRatingJsonLd =
  REVIEWS_ARE_REAL && reviews.length >= 5
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${site.name} Custom Portraits`,
        url: `${site.url}/reviews`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1),
          reviewCount: reviews.length,
        },
        review: reviews.slice(0, 10).map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          datePublished: r.date,
          reviewBody: r.body,
          name: r.title,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
          },
        })),
      }
    : null;

export default function ReviewsPage() {
  return (
    <>
      {aggregateRatingJsonLd && <JsonLd data={aggregateRatingJsonLd} />}

      <CustomersSection reviews={reviews} showGalleryLink={false} pageHeading />

      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6">
          <Link
            href="/portraits"
            className="inline-block rounded-full bg-accent px-10 py-4 text-base font-semibold text-white shadow-glow transition hover:bg-accent-bright"
          >
            Get Your Own Portrait
          </Link>
        </div>
      </section>
    </>
  );
}
