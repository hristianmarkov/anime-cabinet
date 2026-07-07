import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Anime Cabinet — questions about your order, custom group quotes, commercial licences or new style requests. We reply within 24 hours.",
  alternates: { canonical: "/contact" },
};

const reasons = [
  {
    title: "Order questions",
    body: "Include your order ID from your confirmation email and we'll get back to you within 24 hours.",
  },
  {
    title: "Groups larger than 6",
    body: "Send your photos, chosen style and headcount for a custom quote — usually within one business day.",
  },
  {
    title: "A style we don't offer yet",
    body: "Name the series. If it's animated, odds are we can match it — and popular requests become permanent styles.",
  },
  {
    title: "Commercial use",
    body: "Logos, banners, emotes and merch licensing are quoted case by case. Tell us what you're building.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-hero-glow border-b border-line">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl text-cream sm:text-5xl">
            Get In <span className="text-gradient">Touch</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            Send us a message — we reply within 24 hours.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <ContactForm />
        <div className="grid gap-6 content-start">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <h2 className="text-base font-semibold text-cream">{r.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
