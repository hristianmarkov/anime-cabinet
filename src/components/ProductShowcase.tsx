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
  const [view, setView] = useState<"slider" | string>("slider");

  return (
    <div className="space-y-4">
      {view === "slider" ? (
        <BeforeAfterSlider
          beforeSrc={showcase.slider.before}
          afterSrc={showcase.slider.after}
          beforeAlt={showcase.slider.beforeAlt}
          afterAlt={showcase.slider.afterAlt}
          alt={`${styleName} custom portrait`}
        />
      ) : (
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line shadow-card">
          <Image
            src={view}
            alt={
              showcase.examples.find((ex) => ex.src === view)?.alt ??
              `${styleName} custom portrait example`
            }
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
            unoptimized
          />
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setView("slider")}
          className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
            view === "slider" ? "border-accent" : "border-line hover:border-line-bright"
          }`}
          aria-label="View before and after slider"
        >
          <Image
            src={showcase.slider.after}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        </button>
        {showcase.examples.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => setView(ex.src)}
            className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
              view === ex.src ? "border-accent" : "border-line hover:border-line-bright"
            }`}
            aria-label={ex.alt}
          >
            <Image
              src={ex.src}
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
