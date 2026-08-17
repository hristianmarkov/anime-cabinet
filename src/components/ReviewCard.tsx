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

      <div className="mt-4 flex flex-1 items-start gap-4">
        <blockquote
          className={`text-sm leading-relaxed text-muted ${review.image ? "min-w-0 flex-1" : "w-full"}`}
        >
          &ldquo;{review.body}&rdquo;
        </blockquote>

        {review.image && (
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-ink sm:h-36 sm:w-28">
            <Image
              src={review.image}
              alt={reviewPortraitAlt(review)}
              fill
              className="object-contain object-center"
              sizes="112px"
            />
          </div>
        )}
      </div>

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
