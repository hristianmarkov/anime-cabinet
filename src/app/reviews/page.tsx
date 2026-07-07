import type { Metadata } from "next";
import Link from "next/link";
import { CustomersSection } from "@/components/CustomersSection";
import { reviews } from "@/data/reviews";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description:
    "Read what customers say about their custom anime and cartoon portraits from Anime Cabinet — likeness, revisions, delivery and print quality.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <>
      <CustomersSection reviews={reviews} showGalleryLink={false} />

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
