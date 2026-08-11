import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@/data/gallery";

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          className="group relative block overflow-hidden rounded-xl border border-line bg-surface"
        >
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={item.img}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            />
          </div>
          <span className="absolute bottom-2 left-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-semibold text-cream">
            {item.styleName}
          </span>
        </Link>
      ))}
    </div>
  );
}
