import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Anime Cabinet collects, uses and protects your data — including the photos you upload for your custom portrait.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 2026">
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Order details:</strong> your email address, chosen style and
          options, and any notes you provide.
        </li>
        <li>
          <strong>Photos:</strong> the reference photos you upload so our
          artists can draw your portrait.
        </li>
        <li>
          <strong>Payment data:</strong> processed entirely by Stripe. We never
          see or store your card details.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Your photos and notes are used for one purpose only: creating your
        commissioned artwork. They are shared with the assigned artist and no
        one else. Your email is used for order communication (previews,
        revisions, delivery) and nothing else unless you explicitly subscribe
        to updates.
      </p>

      <h2>Photo storage and deletion</h2>
      <p>
        Uploaded photos are stored securely on our hosting provider&apos;s
        storage (Vercel). We retain them while your order is active and for up
        to 90 days after delivery to support revisions and reprints. You can
        request earlier deletion at any time via our <a href="/contact" className="text-accent">contact form</a>.
      </p>

      <h2>What we never do</h2>
      <ul>
        <li>We never sell your data or photos to anyone.</li>
        <li>We never publish your portrait publicly without your written permission.</li>
      </ul>

      <h2>Third-party services</h2>
      <p>
        We rely on Stripe (payments), Vercel (hosting and file storage) and
        Resend (transactional email). Each processes your data under its own
        privacy policy and only as needed to provide the service.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request a copy or deletion of your personal data at any time by
        contacting us via the <a href="/contact" className="text-accent">contact form</a>. We respond to all requests within 30 days.
      </p>
    </LegalPage>
  );
}
