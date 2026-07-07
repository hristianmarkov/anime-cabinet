# Image Shopping List

Every image slot on the site currently shows a styled placeholder tile (the `ArtPlaceholder` component). Replace them with real example artwork as you commission it. This file lists exactly what to produce, where it goes, and at what size.

## How to swap a placeholder for a real image

1. Drop the image into `public/art/` (create the folder), e.g. `public/art/naruto-1.jpg`.
2. Replace the `<ArtPlaceholder ... />` in the listed file with:

```tsx
<Image src="/art/naruto-1.jpg" alt="Custom Naruto portrait example of a couple drawn as Hidden Leaf shinobi" width={800} height={1000} className="aspect-[4/5] rounded-2xl border border-line object-cover shadow-card" />
```

(`import Image from "next/image"` at the top if not present.) Always write a descriptive `alt` — it's an SEO ranking input.

## Priority 1 — Homepage hero (4 images)

File: `src/app/page.tsx` (hero section)
Size: 800x1000px (4:5), JPG/WebP

| Slot | What to commission |
| --- | --- |
| Hero 1 | Naruto-style single-person portrait (your best, most recognisable piece) |
| Hero 2 | One Piece wanted poster (couple or striking solo) |
| Hero 3 | Ghibli-style couple or pet scene (warm, painterly) |
| Hero 4 | Simpsons-style family couch scene |

These four sell the whole site — make them your strongest work. Ideally show the source photo + result side by side in at least one.

## Priority 2 — Style cards (32 images, one per style)

File: `src/components/StyleCard.tsx` (used on homepage + /portraits grid)
Size: 800x1000px (4:5)

One flagship example per style, same list as the product pages below. The card image and product "Example artwork 1" can be the same file.

## Priority 3 — Product page examples (2 per style, 64 total)

File: `src/app/portraits/[style]/page.tsx` (two `ArtPlaceholder`s per page)
Size: 800x1000px (4:5)

For each of the 32 styles, two examples — ideally one solo portrait and one couple/group so buyers can picture both order types:

Anime: naruto, one-piece, one-piece-wanted-poster, dragon-ball-z, demon-slayer, jujutsu-kaisen, attack-on-titan, ghibli-style, pokemon, pokemon-trading-card, my-hero-academia, bleach, death-note, hunter-x-hunter, chainsaw-man, spy-x-family, sailor-moon, one-punch-man, solo-leveling, frieren, berserk, custom-anime-style

Cartoons: bobs-burgers, family-guy, american-dad, the-simpsons, south-park, rick-and-morty, futurama, avatar-the-last-airbender, adventure-time, arcane

Tip: don't block launch on all 64. Launch with Priority 1 + the 5 bestseller styles fully covered, then fill in weekly — each new real example is fresh content Google indexes.

## Priority 4 — Nice-to-haves

| Slot | Where | Notes |
| --- | --- | --- |
| Before/after strips | Homepage "How It Works" cards | Photo → sketch → final, 1200x400px. Huge conversion booster. |
| Blog header images | `src/data/blog.ts` posts (add an `image` field + render it) | 1200x630px, reuse product examples |
| Custom OG image | Currently auto-generated from text (`src/app/opengraph-image.tsx`) | Replace with a designed 1200x630 collage of best artwork when available |
| Favicon | Currently uses `public/logo.png` | Optional: dedicated 32x32/180x180 versions |

## Legal note on example artwork

Use only artwork you commissioned/own, drawn from photos of people who consented to display (or yourselves/your team — the standard move for a new studio). Don't screenshot competitors' portfolios or use official show stills.
