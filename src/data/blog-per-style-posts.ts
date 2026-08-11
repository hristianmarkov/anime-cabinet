import type { BlogPost } from "./blog";
import { beforeAfter, figure } from "./blog-blocks";
import { styleBlogConfigs, type StyleBlogConfig } from "./blog-per-style-config";
import { site } from "./site";

function heroImage(slug: string): string {
  return `${slug}-after.jpg`;
}

function portraitLink(c: StyleBlogConfig, label?: string): string {
  const text = label ?? `Create your ${c.inspiredLabel} custom poster`;
  return `[${text}](/portraits/${c.slug})`;
}

function transformSlug(c: StyleBlogConfig): string {
  return `${c.slug}-inspired-custom-poster`;
}

function giftSlug(c: StyleBlogConfig): string {
  return `${c.slug}-inspired-poster-gift-ideas`;
}

function buildTransformPost(c: StyleBlogConfig): BlogPost {
  const slug = transformSlug(c);
  const giftLink = `[${c.inspiredLabel} gift ideas](/blog/${giftSlug(c)})`;
  const primaryKw = `${c.inspiredLabel} custom poster`;
  const styleName = c.name;

  return {
    slug,
    title: `How to Turn Your Photo into a ${styleName}-Inspired Custom Poster`,
    description: `Turn your photo into ${c.inspiredLabel} custom artwork — style-specific tips, photo guidance, before-and-after examples, and how to order your hand-drawn poster.`,
    metaTitle: `${primaryKw.charAt(0).toUpperCase() + primaryKw.slice(1)} From Your Photo`,
    date: c.dateTransform,
    readingMinutes: 5,
    keywords: [primaryKw, ...c.transformKeywords],
    category: "style",
    heroImage: heroImage(c.slug),
    intro: `A ${primaryKw} starts with a photo you already have — not a character sheet, not AI slop, but your face translated into ${styleName} visual language by a human artist. Whether you want wall art for yourself or a gift that only exists because someone you love exists, the process is the same: pick the style, upload a clear photo, describe the scene, approve the preview. This guide walks through what makes the ${styleName}-inspired look unique, which photos work best, and how we keep you recognisable inside the style. For gift inspiration, see our ${giftLink}.`,
    sections: [
      {
        heading: `What Makes the ${styleName}-Inspired Look Unique?`,
        paragraphs: [],
        blocks: [
          { type: "paragraph", text: c.aesthetic },
          ...(c.pullQuote
            ? [{ type: "pullQuote" as const, text: c.pullQuote }]
            : []),
          {
            type: "figure",
            artFile: c.galleryFile,
            caption: `${c.inspiredLabel} custom artwork — hand-drawn style study from our gallery.`,
          },
          {
            type: "paragraph",
            text: `The goal is always inspired style, not imitation of copyrighted characters. Your ${primaryKw} should feel like it belongs in that world's art direction while starring people everyone in your life recognises. ${portraitLink(c)} to browse examples and pricing.`,
          },
        ],
      },
      {
        heading: "What Kind of Photo Works Best?",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `Great ${primaryKw} results begin with a clear source photo. Our artists need to see facial structure, hair, and expression — the raw material they translate into ${styleName}-inspired linework and colour.`,
          },
          { type: "list", items: c.photoTips },
          {
            type: "paragraph",
            text: `Not sure your selfie will work? Upload it anyway — we review every order and suggest tweaks before drawing. Most phone photos taken in daylight are perfectly fine for ${portraitLink(c, `${c.inspiredLabel} custom poster orders`)}.`,
          },
        ],
      },
      {
        heading: "Poster Ideas for Couples, Friends and Solo Portraits",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `The best ${primaryKw} orders come with a story: an anniversary, a inside joke, a friend group's shared obsession. Here are ideas customers love for this style:`,
          },
          { type: "list", items: c.posterIdeas },
          ...(c.relatedSlugs
            ? [
                {
                  type: "stylePills" as const,
                  slugs: c.relatedSlugs,
                  intro: "Explore related styles:",
                },
              ]
            : []),
        ],
      },
      {
        heading: "How We Keep the People Recognisable",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: c.recogniseDetail,
          },
          {
            type: "paragraph",
            text: `Every order includes unlimited revisions. If the first preview is 90% perfect but the nose needs a tweak, we adjust until you approve. That is how a ${primaryKw} becomes heirloom wall art instead of a novelty filter. ${portraitLink(c)} when you are ready.`,
          },
        ],
      },
      {
        heading: "Before-and-After Examples",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `See how a real customer photo becomes ${c.inspiredLabel} custom artwork — same person, new visual world:`,
          },
          beforeAfter(
            c.slug,
            `Real photo → finished ${c.inspiredLabel} custom poster. Likeness preserved, style transformed.`,
            c.name
          ),
          {
            type: "figure",
            artFile: c.galleryFile,
            caption: `Gallery example — ${c.inspiredLabel} custom artwork ready to print.`,
          },
        ],
      },
      {
        heading: "How to Order Your Custom Poster",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `Ordering takes minutes: visit ${portraitLink(c)}, upload your photo, choose digital or print, and describe your vision in the notes field — poses, background, outfit colours, inside jokes. Standard preview delivery is within ${site.deliveryHours} hours; priority delivery is available if you are on a deadline.`,
          },
          {
            type: "paragraph",
            text: `Approve the preview, request revisions if needed, and download or receive your print. Looking for present ideas? Read our ${giftLink} for couples, friends, and solo portrait inspiration. Your ${primaryKw} is one order away.`,
          },
        ],
      },
    ],
    ctaStyle: c.slug,
    ctaLabel: `Order ${styleName} Portrait`,
  };
}

