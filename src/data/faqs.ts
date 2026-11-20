import type { StyleFaq } from "./types";
import { site } from "./site";

/** Global FAQs shown on the /faq page and merged into product pages. */
export const globalFaqs: StyleFaq[] = [
  {
    q: "How does Anime Cabinet work?",
    a: `Pick a style, upload a clear photo of each person (or pet), add any important notes about their appearance or pose, and check out. Our artists create your portrait and email you a preview within ${site.deliveryHours} hours. You get unlimited free revisions until it's perfect, then we deliver the final high-resolution file — and ship any prints you ordered.`,
  },
  {
    q: "Who creates my portrait?",
    a: "Our professional artists review your photos, study the style you chose, and create your portrait with unlimited free revisions until you approve it.",
  },
  {
    q: "How long does delivery take?",
    a: `The standard digital preview is within ${site.deliveryHours} hours once payment and usable references are ready. Priority service offers a ${site.expeditedHours}-hour preview; current pricing appears in the configurator. Revision time is additional. Posters, canvases and framed prints enter production after approval and include free standard delivery to supported destinations. See the [shipping guide](/shipping) for the separate stages.`,
  },
  {
    q: "What kind of photo should I upload?",
    a: "A clear, well-lit photo where the face is fully visible works best. Higher resolution is better. For group portraits, you can upload one group photo or separate photos of each person — our artists will combine them into one scene.",
  },
  {
    q: "What if I don't like the result?",
    a: "You get unlimited free revisions. Tell us exactly what to change — hair, outfit, expression, or any other portrait detail — and our artists will revise until you're happy. We don't consider an order finished until you approve it.",
  },
  {
    q: "Can you draw pets?",
    a: "Absolutely — pets are some of our favourite subjects. A pet counts as one character when ordering. Upload a clear photo of your pet just like you would for a person.",
  },
  {
    q: "Can I order a portrait with more than 6 characters?",
    a: "For groups larger than 6, [contact us](/contact) with the headcount, chosen style and scene you have in mind. We can discuss the arrangement and quote before you place an order.",
  },
  {
    q: "Do you ship prints internationally?",
    a: "Yes, posters, canvases and framed prints include free standard delivery to supported countries. Enter your delivery address in Stripe Checkout.",
  },
  {
    q: "Can I use my portrait as a profile picture or print it myself?",
    a: "Yes — the final file is yours for personal use. Use it as an avatar, print it locally, put it on a mug. Commercial use (logos or merch you sell) needs a separate licence — contact us for pricing.",
  },
  {
    q: "What anime and cartoon styles do you offer?",
    a: "We offer 24 styles including Naruto, One Piece, Dragon Ball Z, Demon Slayer, Jujutsu Kaisen, Ghibli-inspired, The Simpsons, Rick and Morty, Bob's Burgers and many more.",
  },
];
