import Image from "next/image";
import type { Review } from "@/data/reviews";
import { artAlt } from "@/data/art";
import { Stars } from "./Stars";

function reviewPortraitAlt(review: Review): string {
  if (review.imageAlt) return review.imageAlt;
  if (review.image?.startsWith("/art/")) {
    const file = review.image.slice("/art/".length);
    return artAlt(file);
  }
  return `Custom ${review.style} portrait customer review by ${review.author}`;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card">
      <Stars rating={review.rating} />
      <figcaption className="mt-3 text-base font-semibold text-cream">{review.title}</figcaption>

      {review.image ? (
        <div className="mt-3 flex flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
          <blockquote className="min-w-0 flex-1 text-sm leading-relaxed text-muted">
            &ldquo;{review.body}&rdquo;
          </blockquote>
          <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl border border-line bg-ink sm:w-32 md:w-36 lg:w-40">
            <Image
              src={review.image}
              alt={reviewPortraitAlt(review)}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 160px"
            />
          </div>
        </div>
      ) : (
        <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          &ldquo;{review.body}&rdquo;
        </blockquote>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-sm font-medium text-cream">{review.author}</p>
          {review.location && <p className="text-xs text-faint">{review.location}</p>}
        </div>
        <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-muted">
          {review.style}
        </span>
      </div>
    </figure>
  );
}
