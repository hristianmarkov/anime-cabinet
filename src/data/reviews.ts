/**
 * ============================================================================
 * PLACEHOLDER REVIEWS - REPLACE WITH REAL CUSTOMER REVIEWS BEFORE LAUNCH
 * ============================================================================
 * These are sample/demo reviews to show the layout. Publishing fabricated
 * reviews as if they were from real customers is illegal (FTC fake reviews
 * rule, UK CMA rules) and will get the site penalized by Google.
 *
 * As real reviews come in (from your first orders / Etsy), replace the
 * entries below 1:1. Once you have 5+ real reviews, set
 * `REVIEWS_ARE_REAL = true` — that enables star ratings in the page's
 * structured data (JSON-LD) so Google can show rating stars in search.
 * ============================================================================
 */

export const REVIEWS_ARE_REAL = false;

export interface Review {
  author: string;
  location?: string;
  rating: number; // 1-5
  title: string;
  body: string;
  style: string; // display name of the style ordered
  date: string; // ISO date
}

export const reviews: Review[] = [
  {
    author: "Sample Review",
    location: "United States",
    rating: 5,
    title: "Exactly like the show",
    body:
      "This is placeholder review copy demonstrating the layout. Replace it with a real customer review. Ordered a two-person portrait as an anniversary gift, the likeness was spot on and revisions were fast and friendly.",
    style: "Naruto",
    date: "2026-06-20",
  },
  {
    author: "Sample Review",
    location: "United Kingdom",
    rating: 5,
    title: "Best gift I've ever given",
    body:
      "This is placeholder review copy demonstrating the layout. Replace it with a real customer review. The wanted poster came out incredible — my partner hung it above the desk the same day it arrived.",
    style: "Wanted Poster",
    date: "2026-06-14",
  },
  {
    author: "Sample Review",
    location: "Canada",
    rating: 5,
    title: "They nailed our whole family",
    body:
      "This is placeholder review copy demonstrating the layout. Replace it with a real customer review. Five of us plus the dog, everyone instantly recognisable. The Burger of the Day pun made my wife cry laughing.",
    style: "Bob's Burgers",
    date: "2026-06-08",
  },
  {
    author: "Sample Review",
    location: "Australia",
    rating: 5,
    title: "Looks like official art",
    body:
      "This is placeholder review copy demonstrating the layout. Replace it with a real customer review. The painterly Arcane style is genuinely stunning — friends keep asking which episode it's from.",
    style: "Arcane",
    date: "2026-05-30",
  },
  {
    author: "Sample Review",
    location: "Germany",
    rating: 5,
    title: "Fast, kind, unlimited revisions for real",
    body:
      "This is placeholder review copy demonstrating the layout. Replace it with a real customer review. I asked for three small changes and every one was handled within a day. Final file was huge and print-ready.",
    style: "Ghibli Style",
    date: "2026-05-22",
  },
  {
    author: "Sample Review",
    location: "United States",
    rating: 5,
    title: "My dog is now a Pokemon",
    body:
      "This is placeholder review copy demonstrating the layout. Replace it with a real customer review. They drew my corgi as my companion and it's the best thing I own. Printing a second copy for my desk at work.",
    style: "Pokemon",
    date: "2026-05-15",
  },
];

/**
 * PLACEHOLDER STATS — legacy export; homepage uses StatsBar component.
 * Set SHOW_STATS = false to hide stats entirely until you have real numbers.
 */
export const SHOW_STATS = true;
