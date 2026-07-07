import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { StyleCard } from "@/components/StyleCard";
import { site } from "@/data/site";
import { allStyles, animeStyles, cartoonStyles } from "@/data/styles";

export const metadata: Metadata = {
  title: "All Custom Portrait Styles — 30+ Anime & Cartoon Options",
  description:
    "Browse every custom portrait style we offer: Naruto, One Piece, Dragon Ball Z, Ghibli, The Simpsons, Rick and Morty and 25+ more. Hand-drawn from your photo.",
  alternates: { canonical: "/portraits" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: site.url },
    { "@type": "ListItem", position: 2, name: "All Styles", item: `${site.url}/portraits` },
  ],
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Custom Portrait Styles",
  itemListElement: allStyles.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.productName,
    url: `${site.url}/portraits/${s.slug}`,
  })),
};

export default function PortraitsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <section className="bg-hero-glow border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            Choose Your <span className="text-gradient">Style</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            {allStyles.length} hand-drawn styles and counting. Every portrait is
            drawn from your photo by a professional artist — pick the universe
            you belong in.
          </p>
          <nav className="mt-8 flex flex-wrap justify-center gap-3" aria-label="Style categories">
            <a
              href="#anime"
              className="rounded-full border border-line-bright bg-surface px-5 py-2 text-sm font-semibold text-cream transition hover:border-accent"
            >
              Anime Styles ({animeStyles.length})
            </a>
            <a
              href="#cartoons"
              className="rounded-full border border-line-bright bg-surface px-5 py-2 text-sm font-semibold text-cream transition hover:border-accent"
            >
              Cartoon Styles ({cartoonStyles.length})
            </a>
          </nav>
        </div>
      </section>

      <section id="anime" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl text-cream">Anime Styles</h2>
        <p className="mt-2 max-w-2xl text-muted">
          From the Hidden Leaf to the Grand Line — get drawn into the anime you
          grew up with (or the one you binged last week).
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {animeStyles.map((style) => (
            <StyleCard key={style.slug} style={style} />
          ))}
        </div>
      </section>

      <section id="cartoons" className="mx-auto max-w-7xl scroll-mt-24 border-t border-line px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl text-cream">Cartoon Styles</h2>
        <p className="mt-2 max-w-2xl text-muted">
          The most-streamed animated shows on TV — with you drawn into them.
          Couch scene included.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cartoonStyles.map((style) => (
            <StyleCard key={style.slug} style={style} />
          ))}
        </div>
      </section>
    </>
  );
}
