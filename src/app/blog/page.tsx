import type { Metadata } from "next";
import { BlogIndexClient } from "@/components/BlogIndexClient";

export const metadata: Metadata = {
  title: "Blog — Fandom, Gifts & Portrait Culture",
  description:
    "Gift guides for every anime and cartoon fandom, plus stories on fandom culture, nostalgia, relationships, and custom portrait tips.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <>
      <section className="bg-hero-glow border-b border-line">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            The <span className="text-gradient">Cabinet</span> Blog
          </h1>
          <p className="mt-4 text-lg text-muted">
            Fandom stories, gift guides and culture — from fans, for fans.
          </p>
        </div>
      </section>

      <BlogIndexClient />
    </>
  );
}
