"use client";

import type { PortraitStyle } from "@/data/types";
import { getShowcase } from "@/data/gallery";
import { getStyleSeoExtra } from "@/data/styles-seo-extras";
import { site } from "@/data/site";
import { PriceFrom } from "./PriceFrom";
import { ProductShowcase } from "./ProductShowcase";

export function ProductStyleHero({ style }: { style: PortraitStyle }) {
  const showcase = getShowcase(style.slug);
  const seoExtra = getStyleSeoExtra(style.slug);

  return (
    <>
      <p className="mt-3 text-lg font-medium" style={{ color: style.accent }}>
        {style.productName} — from <PriceFrom usd={style.priceFrom} prefix="" />
      </p>

      {showcase && (
        <div className="mt-8">
          <ProductShowcase showcase={showcase} styleName={style.name} />
        </div>
      )}

      <div className="prose-invert mt-8 space-y-4">
        {style.description.map((para) => (
          <p key={para.slice(0, 32)} className="leading-relaxed text-muted">
            {para}
          </p>
        ))}
        {seoExtra && (
          <p className="leading-relaxed text-muted">{seoExtra}</p>
        )}
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          "Created by professional artists",
          "Unlimited free revisions",
          `Preview within ${site.deliveryHours} hours (priority 24h available)`,
          "Worldwide print shipping — cost at checkout",
        ].map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-cream">
            <span className="mt-0.5 text-accent" aria-hidden="true">✓</span>
            {point}
          </li>
        ))}
      </ul>
    </>
  );
}
