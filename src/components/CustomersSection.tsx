"use client";

import Link from "next/link";
import { AnimatedGallery } from "@/components/AnimatedGallery";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { galleryItems } from "@/data/gallery";
import type { Review } from "@/data/reviews";

interface CustomersSectionProps {
  reviews: Review[];
  showAllReviews?: boolean;
  showGalleryLink?: boolean;
  /** Use as the main page hero (e.g. /reviews) — h1 and no top border */
  pageHeading?: boolean;
}

export function CustomersSection({
  reviews,
  showAllReviews = true,
  showGalleryLink = true,
  pageHeading = false,
}: CustomersSectionProps) {
  const displayed = showAllReviews ? reviews : reviews.slice(0, 3);
  const Heading = pageHeading ? "h1" : "h2";
  const headingClass = pageHeading
    ? "font-display text-4xl text-cream sm:text-5xl"
    : "font-display text-3xl text-cream sm:text-4xl";

  return (
    <section
      id="gallery"
      className={`bg-ink-soft scroll-mt-24 ${pageHeading ? "" : "border-t border-line"}`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 ${
          pageHeading ? "pt-12 pb-16 lg:pb-20" : "py-16 lg:py-20"
        }`}
      >
        <div className="mx-auto max-w-3xl text-center">
          <Heading className={headingClass}>
            {pageHeading ? (
              <>
                What Our Customers <span className="text-gradient">Say</span>
              </>
            ) : (
              "What Our Customers Say"
            )}
          </Heading>
          <div className="mt-4 flex justify-center">
            <StarRating size="lg" />
          </div>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Thousands of fans trust us to turn their photos into portraits they&apos;re proud to
            hang, share, and gift. Every order comes with unlimited free revisions — because your
            happiness is the only metric that matters.
          </p>
        </div>

        <div className="mt-12">
          <AnimatedGallery items={galleryItems} />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((r) => (
            <ReviewCard key={`${r.title}-${r.date}`} review={r} />
          ))}
        </div>

        {showGalleryLink && (
          <p className="mt-10 text-center">
            <Link href="/portraits" className="text-sm font-semibold text-accent hover:text-accent-bright">
              Browse all styles →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
