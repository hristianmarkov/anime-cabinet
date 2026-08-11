"use client";

import Link from "next/link";
import { AnimatedGallery } from "@/components/AnimatedGallery";
import { galleryItems } from "@/data/gallery";

export function GallerySection() {
  return (
    <section id="gallery" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="text-center">
        <h2 className="font-display text-3xl text-cream sm:text-4xl">
          Our <span className="text-gradient">Gallery</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Real transformations from customer photos — drag any portrait on a product page to compare before and after.
        </p>
      </div>
      <div className="mt-10">
        <AnimatedGallery items={galleryItems} />
      </div>
      <p className="mt-8 text-center">
        <Link href="/portraits" className="text-sm font-semibold text-accent hover:text-accent-bright">
          Browse all styles →
        </Link>
      </p>
    </section>
  );
}
