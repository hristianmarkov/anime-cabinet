import type { Review } from "@/data/reviews";
import { Stars } from "./Stars";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card">
      <Stars rating={review.rating} />
      <figcaption className="mt-3 text-base font-semibold text-cream">
        {review.title}
      </figcaption>
      <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        &ldquo;{review.body}&rdquo;
      </blockquote>
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
