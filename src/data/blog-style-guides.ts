import type { BlogPost } from "./blog";
import { beforeAfter, figure } from "./blog-blocks";

export const styleGuidePosts: BlogPost[] = [
  {
    slug: "anime-portrait-styles-explained",
    title: "Anime Portrait Styles Explained: From Naruto to Arcane",
    description:
      "Twenty-four hand-drawn portrait styles, two categories, one question — which visual language fits you? A plain-English guide to every style we offer.",
    metaTitle: "Anime Portrait Styles Explained — Full Guide | Anime Cabinet",
    date: "2026-07-10",
    readingMinutes: 5,
    keywords: [
      "anime portrait styles explained",
      "custom anime portrait styles",
      "anime art styles list",
      "portrait style guide anime",
      "types of anime portraits",
    ],
    category: "style",
    intro:
      "Walk into our style gallery and you'll see twenty-four options — shonen action, cozy cartoons, dark fantasy, magical girls, and everything between. That's not overwhelm for its own sake. Each style is a distinct visual language with its own line weight, colour palette, and composition rules. Understanding the difference helps you pick a portrait that feels right on your wall, not just familiar from a thumbnail.",
    sections: [
      {
        heading: "Anime styles: action, drama, and softness",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Our anime collection spans battle shonen like [Naruto](/portraits/naruto), [Dragon Ball Z](/portraits/dragon-ball-z), and [Bleach](/portraits/bleach) — bold linework, dynamic poses, energy effects. Darker options include [Attack on Titan](/portraits/attack-on-titan), [Death Note](/portraits/death-note), and [Solo Leveling](/portraits/solo-leveling). Softer picks like [Ghibli-style](/portraits/ghibli-style) and [Sailor Moon](/portraits/sailor-moon) trade intensity for warmth and painterly light.",
          },
          {
            type: "imageGrid",
            images: [
              { artFile: "gallery-naruto.jpg", caption: "Naruto — sharp cel shading" },
              { artFile: "gallery-ghibli-style.jpg", caption: "Ghibli — painterly warmth" },
              { artFile: "gallery-death-note.jpg", caption: "Death Note — dramatic contrast" },
            ],
            cols: 3,
          },
          {
            type: "paragraph",
            text: "Modern hits round out the lineup: [Jujutsu Kaisen](/portraits/jujutsu-kaisen), [Demon Slayer](/portraits/demon-slayer), [Spy x Family](/portraits/spy-x-family), and [Arcane](/portraits/arcane) each carry the visual identity of their source material. Our artists study the original art direction — not generic 'anime' — so your portrait reads as belonging to that specific world.",
          },
        ],
      },
      {
        heading: "Cartoon styles: humour, family, and nostalgia",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Cartoon styles lean into recognisability and comedy. [The Simpsons](/portraits/the-simpsons) yellows your skin and puts you on the iconic couch. [Bob's Burgers](/portraits/bobs-burgers) places families behind a counter with custom burger puns. [Family Guy](/portraits/family-guy), [South Park](/portraits/south-park), and [Rick and Morty](/portraits/rick-and-morty) each have unmistakable proportions and colour palettes that make guests laugh before they even read the caption.",
          },
          {
            type: "figurePair",
            left: { artFile: "hero-the-simpsons.jpg", caption: "Simpsons — instant recognition" },
            right: { artFile: "bobs-burgers-example-1.jpg", caption: "Bob's Burgers — family warmth" },
          },
          {
            type: "paragraph",
            text: "[Avatar: The Last Airbender](/portraits/avatar-the-last-airbender) sits at the crossover — cartoon format with anime storytelling depth. Every style starts from your photo and includes unlimited revisions until you're happy. The style is the language; your face is the story.",
          },
        ],
      },
    ],
    ctaStyle: "naruto",
    ctaLabel: "Browse All 24 Styles",
  },
  {
    slug: "how-to-choose-anime-portrait-style",
    title: "How to Choose the Right Anime Portrait Style for You",
    description:
      "Can't decide between Demon Slayer and Ghibli? This decision framework matches your personality, photo, and wall to the right style.",
    metaTitle: "How to Choose an Anime Portrait Style | Anime Cabinet",
    date: "2026-07-08",
    readingMinutes: 4,
    keywords: [
      "how to choose anime portrait style",
      "which anime portrait style",
      "pick anime art style",
      "best anime portrait for me",
      "anime portrait style guide",
    ],
    category: "style",
    intro:
      "Style paralysis is real when twenty-four options stare back at you. Most customers don't pick based on technical art differences — they pick based on identity. Which show do you quote? Which visual world do you already imagine yourself inside? Which piece would you actually hang, not just admire in a gallery? Three questions, answered honestly, usually collapse the choice to two or three strong contenders.",
    sections: [
      {
        heading: "Start with the show, not the aesthetic",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "The strongest portraits come from genuine fandom. If you've rewatched [One Piece](/portraits/one-piece) three times, a Straw Hat composition will mean something every time you glance at it. If [Hunter x Hunter](/portraits/hunter-x-hunter) changed how you think about storytelling, that style carries weight a trendy pick can't match. Start with what you love, then check whether your photo suits the style's typical composition.",
          },
          {
            type: "pullQuote",
            text: "Pick the show you'd defend at 2am in a group chat. That's your style.",
          },
          {
            type: "paragraph",
            text: "Action styles like [My Hero Academia](/portraits/my-hero-academia) and [One Punch Man](/portraits/one-punch-man) want photos with energy — mid-laugh, mid-pose, something dynamic. Softer styles like [Ghibli-style](/portraits/ghibli-style) and [Pokemon](/portraits/pokemon) handle calm, gentle expressions beautifully. Dark styles like [Death Note](/portraits/death-note) and [Attack on Titan](/portraits/attack-on-titan) work with serious or dramatic source photos.",
          },
        ],
      },
      {
        heading: "Consider who it's for and where it hangs",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Solo bedroom art can be as bold as you want — [Solo Leveling](/portraits/solo-leveling) shadows, [Arcane](/portraits/arcane) painterly drama. Living room family portraits often lean [Simpsons](/portraits/the-simpsons) or [Bob's Burgers](/portraits/bobs-burgers) because guests recognise them instantly. Couple gifts frequently land on [Jujutsu Kaisen](/portraits/jujutsu-kaisen), [Ghibli-style](/portraits/ghibli-style), or [Spy x Family](/portraits/spy-x-family) — romantic without requiring explanation.",
          },
          {
            type: "beforeAfter",
            beforeFile: "my-hero-academia-before.jpg",
            afterFile: "my-hero-academia-after.jpg",
            caption: "Dynamic source photo → MHA hero composition. Match energy to style.",
          },
          {
            type: "paragraph",
            text: "Still stuck? Order two previews in different styles — many customers do. Or message us with your photo and we'll suggest three options based on what our artists see. The right style feels obvious once you stop overthinking it.",
          },
        ],
      },
    ],
    ctaStyle: "hunter-x-hunter",
    ctaLabel: "Explore Portrait Styles",
  },
  {
    slug: "ninja-vs-pirate-vs-superhero-portrait-styles",
    title: "Ninja vs Pirate vs Superhero Portrait Styles Compared",
    description:
      "Naruto shinobi, One Piece pirates, or My Hero Academia heroes — three iconic archetypes, three completely different portrait energies.",
    metaTitle: "Ninja vs Pirate vs Superhero Portrait Styles | Anime Cabinet",
    date: "2026-07-05",
    readingMinutes: 4,
    keywords: [
      "naruto vs one piece portrait",
      "ninja pirate superhero portrait",
      "anime portrait style comparison",
      "my hero academia vs naruto portrait",
      "best shonen portrait style",
    ],
    category: "style",
    intro:
      "Shonen fandom often collapses into three archetypes: the ninja, the pirate, and the superhero. Each maps to a portrait style with distinct visual grammar — and picking between them says something about how you want to see yourself animated. This isn't about which show is better. It's about which visual language fits your photo, your personality, and your wall.",
    sections: [
      {
        heading: "The ninja: precision and identity",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[Naruto](/portraits/naruto) portraits emphasise headbands, village affiliation, and jutsu poses. The art style features sharp cel shading, expressive eyes, and backgrounds that place you in the Hidden Leaf or beyond. Ninja portraits work for solo commissions and clan-style family groups. They're identity-forward — you choose your village, your outfit, your technique.",
          },
          {
            type: "figure",
            artFile: "hero-naruto.jpg",
            caption: "Naruto style: headband, village, jutsu — identity made visible.",
            wide: true,
          },
        ],
      },
      {
        heading: "The pirate: adventure and crew energy",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[One Piece](/portraits/one-piece) and [wanted poster](/portraits/one-piece-wanted-poster) styles lean into adventure — ship decks, exaggerated grins, crew compositions. Pirates scale beautifully to friend groups and couples. The wanted poster format adds custom bounties and epithets that spark hours of debate. If your photo has multiple people laughing together, pirate styles often compose more naturally than solo-hero frames.",
          },
          {
            type: "figurePair",
            left: { artFile: "hero-one-piece.jpg", caption: "One Piece crew energy" },
            right: { artFile: "gallery-one-piece-wanted-poster.jpg", caption: "Wanted poster format" },
          },
        ],
      },
      {
        heading: "The superhero: power and optimism",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[My Hero Academia](/portraits/my-hero-academia) portraits channel hero academia energy — costumes, quirks, bold colour blocking. [Dragon Ball Z](/portraits/dragon-ball-z) pushes further into power scaling — auras, powered-up forms, energy blasts. Superhero styles reward dynamic source photos and fans who want to look capable, not just cool. [One Punch Man](/portraits/one-punch-man) adds deadpan comedy for fans who want power without taking it seriously.",
          },
          {
            type: "imageGrid",
            images: [
              { artFile: "review-dragon-ball-z-01.jpg", caption: "DBZ power" },
              { artFile: "review-my-hero-academia-03.jpg", caption: "MHA hero" },
              { artFile: "review-one-punch-man-01.jpg", caption: "OPM deadpan" },
            ],
            cols: 3,
          },
        ],
      },
    ],
    ctaStyle: "naruto",
    ctaLabel: "Compare Shonen Styles",
  },
  {
    slug: "dark-fantasy-vs-cute-anime-portrait-styles",
    title: "Dark Fantasy vs Cute Anime Portrait Styles: Finding Your Tone",
    description:
      "Death Note shadows or Pokemon warmth? How to pick between dark fantasy and cute anime portrait styles based on mood, room, and personality.",
    metaTitle: "Dark Fantasy vs Cute Anime Portrait Styles | Anime Cabinet",
    date: "2026-07-02",
    readingMinutes: 4,
    keywords: [
      "dark anime portrait style",
      "cute anime portrait style",
      "dark vs cute anime art",
      "death note vs pokemon portrait",
      "anime portrait mood guide",
    ],
    category: "style",
    intro:
      "Tone might be the most underrated factor in portrait style selection. Two customers with identical photos might pick [Death Note](/portraits/death-note) and [Pokemon](/portraits/pokemon) respectively — not because they watch different amounts of anime, but because they want different emotional registers on their wall. Dark fantasy and cute anime aren't opposites so much as different rooms in the same house.",
    sections: [
      {
        heading: "Dark fantasy: drama, shadow, and weight",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Dark styles — [Attack on Titan](/portraits/attack-on-titan), [Death Note](/portraits/death-note), [Bleach](/portraits/bleach), [Solo Leveling](/portraits/solo-leveling), [Arcane](/portraits/arcane) — use high contrast, dramatic lighting, and compositions that feel cinematic. They suit bedrooms, offices, and fans who want their portrait to look like a key visual, not a sticker.",
          },
          {
            type: "beforeAfter",
            beforeFile: "death-note-before.jpg",
            afterFile: "death-note-after.jpg",
            caption: "Death Note style: dramatic lighting transforms an ordinary photo into something noir.",
          },
          {
            type: "paragraph",
            text: "These styles work best when your source photo has strong facial structure or a serious expression. Our artists amplify what's already there — they don't force drama onto a goofy grin unless you ask.",
          },
        ],
      },
      {
        heading: "Cute anime: warmth, colour, and comfort",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Cute styles — [Pokemon](/portraits/pokemon), [Ghibli-style](/portraits/ghibli-style), [Sailor Moon](/portraits/sailor-moon), [Spy x Family](/portraits/spy-x-family) — favour soft palettes, rounded features, and compositions that feel inviting. They're living room friendly, kid-safe, and perfect for gifts where you want joy without edge.",
          },
          {
            type: "figurePair",
            left: { artFile: "pokemon-example-2.jpg", caption: "Pokemon — companion energy" },
            right: { artFile: "ghibli-style-example-1.jpg", caption: "Ghibli — storybook warmth" },
          },
          {
            type: "paragraph",
            text: "Many customers mix tones across multiple portraits — dark solo art for the bedroom, cute family piece for the hallway. Your wall doesn't need one personality. Neither do you.",
          },
        ],
      },
    ],
    ctaStyle: "death-note",
    ctaLabel: "Browse Dark & Cute Styles",
  },
  {
    slug: "best-anime-portrait-styles-for-couples",
    title: "Best Anime Portrait Styles for Couples (Ranked by Vibe)",
    description:
      "From Ghibli picnics to JJK back-to-back compositions — the portrait styles couples order most, and why each one works.",
    metaTitle: "Best Anime Portrait Styles for Couples | Anime Cabinet",
    date: "2026-06-30",
    readingMinutes: 4,
    keywords: [
      "best anime portrait for couples",
      "couple anime portrait styles",
      "anime couple art styles",
      "matching anime portrait styles",
      "couple portrait style guide",
    ],
    category: "style",
    intro:
      "Couple portraits are a different design problem than solo commissions. The composition needs to show two people as a unit — shared space, complementary poses, a visual story about the relationship. Some styles handle this naturally; others need creative direction in the order notes. After thousands of couple orders, clear patterns emerge about which styles couples love most and why.",
    sections: [
      {
        heading: "Warm and romantic",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[Ghibli-style](/portraits/ghibli-style) leads for couples who want tenderness — invented picnic scenes, train rides, quiet moments with painterly light. [Sailor Moon](/portraits/sailor-moon) appeals to couples who share magical girl nostalgia. [Spy x Family](/portraits/spy-x-family) adds sophistication with a wink — elegant enough for framing, playful enough to feel like you.",
          },
          {
            type: "figure",
            artFile: "review-ghibli-style-03.jpg",
            caption: "Ghibli couple portraits feel like shared memories — even when the scene is invented.",
            wide: true,
          },
        ],
      },
      {
        heading: "Energetic and playful",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[Jujutsu Kaisen](/portraits/jujutsu-kaisen) back-to-back compositions suit competitive couples. [Rick and Morty](/portraits/rick-and-morty) duos work for pairs who roast each other lovingly. [One Piece](/portraits/one-piece) crew scenes scale to couples who want adventure energy — two nakama on a ship deck, grins included.",
          },
          {
            type: "figurePair",
            left: { artFile: "jujutsu-kaisen-example-2.jpg", caption: "JJK — back-to-back energy" },
            right: { artFile: "rick-and-morty-example-1.jpg", caption: "Rick and Morty — chaotic duo" },
          },
        ],
      },
      {
        heading: "Classic and recognisable",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[The Simpsons](/portraits/the-simpsons) couch scene remains the most ordered couple cartoon — yellow skin, shared sofa, instant readability. [Family Guy](/portraits/family-guy) living room compositions offer a similar vibe with different proportions. For anime couples who want iconic shonen energy, [Naruto](/portraits/naruto) matching headbands and [Demon Slayer](/portraits/demon-slayer) hashira-style compositions deliver drama without sacrificing warmth.",
          },
          {
            type: "paragraph",
            text: "Whatever style you pick, describe your dynamic in the notes. Height differences, who leans on whom, inside jokes — our artists use those details to make the portrait feel like you, not like stock characters.",
          },
        ],
      },
    ],
    ctaStyle: "ghibli-style",
    ctaLabel: "Order a Couple Portrait",
  },
  {
    slug: "best-portrait-styles-for-families-and-pets",
    title: "Best Portrait Styles for Families and Pets",
    description:
      "Simpsons couch scenes, Pokemon trainer portraits, and Bob's Burgers counters — which styles handle families (and pets) best.",
    metaTitle: "Best Portrait Styles for Families & Pets | Anime Cabinet",
    date: "2026-06-28",
    readingMinutes: 4,
    keywords: [
      "family anime portrait styles",
      "pet anime portrait style",
      "best cartoon family portrait",
      "pokemon pet portrait style",
      "family portrait anime style",
    ],
    category: "style",
    intro:
      "Family portraits add complexity — multiple faces, age ranges, sometimes a dog who won't sit still in any photo. Pets aren't accessories in these orders; they're co-stars. The best family and pet styles are built for group composition, expressive character design, and the kind of warmth that makes grandparents and teenagers agree it's worth hanging.",
    sections: [
      {
        heading: "Cartoon styles built for groups",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[The Simpsons](/portraits/the-simpsons) couch is the gold standard — everyone knows the format, everyone fits on the sofa, pets included. [Bob's Burgers](/portraits/bobs-burgers) puts families behind a counter with custom restaurant signage and burger puns. [Family Guy](/portraits/family-guy) living room scenes handle larger groups with the same instant recognisability.",
          },
          {
            type: "beforeAfter",
            beforeFile: "bobs-burgers-before.jpg",
            afterFile: "bobs-burgers-after.jpg",
            caption: "Family photo → Bob's Burgers counter scene. Everyone recognisable, pun optional.",
          },
        ],
      },
      {
        heading: "Anime styles that love pets",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[Pokemon](/portraits/pokemon) trainer portraits with your actual pet as the companion are our most emotional pet orders — instant tears at unwrapping. [Ghibli-style](/portraits/ghibli-style) family scenes handle soft, painterly group compositions. [Spy x Family](/portraits/spy-x-family) works when the dog is Bond and everyone accepts that. [One Piece](/portraits/one-piece) crew scenes scale to extended friend-family groups.",
          },
          {
            type: "imageGrid",
            images: [
              { artFile: "review-pokemon-03.jpg", caption: "Pokemon + pet companion" },
              { artFile: "review-the-simpsons-03.jpg", caption: "Simpsons family couch" },
              { artFile: "review-spy-x-family-03.jpg", caption: "Spy x Family elegance" },
            ],
            cols: 3,
          },
        ],
      },
      {
        heading: "Practical tips for group orders",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "One clear photo per person works better than one group shot where faces are tiny. Mention who's who in the notes, including pets. Specify standing order, couch arrangement, and any props. Larger groups than six? Contact us for a custom quote — we've done clan-sized [Naruto](/portraits/naruto) families and full Straw Hat crews.",
          },
          {
            type: "paragraph",
            text: "The best family portrait is the one where every member — two-legged and four — looks like themselves. Style choice matters, but clear photos and detailed notes matter more.",
          },
        ],
      },
    ],
    ctaStyle: "the-simpsons",
    ctaLabel: "Order a Family Portrait",
  },
];
