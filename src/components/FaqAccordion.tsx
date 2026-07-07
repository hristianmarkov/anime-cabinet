import type { StyleFaq } from "@/data/types";

export function FaqAccordion({ faqs }: { faqs: StyleFaq[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {faqs.map((faq) => (
        <details key={faq.q} className="faq-item group px-6 py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-cream">
            {faq.q}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
