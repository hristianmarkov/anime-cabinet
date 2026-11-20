import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    `Anime Cabinet is a studio of professional artists turning photos into custom anime and cartoon portraits. Unlimited revisions, preview within ${site.deliveryHours} hours.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-hero-glow border-b border-line">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            About <span className="text-gradient">Anime Cabinet</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            Personal portraits inspired by the animation styles you enjoy.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 leading-relaxed text-muted sm:px-6">
        <p>
          Anime Cabinet creates custom anime and cartoon portraits from your photos. You choose the style and the people or pets in the picture, then describe the clothing, pose and setting that make the idea personal.
        </p>
        <p>
          Our artists use your references to preserve identifying details while adapting the drawing style. A clear face photo helps with likeness; separate references can explain an outfit, action pose or meaningful place. You can compare examples across our <Link href="/portraits" className="text-accent underline">24 portrait styles</Link> before choosing.
        </p>
        <p>
          Every order includes a high-resolution digital file and a preview to review. Unlimited revisions are included before approval. Posters, canvases and framed prints are optional; they enter production after the artwork is approved. Our <Link href="/how-it-works" className="text-accent underline">ordering guide</Link> and <Link href="/shipping" className="text-accent underline">shipping policy</Link> explain the separate stages.
        </p>
        <p>
          Questions or ideas?{" "}
          <Link href="/contact" className="text-accent hover:text-accent-bright">Send us a message</Link> — we read everything.
        </p>
        <div className="pt-6 text-center">
          <Link href="/portraits" className="inline-block rounded-full bg-accent px-10 py-4 text-base font-semibold text-white shadow-glow hover:bg-accent-bright">
            Browse Our Styles
          </Link>
        </div>
      </section>
    </>
  );
}
