import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing Anime Cabinet custom portrait commissions, customer content, revisions, fulfilment, and personal-use licences.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 16, 2026">
      <h2>Overview and acceptance</h2>
      <p>
        These Terms govern your use of {site.domain} and purchases from {site.name}.
        By using the site or placing an order, you agree to these Terms, our{" "}
        <a href="/privacy-policy" className="text-accent">Privacy Policy</a>,{" "}
        <a href="/refund-policy" className="text-accent">Refund &amp; Cancellation Policy</a>,
        and <a href="/shipping" className="text-accent">Shipping &amp; Delivery Policy</a>.
        You must be able to form a binding contract in your location. If you
        order for an organisation or another person, you confirm you have
        authority to accept these Terms for them.
      </p>

      <h2>Our custom service</h2>
      <p>
        We create personalised portrait artwork from customer-supplied photos
        and instructions and, when selected, arrange made-to-order printing.
        Examples on the site show the general style only. Because artwork is
        individually created, exact poses, colours, details, and likeness will
        vary and no two results will be identical.
      </p>

      <h2>Orders, prices, and payment</h2>
      <ul>
        <li>You must provide current, complete, and accurate order, contact, billing, and delivery information.</li>
        <li>Prices, currencies, product availability, shipping charges, and delivery options are shown at checkout and may change before an order is placed.</li>
        <li>Payment is due in full at checkout. Applicable taxes or import charges may be added or collected separately.</li>
        <li>An order is accepted when payment is confirmed and we begin fulfilment. We may reject or cancel an order for suspected fraud, pricing or technical errors, unavailable service, prohibited content, or inability to fulfil it. If we cancel an accepted order, we will return the amount paid for the unfulfilled order.</li>
      </ul>

      <h2>Your photos and instructions</h2>
      <p>You represent and warrant that:</p>
      <ul>
        <li>You own or have all permissions needed for every photo, instruction, name, and other item you submit.</li>
        <li>Identifiable people have consented to the use of their image, and a parent or legal guardian has authorised content depicting a minor.</li>
        <li>Your content and requested use do not violate law, privacy, publicity, intellectual-property, or other rights.</li>
        <li>Your submission does not contain unlawful, hateful, exploitative, abusive, sexually explicit, or otherwise harmful material.</li>
      </ul>
      <p>
        You grant us and our service providers a limited licence to host, copy,
        modify, and use submitted content solely to provide, support, secure,
        and fulfil your order. You remain responsible for your content. We may
        refuse a request that violates these Terms.
      </p>

      <h2>Previews, revisions, and approval</h2>
      <p>
        We aim to deliver the first preview within {site.deliveryHours} hours
        for standard service or {site.expeditedHours} hours for priority
        service, after receiving everything needed to begin. These are targets,
        not guaranteed deadlines. Unlimited reasonable revisions consistent
        with the original order are included. Material changes to the brief may
        require an additional fee or new order.
      </p>
      <p>
        You are responsible for checking names, colours, composition, cropping,
        and other details before approval. Approval authorises final digital
        delivery and, if ordered, print production. You cannot change an
        approved print after production begins.
      </p>

      <h2>Final artwork licence</h2>
      <p>
        After full payment, we grant you a non-exclusive, non-transferable
        licence to use the final delivered portrait for personal,
        non-commercial purposes, including personal display, gifts, social
        profiles, and personal printing. You may not sell the artwork, use it
        on merchandise, use it as a logo or brand asset, falsely claim
        authorship, remove rights notices, or use it to train an AI system.
        Commercial use requires a separate written licence from us.
      </p>
      <p>
        We retain all rights in our original artwork, site, branding, layouts,
        and materials except for your rights in the content you supplied. We
        will use your portrait publicly only with your permission.
      </p>

      <h2>Independent fan-art studio</h2>
      <p>
        Anime Cabinet is an independent commission studio and is not affiliated
        with, authorised, sponsored, or endorsed by any animation studio,
        publisher, broadcaster, or rights holder. Style references describe
        artistic inspiration and do not imply an official product. Customers
        may not request protected logos or direct copies of official artwork.
      </p>

      <h2>Refunds, digital delivery, and shipping</h2>
      <p>
        All commissions are personalised and all sales are final except where
        a non-excludable law requires otherwise. Review our{" "}
        <a href="/refund-policy" className="text-accent">Refund &amp; Cancellation Policy</a>{" "}
        before paying. Digital delivery, production, shipping estimates,
        address responsibilities, customs, and damage claims are covered by our{" "}
        <a href="/shipping" className="text-accent">Shipping &amp; Delivery Policy</a>.
      </p>

      <h2>Website use and third-party services</h2>
      <p>
        You may not misuse the site, interfere with its operation, introduce
        malicious code, scrape it at scale, attempt unauthorised access, or use
        site content in violation of our rights. Payment, hosting, email,
        analytics, production, and delivery may be provided by third parties.
        Their services may also be subject to their terms and availability.
      </p>

      <h2>Disclaimers and limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the site and services are
        provided &quot;as is&quot; and &quot;as available.&quot; We disclaim implied warranties
        except those that cannot lawfully be excluded. We are not liable for
        indirect, incidental, special, consequential, or punitive loss, or for
        delays caused by carriers, customs, events outside our reasonable
        control, or inaccurate customer information.
      </p>
      <p>
        To the fullest extent permitted by law, our total liability arising
        from an order or these Terms will not exceed the amount you paid for
        the order giving rise to the claim. Nothing in these Terms limits
        liability or consumer rights that cannot lawfully be limited.
      </p>

      <h2>Changes, severability, and contact</h2>
      <p>
        We may update these Terms by posting a revised version. The version in
        effect when you place an order governs that order. If a provision is
        unenforceable, the remaining provisions continue in effect. Failure to
        enforce a provision is not a waiver. Questions can be submitted through
        our <a href="/contact" className="text-accent">contact form</a> or to {site.email}.
      </p>
    </LegalPage>
  );
}
