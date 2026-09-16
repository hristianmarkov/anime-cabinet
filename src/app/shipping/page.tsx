import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description: `Digital previews within ${site.deliveryHours} hours. Custom prints are produced after approval, with shipping options and estimates shown at checkout.`,
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping & Delivery Policy" updated="September 16, 2026">
      <h2>Digital artwork delivery</h2>
      <p>
        Every order includes a digital file. We aim to email your first preview
        within {site.deliveryHours} hours, or {site.expeditedHours} hours if you
        purchase priority service. Turnaround starts after we receive payment,
        usable reference photos, and all information needed to begin. Revision
        time is additional. Once you approve the artwork, we send the final
        high-resolution file to the email address used for your order.
      </p>

      <h2>Made-to-order print production</h2>
      <p>
        Posters, canvases, and framed prints are custom-made from your approved
        artwork. They enter production only after you approve the preview. The
        estimated transit time shown at checkout does not include artwork
        creation, revisions, approval, or print production time. Once an
        approved print enters production, it cannot be changed or cancelled.
      </p>

      <h2>Shipping options and estimates</h2>
      <p>
        Available shipping methods, prices, and estimated delivery windows are
        calculated for the delivery address and displayed at checkout before
        payment. We ship to the destinations for which checkout offers a
        shipping method. Delivery dates are estimates, not guarantees, and may
        be affected by production volume, carrier delays, weather, customs, or
        other events outside our control.
      </p>
      <p>
        Shipping fees are charged at checkout. Separate products may be
        produced or dispatched separately and can arrive in more than one
        package without an additional shipping charge.
      </p>

      <h2>Tracking</h2>
      <p>
        When tracking is available, we send it to your order email after the
        print dispatches. Tracking can take time to update after a label is
        created. Carrier scans and delivery estimates are controlled by the
        carrier.
      </p>

      <h2>Delivery addresses</h2>
      <p>
        You are responsible for providing a complete and accurate address. If
        you notice an error, contact us immediately. We cannot promise an
        address change after approval or production begins. Additional costs
        caused by an incorrect address, a refused delivery, or an unclaimed
        package are the customer&apos;s responsibility.
      </p>

      <h2>Customs, duties, and taxes</h2>
      <p>
        International shipments may be inspected by customs and may incur
        import duties, taxes, or handling charges. Unless checkout expressly
        states otherwise, these charges are not included in the purchase price
        and are the recipient&apos;s responsibility. Customs clearance may extend
        the delivery time.
      </p>

      <h2>Delayed, lost, or damaged orders</h2>
      <p>
        If tracking has not updated or your package has not arrived by the end
        of its estimated window, contact us so we can investigate. If a print
        arrives damaged, defective, or incorrect, keep the product and
        packaging and notify us within 14 days as described in our{" "}
        <a href="/refund-policy" className="text-accent">Refund &amp; Cancellation Policy</a>.
      </p>
    </LegalPage>
  );
}
