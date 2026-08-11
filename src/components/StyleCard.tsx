"use client";

import Image from "next/image";
import Link from "next/link";
import type { PortraitStyle } from "@/data/types";
import { useCurrency } from "@/context/CurrencyContext";
import { getShowcase } from "@/data/gallery";

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
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={showcase.slider.after}
              alt={showcase.slider.afterAlt ?? style.productName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            />
          </div>
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
