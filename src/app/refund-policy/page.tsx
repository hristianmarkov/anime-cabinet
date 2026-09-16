import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Anime Cabinet's policy for custom-made artwork, cancellations, revisions, and damaged or defective prints.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated="September 16, 2026">
      <h2>All sales are final</h2>
      <p>
        Every Anime Cabinet portrait is custom-made for you from the photos,
        style choices, and instructions submitted with your order. Because work
        begins specifically for your commission and cannot be resold, orders
        are non-refundable and cannot be returned, exchanged, or cancelled
        after payment. This applies to digital artwork and to any custom print
        produced from it.
      </p>
      <p>
        By completing checkout, you ask us to begin providing the personalised
        service and acknowledge this no-refund policy. Please check your photo,
        email address, style, character count, print format, delivery address,
        and order notes carefully before paying.
      </p>

      <h2>Revisions are the remedy for artwork concerns</h2>
      <p>
        If the first preview is not right, contact us with clear feedback. Your
        order includes unlimited reasonable revisions until you approve the
        artwork. Revisions must remain consistent with the original order; a
        new photo, style, number of people or pets, or substantially different
        concept may require a new order or an additional fee.
      </p>
      <p>
        A change of mind, an event date passing, failure to respond, or
        dissatisfaction that can be addressed through the included revision
        process does not qualify for a refund. Once you approve a preview, that
        approval is final and any physical product will be made from the
        approved version.
      </p>

      <h2>Digital files</h2>
      <p>
        Digital files cannot be returned or exchanged. If a delivered file is
        corrupt, incomplete, or different from the approved artwork, contact
        us and we will correct or replace the file.
      </p>

      <h2>Damaged, defective, or incorrect prints</h2>
      <p>
        Custom prints are not returnable. If your print arrives damaged, has a
        manufacturing defect, or is not the product you ordered, contact us
        through our <a href="/contact" className="text-accent">contact form</a>{" "}
        within 14 days of delivery. Include your order number, a description of
        the issue, photographs of the item and packaging, and a photograph of
        the shipping label. Please keep the item and packaging while we review
        the claim.
      </p>
      <p>
        For a verified production or fulfilment error, our remedy is a free
        replacement of the affected item. Normal variations in colour between
        a screen and a printed product, minor placement variations, damage
        caused after delivery, and errors in customer-approved artwork or
        customer-supplied addresses are not defects.
      </p>

      <h2>Lost or undeliverable shipments</h2>
      <p>
        Report a shipment that is marked delivered but missing, or that has not
        arrived by the carrier&apos;s latest estimate, as soon as possible. We will
        investigate with the carrier. We do not refund or replace orders sent
        to an incorrect or incomplete address supplied at checkout, refused
        deliveries, or packages left unclaimed. Any reshipment costs in those
        circumstances are the customer&apos;s responsibility.
      </p>

      <h2>Exceptions required by law</h2>
      <p>
        Nothing in this policy excludes, limits, or replaces rights that cannot
        lawfully be excluded under applicable consumer law. Where the law
        requires a different remedy, we will provide that remedy.
      </p>

      <h2>Contact us</h2>
      <p>
        For revision or product issue requests, use our{" "}
        <a href="/contact" className="text-accent">contact form</a> from the email
        address used at checkout and include your order number.
      </p>
    </LegalPage>
  );
}
