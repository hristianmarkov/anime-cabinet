import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us — The Artists Behind Anime Cabinet",
  description:
    "Anime Cabinet is a studio of professional artists turning photos into custom anime and cartoon portraits. Unlimited revisions, preview within 48 hours.",
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
            A studio of artists who take fan art very, very seriously.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 leading-relaxed text-muted sm:px-6">
        <p>
          Anime Cabinet started with a simple observation: everyone who loves an anime has, at some point, wondered what they&apos;d look like inside it. The headband, the haori, the bounty poster, the couch scene. We decided to stop wondering and start creating.
        </p>
        <p>
          Our team of professional artists specialises in matching established animation styles. Every commission begins with a study of your photos — face shape, hairstyle, expression, the details that make you recognisable. Then we build you into the visual language of the show you chose.
        </p>
        <p>
          We offer unlimited revisions because your portrait isn&apos;t finished until you say it is. Art made by fans, for fans, one commission at a time.
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
