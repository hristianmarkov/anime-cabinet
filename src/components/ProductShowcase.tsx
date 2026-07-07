"use client";

import { useState } from "react";
import Image from "next/image";
import type { StyleShowcase } from "@/data/gallery";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface ProductShowcaseProps {
  showcase: StyleShowcase;
  styleName: string;
}

export function ProductShowcase({ showcase, styleName }: ProductShowcaseProps) {
  const [active, setActive] = useState(showcase.primary);

  return (
    <div className="space-y-4">
      <BeforeAfterSlider
        beforeSrc={active.before}
        afterSrc={active.after}
        alt={`${styleName} custom portrait`}
      />
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {[showcase.primary, ...showcase.examples].map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => setActive(ex)}
            className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
              active.id === ex.id ? "border-accent" : "border-line hover:border-line-bright"
            }`}
            aria-label={ex.label ?? "View example"}
          >
            <Image
              src={ex.after}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  );
}
