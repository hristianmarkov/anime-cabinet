"use client";

import Link from "next/link";
import type { PortraitStyle } from "@/data/types";
import { useCurrency } from "@/context/CurrencyContext";
import { getShowcase } from "@/data/gallery";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

const badgeStyles: Record<string, string> = {
  bestseller: "bg-gold text-ink",
  popular: "bg-accent text-white",
  new: "bg-electric text-white",
};

const badgeLabels: Record<string, string> = {
  bestseller: "Bestseller",
  popular: "Popular",
  new: "New",
};

export function StyleCard({ style }: { style: PortraitStyle }) {
  const { formatPrice } = useCurrency();
  const showcase = getShowcase(style.slug);

  return (
    <Link
      href={`/portraits/${style.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-line-bright"
    >
      <div className="relative w-full overflow-hidden">
        {showcase ? (
          <BeforeAfterSlider
            beforeSrc={showcase.slider.before}
            afterSrc={showcase.slider.after}
            beforeAlt={showcase.slider.beforeAlt}
            afterAlt={showcase.slider.afterAlt}
            alt={style.productName}
            compact
            interactive={false}
            className="rounded-none border-0"
          />
        ) : null}
        {style.badge && (
          <span className={`absolute left-3 top-3 z-20 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${badgeStyles[style.badge]}`}>
            {badgeLabels[style.badge]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-cream">{style.productName}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{style.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-sm text-faint">
            from <span className="font-semibold text-cream">{formatPrice(style.priceFrom)}</span>
          </span>
          <span className="text-sm font-semibold text-accent group-hover:translate-x-1 transition-transform">Order →</span>
        </div>
      </div>
    </Link>
  );
}
