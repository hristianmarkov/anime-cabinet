import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    `Digital previews within ${site.deliveryHours} hours. Prints ship worldwide after artwork approval — shipping cost calculated at checkout by country.`,
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping & Delivery" updated="July 2026">
      <h2>Digital delivery</h2>
      <p>
        Every order includes a high-resolution digital file. A preview is emailed within{" "}
        {site.deliveryHours} hours (or {site.expeditedHours} hours with priority delivery).
        After you approve the artwork, the final file is delivered to the same email address.
      </p>
      <h2>Print production and shipping</h2>
      <p>
        Posters, canvases and framed prints are produced only after you approve the artwork.
        We ship prints worldwide through our print partner — shipping cost depends on your country
        and is calculated at checkout before you pay.
      </p>
      <ul>
        <li>Shipping rates are shown when you enter your delivery address at checkout.</li>
        <li>Typical delivery after dispatch is 5–10 business days depending on destination.</li>
        <li>You will receive tracking when your print ships.</li>
      </ul>
      <h2>Customs and import duties</h2>
      <p>
        International orders may be subject to local import taxes or duties, which are the recipient&apos;s responsibility.
      </p>
      <h2>Damaged or lost prints</h2>
      <p>
        If your print arrives damaged, contact us via the{" "}
        <a href="/contact" className="text-accent">contact form</a> with a photo within 14 days and we will send a free replacement.
      </p>
    </LegalPage>
  );
}
