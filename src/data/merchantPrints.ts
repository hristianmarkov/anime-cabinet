import { PRINT_FORMATS, PRINT_SIZES, orderTotalCents, type PrintSize } from "./pricing";
import type { PortraitStyle } from "./types";

const printDetails = {
  poster: {
    label: "Matte Poster",
    material: "Matte paper",
    description: "The artwork is printed on premium matte paper for a low-glare finish. The poster is supplied without a frame, so you can choose a display that suits your space.",
  },
  canvas: {
    label: "Gallery-Wrapped Canvas",
    material: "Canvas",
    description: "The artwork is printed on gallery-wrapped canvas. The wrapped edges give the print depth for display without a separate frame.",
  },
  framed: {
    label: "Black Framed Print",
    material: "Paper with a black frame",
    description: "The portrait is supplied in a black frame. The simple dark border gives the artwork a defined edge and works with both colorful and muted illustrations.",
  },
} as const;

type PrintKind = keyof typeof printDetails;

function isPrintKind(value: string): value is PrintKind {
  return Object.hasOwn(printDetails, value);
}

function isPrintSize(value: string): value is PrintSize {
  return PRINT_SIZES.some((size) => value === size);
}

// These describe the commissioned portrait styles, independently of the print finish.
const artDescriptions: Record<string, string> = {
  naruto: "Turn your reference photo into a Naruto-inspired ninja portrait with expressive anime linework, a personalized outfit and a scene that fits your character. A village setting or an action pose can give the composition a sense of adventure.",
  "one-piece": "See yourself illustrated as a crew member in a One Piece-inspired pirate portrait. A pose, seafaring outfit and details drawn from your own photo help tell the story, from a quiet moment on deck to a lively crew scene.",
  "one-piece-wanted-poster": "Reimagine your photo as a One Piece-inspired wanted poster, with a pirate portrait set into a parchment-style design. Personalize the name and bounty details for a wall print that feels like it belongs to your own adventure.",
  "dragon-ball-z": "Transform your photo into a Dragon Ball Z-inspired action portrait with an energetic pose, bold contours and a background that complements the movement. Your own features stay recognizable as the scene takes on the look of a battle-anime illustration.",
  "demon-slayer": "Commission a Demon Slayer-inspired portrait with expressive eyes, flowing shapes and an atmospheric background. Use costume colors and pose references to guide the scene and keep your likeness at the center of the artwork.",
  "jujutsu-kaisen": "Give your reference photo a Jujutsu Kaisen-inspired treatment with angular linework, contrasting shadows and a sorcerer-style outfit. The composition can lean toward a restrained character portrait or an energetic, effects-led scene.",
  "attack-on-titan": "Turn a photo into an Attack on Titan-inspired portrait with a dramatic atmosphere and military-fantasy styling. Outfit details and the setting can be shaped around your reference, from an open landscape to a darker, close-up composition.",
  "ghibli-style": "Turn a favorite photo into a Ghibli-inspired portrait with a warm palette, gentle expressions and a storybook atmosphere. A garden, woodland or familiar setting can make the scene feel like a memory from your own life.",
  pokemon: "Turn your photo into a Pokémon-inspired trainer portrait in a colorful adventure scene. Choose an outfit and setting that suit your character, and include notes about the companions you’d like pictured alongside you.",
  "my-hero-academia": "Commission a My Hero Academia-inspired portrait with a personalized hero costume, expressive features and an action-ready pose. Send references for colors, accessories or a character concept to give the illustration your own superhero identity.",
  bleach: "Transform your photo into a Bleach-inspired portrait with clean linework, a dramatic silhouette and an outfit suited to your character. Choose between a quiet, high-contrast composition and a scene with stronger motion and atmospheric effects.",
  "death-note": "Turn your reference photo into a Death Note-inspired portrait with moody lighting, a restrained palette and a psychological-thriller atmosphere. A close portrait or shadowed setting keeps the focus on your expression.",
  "hunter-x-hunter": "Reimagine yourself in a Hunter x Hunter-inspired portrait with adventurous styling, clear outlines and an expressive pose. Use your references to guide the outfit and choose a setting that feels like part of your own story.",
  "spy-x-family": "Create a Spy x Family-inspired portrait with warm expressions, a playful espionage theme and a setting chosen for your photo. An everyday scene or a dressed-up mission look can work for a personal portrait or a gift.",
  "sailor-moon": "Turn your photo into a Sailor Moon-inspired magical-girl portrait with flowing linework, luminous colors and a celestial setting. Personalize the costume, accessories and pose to give the illustration its own character.",
  "one-punch-man": "Commission a One Punch Man-inspired portrait that can capture a deadpan expression or an exaggerated hero pose. Bold linework and a background adapted to your reference make the finished artwork read clearly as wall art.",
  "solo-leveling": "Turn a reference photo into a Solo Leveling-inspired portrait with a darker palette, sharp contrast and a fantasy action setting. Lighting, clothing and pose can be tailored to emphasize your character’s presence in the scene.",
  "bobs-burgers": "Turn your photo into a Bob’s Burgers-inspired cartoon portrait with simplified outlines and familiar everyday humor. Choose a restaurant-style setting or a location from your own life, then personalize clothing and expressions.",
  "family-guy": "Commission a Family Guy-inspired cartoon portrait with bold contours and a playful expression. Use your own photo as the starting point and request an everyday setting, a recognizable outfit or a scene built around a shared joke.",
  "the-simpsons": "Turn your photo into a Simpsons-inspired cartoon portrait with bright colors and simplified features. Personalize the outfit and scene to make the finished print work as a family keepsake, a birthday gift or a piece of playful wall decor.",
  "south-park": "Reimagine a photo as a South Park-inspired portrait with simple cutout-style shapes, bold colors and a playful expression. Outfit and background details from your reference give the deliberately minimal illustration a personal touch.",
  "rick-and-morty": "Transform your photo into a Rick and Morty-inspired cartoon portrait with expressive linework and a colorful sci-fi setting. Use pose and outfit references to anchor the illustration, whether the backdrop is familiar or interdimensional.",
  "avatar-the-last-airbender": "Create an Avatar: The Last Airbender-inspired portrait with flowing movement and a setting shaped by an element of your choice. Costumes, poses and surroundings can be customized around your photo.",
  arcane: "Turn your reference photo into an Arcane-inspired portrait with painterly shading, dramatic lighting and a city-fantasy atmosphere. Your outfit and expression can guide a quieter composition or a scene with stronger visual contrast.",
};

