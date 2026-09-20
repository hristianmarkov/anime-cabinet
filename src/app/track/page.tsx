import type { Metadata } from "next";
import Link from "next/link";
import { TrackOrderLookupForm } from "@/components/TrackOrderLookupForm";

export const metadata: Metadata = {
  title: "Track My Order",
  description: "Check the status of your Anime Cabinet portrait order — production, preview, and shipping.",
  alternates: { canonical: "/track" },
};

export default function TrackOrderPage() {
  return (
    <>
      <section className="border-b border-line bg-hero-glow">
        <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            Track My <span className="text-gradient">Order</span>
          </h1>
          <p className="mt-4 text-muted">
            Use the link in your confirmation email, or enter your order ID and email below.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <TrackOrderLookupForm />
        <p className="mt-8 text-center text-sm text-faint">
          Lost your link?{" "}
          <Link href="/contact" className="text-accent hover:underline">
            Contact support
          </Link>
        </p>
      </section>
    </>
  );
}
