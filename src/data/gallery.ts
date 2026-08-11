import { allStyles } from "./styles";
import { artSrc, artAlt, getArt } from "./art";

export interface StyleSlider {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}

export interface StyleExample {
  id: string;
  src: string;
  label: string;
  alt: string;
}

export interface StyleShowcase {
  slug: string;
  /** Single before/after pair for the product-page slider and style cards */
  slider: StyleSlider;
  /** Finished portrait thumbnails below the slider */
  examples: StyleExample[];
}

function styleArt(slug: string, suffix: string) {
  const file = `${slug}-${suffix}.jpg`;
  return { src: artSrc(file), alt: artAlt(file) };
}

export const styleShowcases: Record<string, StyleShowcase> = Object.fromEntries(
  allStyles.map((s) => {
    const slug = s.slug;
    const before = styleArt(slug, "before");
    const after = styleArt(slug, "after");
    const slider: StyleSlider = {
      before: before.src,
      after: after.src,
      beforeAlt: before.alt,
      afterAlt: after.alt,
    };
    const examples: StyleExample[] = [1, 2, 3].map((n) => {
      const file = `${slug}-example-${n}.jpg`;
      const alt = artAlt(file);
      return {
        id: `${slug}-example-${n}`,
        src: artSrc(file),
        label: `Example ${n}`,
        alt,
      };
    });
    return [slug, { slug, slider, examples }];
  })
);

export function getShowcase(slug: string): StyleShowcase | undefined {
  return styleShowcases[slug];
}

/** Masonry gallery items for homepage */
export interface GalleryItem {
  id: string;
  img: string;
  url: string;
  height: number;
  styleName: string;
  alt: string;
}

export const galleryItems: GalleryItem[] = allStyles.slice(0, 16).map((s, i) => {
  const file = `gallery-${s.slug}.jpg`;
  const asset = getArt(file);
  return {
    id: s.slug,
    img: asset?.src ?? artSrc(file),
    url: `/portraits/${s.slug}`,
    height: 380 + (i % 5) * 80,
    styleName: s.name,
    alt: asset?.alt ?? artAlt(file),
  };
});

/** Homepage hero tile images keyed by style slug */
export const heroArtBySlug: Record<string, { src: string; alt: string }> = Object.fromEntries(
  [
    { slug: "naruto", file: "hero-naruto.jpg" },
    { slug: "one-piece", file: "hero-one-piece.jpg" },
    { slug: "rick-and-morty", file: "hero-rick-and-morty.jpg" },
    { slug: "the-simpsons", file: "hero-the-simpsons.jpg" },
  ].map(({ slug, file }) => {
    const asset = getArt(file);
    return [slug, { src: asset?.src ?? artSrc(file), alt: asset?.alt ?? artAlt(file) }];
  })
);
