import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for Anime Cabinet custom portrait commissions: usage rights, fan-art disclaimer, delivery and liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 2026">
      <h2>The service</h2>
      <p>
        Anime Cabinet ({site.url}) sells custom, hand-drawn portrait
        commissions based on photos you provide, drawn in art styles inspired
        by animated shows. By placing an order you agree to these terms.
      </p>

      <h2>Fan art disclaimer</h2>
      <p>
        Anime Cabinet is an independent commission studio. We are not
        affiliated with, authorized, or endorsed by any anime or animation
        studio, publisher, broadcaster, or rights holder. Portraits are
        original, hand-drawn works of fan art inspired by animation art styles,
        sold for personal use only. No official characters, logos, or
        copyrighted imagery are reproduced.
      </p>

      <h2>Your photos</h2>
      <ul>
        <li>You must own or have permission to use every photo you upload.</li>
        <li>Photos of identifiable people require their consent (or a parent&apos;s/guardian&apos;s for minors).</li>
        <li>We reject and refund orders containing unlawful or abusive content.</li>
      </ul>

      <h2>Usage rights</h2>
      <p>
        Upon full payment and delivery you receive a licence to use your
        portrait for any personal, non-commercial purpose: printing, sharing,
        profile pictures, gifts. Commercial use (logos, merchandise for sale,
        branding) requires a separate commercial licence — <a href="/contact" className="text-accent">contact us</a>.
        We retain the right to use anonymised artwork in our portfolio only
        with your permission.
      </p>

      <h2>Delivery and revisions</h2>
      <p>
        Preview delivery target is {site.deliveryHours} hours standard ({site.expeditedHours}-hour priority available). These are estimates, not guarantees. Unlimited revisions are included as described in our{" "}
        <a href="/refund-policy" className="text-accent">Refunds &amp; Revisions</a> policy.
      </p>

      <h2>Liability</h2>
      <p>
        Our total liability for any order is limited to the amount you paid for
        that order. We are not liable for indirect or consequential losses.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms; the version published at the time of your
        order applies to that order. Questions: use our <a href="/contact" className="text-accent">contact form</a>.
      </p>
    </LegalPage>
  );
}