const sizeDescriptions: Record<PrintSize, string> = {
  "12x16": "The 12 × 16 inch format fits a smaller wall, reading nook or gallery-wall arrangement.",
  "18x24": "The 18 × 24 inch format gives the composition more room and works as a focal piece on a larger wall.",
};

export const MERCHANT_PRINT_FORMATS = PRINT_FORMATS.flatMap((format) => {
  const [kind, size] = format.id.split("-");
  if (!isPrintKind(kind) || !isPrintSize(size)) return [];
  return [{
    ...printDetails[kind],
    id: format.id,
    kind,
    size,
    sizeLabel: `${size.replace("x", " × ")} in`,
    priceUsd: orderTotalCents({ characters: 1, currency: "USD", expedited: false, formatId: format.id }) / 100,
  }];
});

export type MerchantPrintFormat = typeof MERCHANT_PRINT_FORMATS[number];

export function merchantPrint(style: PortraitStyle, format: MerchantPrintFormat) {
  const styleDescription = artDescriptions[style.slug];
  if (!styleDescription) throw new Error(`Missing Merchant description for ${style.slug}`);
  const finish = { poster: "Poster", canvas: "Canvas", framed: "Framed Print" }[format.kind];
  const printNames: Record<string, string> = { "ghibli-style": "Ghibli-Style", "the-simpsons": "Simpsons", pokemon: "Pokémon" };
  const label = printNames[style.slug] ?? style.name;
  const title = style.slug === "one-piece-wanted-poster"
    ? `${format.kind === "framed" ? "Framed One Piece Wanted Poster" : format.kind === "canvas" ? "One Piece Bounty Canvas" : "One Piece Wanted Poster"} · ${format.sizeLabel}`
    : `Custom ${label} ${finish} · ${format.sizeLabel}`;
  return {
    sku: `portrait-${style.slug}-${format.id}`,
    groupId: `portrait-${style.slug}-${format.kind}`,
    path: `/portraits/${style.slug}/${format.id}`,
    title,
    description: [
      styleDescription,
      format.description,
      sizeDescriptions[format.size],
      "This made-to-order print includes one person or pet and a high-resolution digital file. Upload a clear reference photo and add notes about the pose, outfit or background. Review an emailed preview and request revisions before the approved portrait goes to print.",
    ].join(" "),
    videoPath: `/merchant-videos/${style.slug}.mp4`,
  };
}
