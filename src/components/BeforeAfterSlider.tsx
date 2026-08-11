"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
  compact?: boolean;
  /** When false, slider is display-only (e.g. inside a link card) */
  interactive?: boolean;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt,
  beforeAlt,
  afterAlt,
  className = "",
  compact = false,
  interactive = true,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl border border-line bg-surface ${interactive ? "" : "pointer-events-none"} ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* After (full) */}
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={afterSrc}
          alt={afterAlt ?? `${alt} — after`}
          fill
          className="object-cover"
          sizes={compact ? "300px" : "600px"}
          unoptimized
        />
      </div>

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <div className="relative h-full w-full">
          <Image
            src={beforeSrc}
            alt={beforeAlt ?? `${alt} — before`}
            fill
            className="object-cover"
            sizes={compact ? "300px" : "600px"}
            unoptimized
          />
        </div>
      </div>

      {/* Divider + handle */}
      <div
        className="absolute bottom-0 top-0 z-10 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <button
          type="button"
          aria-label="Drag to compare before and after"
          onPointerDown={onPointerDown}
          className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-accent shadow-glow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M8 5l-5 7 5 7V5zm8 0v14l5-7-5-7z" />
          </svg>
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream">
        Before
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream">
        After
      </div>
    </div>
  );
}
