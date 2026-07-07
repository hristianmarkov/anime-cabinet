import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <section className="bg-hero-glow">
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-3xl"
          aria-hidden="true"
        >
          ✓
        </div>
        <h1 className="font-display mt-6 text-4xl text-cream sm:text-5xl">
          Your Portrait Is <span className="text-gradient">In the Queue</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Payment received — thank you! A confirmation email with your order
          details is on its way to your inbox.
        </p>

        <div className="mt-10 rounded-2xl border border-line bg-surface p-8 text-left shadow-card">
          <h2 className="text-base font-semibold text-cream">What happens next</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <li>
              <strong className="text-cream">1. Artist review.</strong> One of
              our illustrators studies your photos and notes.
            </li>
            <li>
              <strong className="text-cream">2. Preview within {site.deliveryHours} hours.</strong>{" "}
              We email you a preview of your portrait.
            </li>
            <li>
              <strong className="text-cream">3. Unlimited revisions.</strong>{" "}
              Reply with any changes — we revise for free until you love it.
            </li>
            <li>
              <strong className="text-cream">4. Final delivery.</strong> You
              receive the high-resolution file, and any prints ship to your door.
            </li>
          </ol>
        </div>

        <p className="mt-8 text-sm text-faint">
          Forgot to mention something?{" "}
          <Link href="/contact" className="text-accent hover:text-accent-bright">
            Contact us
          </Link>{" "}
          with your order details.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-line-bright px-8 py-3 text-sm font-semibold text-cream transition hover:bg-surface"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
