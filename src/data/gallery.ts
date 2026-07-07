import { allStyles } from "./styles";

/** Placeholder showcase images — replace with real before/after pairs (see IMAGES-TODO.md) */
function picsum(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export interface ShowcaseExample {
  id: string;
  before: string;
  after: string;
  label?: string;
}

export interface StyleShowcase {
  slug: string;
  primary: ShowcaseExample;
  examples: ShowcaseExample[];
}

const styleSeeds = allStyles.map((s) => s.slug);

export const styleShowcases: Record<string, StyleShowcase> = Object.fromEntries(
  styleSeeds.map((slug, i) => {
    const seed = slug.replace(/-/g, "");
    const primary: ShowcaseExample = {
      id: `${slug}-primary`,
      before: picsum(`${seed}b`, 800, 1000),
      after: picsum(`${seed}a`, 800, 1000),
      label: "Example transformation",
    };
    const examples: ShowcaseExample[] = [1, 2, 3].map((n) => ({
      id: `${slug}-ex-${n}`,
      before: picsum(`${seed}b${n}`, 400, 500),
      after: picsum(`${seed}a${n}`, 400, 500),
      label: `Example ${n}`,
    }));
    return [slug, { slug, primary, examples }];
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
}

export const galleryItems: GalleryItem[] = allStyles.slice(0, 16).map((s, i) => ({
  id: s.slug,
  img: picsum(`gallery-${s.slug}`, 600, 400 + (i % 4) * 120),
  url: `/portraits/${s.slug}`,
  height: 380 + (i % 5) * 80,
  styleName: s.name,
}));
