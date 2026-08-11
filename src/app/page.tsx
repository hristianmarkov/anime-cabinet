import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CustomersSection } from "@/components/CustomersSection";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { PriceFrom } from "@/components/PriceFrom";
import { StatsBar } from "@/components/StatsBar";
import { StyleCard } from "@/components/StyleCard";
import { globalFaqs } from "@/data/faqs";
import { heroArtBySlug } from "@/data/gallery";
import { reviews } from "@/data/reviews";
import { site } from "@/data/site";
import { allStyles, bestSellers } from "@/data/styles";

export const metadata: Metadata = {
  title: "Custom Anime Portraits From Your Photo",
  description:
    `Turn your photo into a custom anime or cartoon portrait. 24 styles — Naruto, One Piece, Ghibli, Simpsons & more. Unlimited revisions, preview within ${site.deliveryHours} hours.`,
  alternates: { canonical: "/" },
};

const homeFaqs = globalFaqs.slice(0, 6);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const steps = [
  {
    title: "Pick Your Style",
    body: "Choose from 24 anime and cartoon styles — from Naruto to The Simpsons. Select how many people (and pets) you want drawn, your background, and digital or print.",
  },
  {
    title: "Upload Your Photos",
    body: "Send us clear photos and any notes: outfits, poses, jutsu, bounties, burger puns. Our artists study every detail so the portrait is unmistakably you.",
  },
  {
    title: "Approve & Enjoy",
    body: `Our artists deliver your preview within ${site.deliveryHours} hours — or add priority delivery for ${site.expeditedHours}-hour turnaround. Request unlimited free revisions until it's perfect, then receive your high-res file and any prints you ordered.`,
  },
];

const occasions = [
  {
    title: "Anniversaries & Couples",
    body: "Two characters, one universe. Couple portraits in Rick and Morty, JJK or Ghibli style are our most-gifted item.",
    accent: "#ff3860",
  },
  {
    title: "Birthdays",
    body: "Skip the gift card. Give them their own wanted poster, Saiyan transformation, or custom anime portrait instead.",
    accent: "#ffc53d",
  },
  {
    title: "Family Portraits",
    body: "The whole household — pets included — drawn into Bob's Burgers, Spy x Family or the classic Simpsons couch.",
    accent: "#4ade80",
  },
  {
    title: "Just Because",
    body: "New profile picture? Wall art for your setup? You don't need an occasion to look this good animated.",
    accent: "#7c6cff",
  },
];

const heroStyles = [
  {
    label: "Naruto",
    slug: "naruto",
    accent: "#ff8a3d",
    className: "aspect-[4/5] rounded-2xl border border-line shadow-card",
  },
  {
    label: "One Piece",
    slug: "one-piece",
    accent: "#ff3860",
    className: "mt-6 aspect-[4/5] rounded-2xl border border-line shadow-card",
  },
  {
    label: "Rick and Morty",
    slug: "rick-and-morty",
    accent: "#4ade80",
    className: "-mt-6 aspect-[4/5] rounded-2xl border border-line shadow-card",
  },
  {
    label: "The Simpsons",
    slug: "the-simpsons",
    accent: "#facc15",
    className: "aspect-[4/5] rounded-2xl border border-line shadow-card",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />

      {/* Hero */}
      <section className="bg-hero-glow relative overflow-hidden">
        <div className="bg-grain absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pb-16 lg:pt-14">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
              Turn Your Photo Into a{" "}
              <span className="text-gradient">Custom Anime Portrait</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              Our professional artists redraw you, your partner, your family —
              even your pets — in the style of your favorite anime or cartoon.
              24 styles, unlimited revisions, delivered within {site.deliveryHours}{" "}
              hours.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/portraits"
                className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-glow transition hover:bg-accent-bright"
              >
                Browse All Styles
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-full border border-line-bright px-8 py-3.5 text-base font-semibold text-cream transition hover:bg-surface"
              >
                How It Works
              </Link>
            </div>
            <p className="mt-4 text-sm text-faint">
              From <PriceFrom usd={34.99} prefix="" /> · Worldwide print shipping · Unlimited free revisions
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {heroStyles.map((item) => {
                const hero = heroArtBySlug[item.slug];
                return (
                <Link
                  key={item.slug}
                  href={`/portraits/${item.slug}`}
                  className={`group block transition duration-300 hover:-translate-y-1 hover:shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${item.className}`}
                  aria-label={`View ${item.label} portraits`}
                >
                  {hero ? (
                    <Image
                      src={hero.src}
                      alt={hero.alt}
                      width={800}
                      height={1000}
                      className="h-full w-full rounded-2xl object-cover"
                      sizes="(max-width: 1024px) 50vw, 400px"
                      priority
                    />
                  ) : null}
                </Link>
              );
              })}
            </div>
          </div>
        </div>
      </section>

      <StatsBar />

      {/* Best sellers */}
      <section id="bestsellers" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-cream sm:text-4xl">
                Best Sellers
              </h2>
              <p className="mt-3 max-w-xl text-muted">
                The styles our customers order again and again.
              </p>
            </div>
            <Link
              href="/portraits"
              className="text-sm font-semibold text-accent hover:text-accent-bright"
            >
              View all {allStyles.length} styles →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.slice(0, 4).map((style) => (
              <StyleCard key={style.slug} style={style} />
            ))}
          </div>
        </div>
      </section>

      <CustomersSection reviews={reviews} showGalleryLink />

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Three steps between you and your anime self. Most orders take under
            two minutes to place.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-line bg-surface p-8 shadow-card"
            >
              <span className="font-display text-gradient text-5xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-cream">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Occasions */}
      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl text-cream sm:text-4xl">
              A Gift They&apos;ll Never Forget
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Custom portraits are the rare gift that&apos;s personal, permanent
              and impossible to buy twice.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {occasions.map((o) => (
              <div
                key={o.title}
                className="rounded-2xl border border-line bg-surface p-6 shadow-card"
              >
                <div
                  className="h-1.5 w-12 rounded-full"
                  style={{ background: o.accent }}
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-base font-semibold text-cream">
                  {o.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="font-display text-center text-3xl text-cream sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="mt-10">
          <FaqAccordion faqs={homeFaqs} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          More questions?{" "}
          <Link href="/faq" className="font-semibold text-accent hover:text-accent-bright">
            Read the full FAQ
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="font-semibold text-accent hover:text-accent-bright">
            contact us
          </Link>
          .
        </p>
      </section>

      {/* Final CTA */}
      <section className="bg-hero-glow relative overflow-hidden border-t border-line">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <h2 className="font-display text-4xl text-cream sm:text-5xl">
            Ready to See Yourself <span className="text-gradient">Animated?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Pick a style, upload a photo, and our artists will handle the rest.
          </p>
          <Link
            href="/portraits"
            className="mt-8 inline-block rounded-full bg-accent px-10 py-4 text-lg font-semibold text-white shadow-glow transition hover:bg-accent-bright"
          >
            Get My Portrait
          </Link>
        </div>
      </section>
    </>
  );
}

