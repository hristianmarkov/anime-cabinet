import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { globalFaqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Everything you need to know about ordering a custom anime portrait: delivery times, revisions, photo requirements, shipping, pets and more.",
  alternates: { canonical: "/faq" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: globalFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />

      <section className="bg-hero-glow border-b border-line">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            Everything about ordering, delivery, revisions and prints.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FaqAccordion faqs={globalFaqs} />
        <p className="mt-8 text-center text-sm text-muted">
          Still curious?{" "}
          <Link href="/contact" className="font-semibold text-accent hover:text-accent-bright">
            Contact us
          </Link>{" "}
          — we reply within 24 hours.
        </p>
      </section>
    </>
  );
}
