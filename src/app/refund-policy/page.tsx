import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Refunds & Revisions Policy",
  description:
    "Unlimited free revisions on every custom portrait. Read our refund policy for custom artwork, prints and cancellations.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refunds & Revisions" updated="July 2026">
      <h2>Unlimited revisions, first</h2>
      <p>
        Our promise is simple: we revise your portrait for free until you are
        happy with it. There is no revision limit. In practice this resolves
        nearly every concern — if something looks off, tell us exactly what and
        we will redraw it.
      </p>

      <h2>Cancellations</h2>
      <ul>
        <li>
          Before an artist starts your portrait (usually within 12 hours of
          ordering): full refund, no questions asked. Use our <a href="/contact" className="text-accent">contact form</a> with your order ID.
        </li>
        <li>
          After drawing has started: because custom artwork is made to order, we
          can offer a 50% refund up until the first preview is sent.
        </li>
        <li>
          After the first preview is delivered: refunds are handled case by
          case; we will always attempt unlimited revisions first.
        </li>
      </ul>

      <h2>Prints</h2>
      <p>
        Prints are produced only after you approve the artwork, so print
        returns for artistic reasons are not available. Damaged or defective
        prints are replaced free of charge — see our{" "}
        <a href="/shipping" className="text-accent">Shipping &amp; Delivery</a>{" "}
        policy.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Use our <a href="/contact" className="text-accent">contact form</a> from the address used at checkout, include your order
        ID, and tell us what went wrong. We respond within 24 hours and process
        approved refunds to the original payment method within 5-10 business
        days.
      </p>
    </LegalPage>
  );
}