function buildGiftPost(c: StyleBlogConfig): BlogPost {
  const slug = giftSlug(c);
  const transformLink = `[how to turn your photo into a ${c.inspiredLabel} custom poster](/blog/${transformSlug(c)})`;
  const primaryKw = `${c.inspiredLabel} gift`;

  return {
    slug,
    title: c.giftTitle,
    description: `${primaryKw.charAt(0).toUpperCase() + primaryKw.slice(1)} ideas for couples, friends, and fans — personalised poster inspiration, photo tips, and how to order hand-drawn ${c.inspiredLabel} custom artwork.`,
    metaTitle: `${c.giftTitle}`,
    date: c.dateGift,
    readingMinutes: 5,
    keywords: [primaryKw, ...c.giftKeywords],
    category: "gift",
    heroImage: heroImage(c.slug),
    intro: `The best ${primaryKw} is not another figure they already pre-ordered — it is custom artwork starring them inside a world they love. A ${c.inspiredLabel} custom poster turns a couple selfie, friend-group photo, or solo portrait into wall art that sparks stories every time someone visits. Unlike mass-produced merch, every poster is hand-drawn from their photo with unlimited revisions until it feels right. Below: what makes this style special, photo tips, poster ideas, recognisability, real examples, and how to order. New to the process? Start with our guide on ${transformLink}.`,
    sections: [
      {
        heading: `What Makes the ${c.name}-Inspired Look Unique?`,
        paragraphs: [],
        blocks: [
          { type: "paragraph", text: c.aesthetic },
          {
            type: "figure",
            artFile: c.galleryFile,
            caption: `${c.inspiredLabel} custom artwork — a gift that only exists for them.`,
          },
          {
            type: "paragraph",
            text: `We use inspired style language only — never official or licensed character art. Your gift says 'I know your fandom' without copying a specific protagonist. ${portraitLink(c, `Order a ${c.inspiredLabel} custom poster`)} to see pricing and turnaround.`,
          },
        ],
      },
      {
        heading: "What Kind of Photo Works Best?",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `Surprise gifts succeed when the source photo is clear. You do not need a professional shoot — a well-lit candid from their camera roll usually works for a ${primaryKw}.`,
          },
          { type: "list", items: c.photoTips },
          {
            type: "paragraph",
            text: `Stealth mode: grab a photo from a shared album or ask a mutual friend. If you only have one mediocre selfie, upload it — our team advises before drawing. ${portraitLink(c)} accepts orders 24/7.`,
          },
        ],
      },
      {
        heading: "Poster Gift Ideas for Couples, Friends and Solo Portraits",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `Match the ${primaryKw} to their personality and your relationship:`,
          },
          { type: "list", items: c.posterIdeas },
          ...(c.pullQuote
            ? [{ type: "pullQuote" as const, text: c.pullQuote, attribution: "Customer feedback, paraphrased" }]
            : []),
          ...(c.relatedSlugs
            ? [
                {
                  type: "stylePills" as const,
                  slugs: c.relatedSlugs,
                  intro: "Explore related styles:",
                },
              ]
            : []),
        ],
      },
      {
        heading: "How We Keep the People Recognisable",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: c.recogniseDetail,
          },
          {
            type: "paragraph",
            text: `Gift reactions depend on instant recognition — they should gasp because it looks like them, not because they guess which character you picked. Revisions are included so you can approve the preview before revealing the ${c.inspiredLabel} custom poster at the party.`,
          },
        ],
      },
      {
        heading: "Before-and-After Examples",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `These ${c.inspiredLabel} custom poster transformations show what your gift could look like — real photos, hand-drawn results:`,
          },
          beforeAfter(
            c.slug,
            `Before and after: ${c.inspiredLabel} custom artwork from a customer photo.`,
            c.name
          ),
        ],
      },
      {
        heading: "Gift timing and presentation tips",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `Order the ${primaryKw} at least a week before birthdays, anniversaries, or holidays — standard preview delivery is within ${site.deliveryHours} hours, plus revision time. Stealth gift orders from shared albums work; upload the best photo you can find and mention the occasion in the notes.`,
          },
          {
            type: "paragraph",
            text: `Frame the finished ${c.inspiredLabel} custom poster for maximum impact, or reveal the digital file over dinner. Either way, unlimited revisions mean you approve the preview before the big moment — so the reaction is gasps, not polite smiles.`,
          },
        ],
      },
      {
        heading: "How to Order Your Custom Poster",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `Head to ${portraitLink(c)}, upload the photo, add order notes with gift context (inside jokes, preferred poses, deadline), and choose digital or framed print. Previews arrive within ${site.deliveryHours} hours standard — build in revision time before birthdays and holidays.`,
          },
          {
            type: "paragraph",
            text: `Wrap a framed print for maximum impact, or reveal the digital file over dinner. For the full transformation walkthrough, read ${transformLink}. A ${primaryKw} beats another hoodie because it only exists for them — and that is the whole point.`,
          },
        ],
      },
    ],
    ctaStyle: c.slug,
    ctaLabel: `Gift a ${c.name} Portrait`,
  };
}

export const styleTransformationPosts: BlogPost[] = styleBlogConfigs.map(buildTransformPost);
export const styleGiftPosts: BlogPost[] = styleBlogConfigs.map(buildGiftPost);
export const perStyleBlogPosts: BlogPost[] = [...styleTransformationPosts, ...styleGiftPosts];
