"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { galleryItems } from "@/data/gallery";
import type { Review } from "@/data/reviews";

const Masonry = dynamic(() => import("@/components/Masonry"), { ssr: false });

interface CustomersSectionProps {
  reviews: Review[];
  showAllReviews?: boolean;
  showGalleryLink?: boolean;
}

export function CustomersSection({
  reviews,
  showAllReviews = true,
  showGalleryLink = true,
}: CustomersSectionProps) {
  const displayed = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <section id="gallery" className="border-t border-line bg-ink-soft scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">
            What Our Customers Say
          </h2>
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
          <Masonry
            items={galleryItems}
            animateFrom="bottom"
            blurToFocus
            scaleOnHover
            hoverScale={0.95}
          />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((r) => (
            <div
              key={`${r.title}-${r.date}`}
              className={r.image ? "md:col-span-2 lg:col-span-2" : undefined}
            >
              <ReviewCard review={r} />
            </div>
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
