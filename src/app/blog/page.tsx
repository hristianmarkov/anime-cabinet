import type { Metadata } from "next";

import { BlogIndexClient } from "@/components/BlogIndexClient";



export const metadata: Metadata = {

  title: "Portrait Guides & Gift Ideas",

  description:

    "Photo tips, style comparisons and gift guides to help you plan a custom anime or cartoon portrait.",

  alternates: { canonical: "/blog" },

};



export default function BlogIndexPage() {

  return (

    <>

      <section className="bg-hero-glow border-b border-line">

        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">

          <h1 className="font-display text-4xl text-cream sm:text-5xl">

            Portrait <span className="text-gradient">Guides</span>

          </h1>

          <p className="mt-4 text-lg text-muted">

            Photo tips, style comparisons and gift ideas for your next portrait.

          </p>

        </div>

      </section>



      <BlogIndexClient />

    </>

  );

}


