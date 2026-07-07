import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "How It Works — From Photo to Portrait in 3 Steps",
  description:
    "How to turn your photo into a custom anime portrait: pick a style, upload photos, preview within 48 hours with unlimited revisions.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    title: "Choose your style and options",
    body: "Browse our 30+ anime and cartoon styles and pick your favorite. On the product page, choose how many characters (people and pets), your background — an iconic scene or a custom one you describe — and your format: digital file or add a poster, canvas, or framed print.",
  },
  {
    title: "Upload your photos and notes",
    body: "Upload a clear photo of each person or pet. Tell our artists anything that matters: outfits, poses, props, who stands where. For print orders, enter your shipping address — we'll show live shipping rates before you pay. Checkout is handled securely by Stripe.",
  },
  {
    title: "Artist review and creation",
    body: "Our professional artists review your photos, study the reference style, and create your portrait. You receive a preview to approve, with unlimited free revisions until it's perfect.",
  },
  {
    title: "Preview and unlimited revisions",
    body: `Within ${site.deliveryHours} hours you'll receive a preview by email — or add priority delivery for ${site.expeditedHours}-hour turnaround (+$10). Request as many changes as you need until you love it.`,
  },
  {
    title: "Final delivery",
    body: "Once approved, you receive the final high-resolution file. If you ordered a print, it goes to production and ships worldwide — shipping cost was calculated at checkout based on your country.",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to turn your photo into a custom anime portrait",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.body,
  })),
};

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={howToJsonLd} />
      <section className="bg-hero-glow border-b border-line">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            How It <span className="text-gradient">Works</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            From your camera roll to custom artwork in five simple steps.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ol className="space-y-6">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-line bg-surface p-8 shadow-card">
              <div className="flex items-start gap-5">
                <span className="font-display text-gradient text-4xl">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2 className="text-lg font-semibold text-cream">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <Link href="/portraits" className="inline-block rounded-full bg-accent px-10 py-4 text-base font-semibold text-white shadow-glow hover:bg-accent-bright">
            Start My Portrait
          </Link>
        </div>
      </section>
    </>
  );
}
