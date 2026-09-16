import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Anime Cabinet collects, uses, shares, retains, and protects personal information, including uploaded reference photos.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 16, 2026">
      <p>
        This policy explains how {site.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
        collects, uses, discloses, and protects personal information when you
        visit {site.domain}, contact us, or place an order.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Contact and order information:</strong> name, email address, order notes, selected options, and order history.</li>
        <li><strong>Customer content:</strong> reference photos and other material you upload, plus feedback and communications about your portrait.</li>
        <li><strong>Delivery information:</strong> recipient name, postal address, telephone number when provided, shipping method, and tracking information for print orders.</li>
        <li><strong>Transaction information:</strong> amount, currency, payment status, and transaction identifiers. Our payment processor handles complete payment-card details; we do not store them.</li>
        <li><strong>Device and usage information:</strong> IP address, browser and device type, pages visited, referring page, approximate location, and interactions with our website.</li>
        <li><strong>Information you send us:</strong> messages, support requests, and any other information you choose to provide.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>Provide, personalise, fulfil, revise, print, ship, and support your order.</li>
        <li>Process payments and send order, preview, delivery, and service communications.</li>
        <li>Operate, secure, troubleshoot, and improve our website and services.</li>
        <li>Prevent fraud, misuse, and security incidents and enforce our terms.</li>
        <li>Comply with legal, tax, accounting, and regulatory obligations.</li>
        <li>Send marketing only where you have consented or where otherwise permitted by law; you may opt out at any time.</li>
      </ul>

      <h2>How we share information</h2>
      <p>We disclose information only as reasonably necessary to:</p>
      <ul>
        <li>Artists and contractors who create and support your commissioned artwork.</li>
        <li>Payment, hosting, file-storage, email, analytics, print-production, shipping, and other service providers acting for us.</li>
        <li>Professional advisers, regulators, courts, law enforcement, or other parties when required to comply with law or protect rights and safety.</li>
        <li>A buyer or successor in connection with a merger, financing, reorganisation, or sale of all or part of our business.</li>
      </ul>
      <p>
        We do not sell your personal information or reference photos. We do not
        publish your photos or commissioned portrait in a gallery, portfolio,
        advertisement, or social post without your permission.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We and our service providers may use cookies and similar technologies
        needed for website operation, preferences, security, and audience
        measurement. You can restrict cookies through your browser, although
        parts of the site may then work differently. Browser-based
        &quot;Do Not Track&quot; signals are not uniformly recognised.
      </p>

      <h2>Legal bases for processing</h2>
      <p>
        Where applicable law requires a legal basis, we process information to
        perform our contract with you, pursue legitimate interests such as
        operating and securing the service, comply with legal obligations, and
        based on consent where requested. You may withdraw consent at any time,
        without affecting processing already completed.
      </p>

      <h2>Retention</h2>
      <p>
        We keep personal information only as long as reasonably necessary for
        the purposes described here, including providing revisions or
        reprints, maintaining transaction records, resolving disputes, and
        meeting legal obligations. We generally retain uploaded reference
        photos while an order is active and for up to 90 days after final
        delivery, unless a longer period is needed for an unresolved request
        or required by law. You may request earlier deletion, subject to those
        exceptions.
      </p>

      <h2>Security and international processing</h2>
      <p>
        We use reasonable administrative, technical, and organisational
        safeguards, but no internet transmission or storage method is
        completely secure. Our providers and team may process information in
        countries other than yours. Where required, we use recognised transfer
        safeguards for that processing.
      </p>

      <h2>Your privacy rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct,
        delete, restrict, object to, or receive a portable copy of your
        information, and to appeal or complain to a data-protection authority.
        To submit a request, use our <a href="/contact" className="text-accent">contact form</a>.
        We may need to verify your identity. We will not discriminate against
        you for exercising a privacy right.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        Our service is not directed to children under 13, and we do not
        knowingly collect their personal information. Orders involving a
        minor&apos;s photograph must be submitted or authorised by a parent or
        legal guardian. Contact us if you believe a child has provided personal
        information without appropriate consent.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update this policy and will post the revised version with a new
        date. Questions or privacy requests can be sent through our{" "}
        <a href="/contact" className="text-accent">contact form</a> or to {site.email}.
      </p>
    </LegalPage>
  );
}
