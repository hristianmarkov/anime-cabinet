"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { GalleryGrid } from "@/components/GalleryGrid";
import type { GalleryItem } from "@/data/gallery";

const Masonry = dynamic(() => import("@/components/Masonry"), { ssr: false });

interface AnimatedGalleryProps {
  items: GalleryItem[];
}

export function AnimatedGallery({ items }: AnimatedGalleryProps) {
  const [showMasonry, setShowMasonry] = useState(false);

  useEffect(() => {
    setShowMasonry(true);
  }, []);

  if (!showMasonry) {
    return <GalleryGrid items={items} />;
  }

  return (
    <Masonry
      items={items}
      animateFrom="bottom"
      blurToFocus
      scaleOnHover
      hoverScale={0.95}
    />
  );
}
