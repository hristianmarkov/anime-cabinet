/**
 * Image-generation guidance for artists / external tools (admin only).
 * Names the show or cartoon explicitly; subjects are original characters, not existing cast.
 */

export interface StyleArtPrompt {
  styleSlug: string;
  showTitle: string;
  medium: "anime" | "cartoon";
  prompt: string;
  negativePrompt: string;
}

const SHARED_NEGATIVE =
  "photorealistic, 3D render, AI slop, western cartoon unless specified, chibi unless requested, low detail, blurry, distorted faces, extra fingers, extra limbs, wrong number of people, unrecognizable likeness, copied existing named character from the show, official logo, watermark, text, title card, UI";

function posterPrompt(input: {
  showTitle: string;
  medium: "anime" | "cartoon";
  look: string;
  world: string;
  extra?: string;
}): string {
  const kind = input.medium === "anime" ? "anime poster" : "cartoon poster";
  return [
    `Use the uploaded photo(s) only as likeness reference (face shape, hair, skin tone, expression, body type, relationship dynamic). Fully transform the entire image into an authentic ${input.showTitle}-style ${kind}. Do not keep the original photo composition, street clothes, or background.`,
    `Redraw everyone as original characters who clearly belong in ${input.showTitle} — ${input.look}. You may change poses, outfits, camera angle, and action completely.`,
    `Replace the full background with a dramatic ${input.showTitle}-themed scene: ${input.world}.`,
    `The result must read instantly as ${input.showTitle} (${input.medium} linework, color, and atmosphere), while each person stays recognizable as the people from the reference photo.`,
    `Do not paste or copy existing ${input.showTitle} cast members. No logos or text.`,
    input.extra ?? "",
    "Finish like official high-quality key art: cinematic lighting, clean line art, strong emotion, print-ready detail.",
  ]
    .filter(Boolean)
    .join(" ");
}

const PROMPTS: Record<string, Omit<StyleArtPrompt, "styleSlug">> = {
  naruto: {
    showTitle: "Naruto",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Naruto",
      medium: "anime",
      look: "bold shonen linework, expressive Naruto-style eyes, cel shading, shinobi outfits, forehead protectors, kunai pouches, bandages, subtle chakra aura and wind movement",
      world: "Hidden Leaf village energy — rooftops, mountains, swirling leaves, smoke, sunset or battle lighting",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "one-piece": {
    showTitle: "One Piece",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "One Piece",
      medium: "anime",
      look: "adventurous pirate-anime proportions, bold outlines, saturated colors, straw-hat crew energy, sea-worn coats, sashes, belts, dynamic swagger",
      world: "Grand Line adventure — ship deck, ocean waves, storm clouds, tropical islands, golden-hour adventure light",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "one-piece-wanted-poster": {
    showTitle: "One Piece",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "One Piece",
      medium: "anime",
      look: "classic One Piece wanted-poster framing, pirate mugshot charisma, stylized face, bold ink outlines, aged paper texture feel within the art",
      world: "bounty-poster layout on weathered parchment with pirate-world mood (do not add readable text or numbers — leave name/bounty areas blank for us to typeset later)",
      extra: "Composition should feel like an in-universe wanted poster while subjects remain original characters based on the photo.",
    }),
    negativePrompt: `${SHARED_NEGATIVE}, readable words, bounty numbers`,
  },
  "dragon-ball-z": {
    showTitle: "Dragon Ball Z",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Dragon Ball Z",
      medium: "anime",
      look: "muscular shonen anatomy, spiky hair energy, DBZ-style shading, battle-worn gi or training gear, power-up stance, aura and speed lines",
      world: "rocky wasteland, cracked earth, glowing sky, ki explosion lighting",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "demon-slayer": {
    showTitle: "Demon Slayer",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Demon Slayer",
      medium: "anime",
      look: "Taisho-era haori patterns, nichirin blade details, soft yet sharp Ufotable-influenced shading, elegant breathing-style motion",
      world: "wisteria, moonlight forest, embers, water or flame breathing visual effects",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "jujutsu-kaisen": {
    showTitle: "Jujutsu Kaisen",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Jujutsu Kaisen",
      medium: "anime",
      look: "modern dark shonen fashion, high-contrast shadows, cursed-energy effects, confident sorcerer posture",
      world: "urban night Tokyo mood, cursed aura, debris, dramatic blue and red energy accents",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "attack-on-titan": {
    showTitle: "Attack on Titan",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Attack on Titan",
      medium: "anime",
      look: "Survey Corps ODM gear, capes, vertical maneuvering harness, gritty anime realism, intense eyes",
      world: "walls, rooftops, clouds of steam, epic scale sky, battle tension",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "ghibli-style": {
    showTitle: "Studio Ghibli",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Studio Ghibli",
      medium: "anime",
      look: "hand-painted Ghibli film softness, gentle features, natural hair, cozy clothing, warm storybook charm",
      world: "lush countryside, floating clouds, golden afternoon light, whimsical nature details",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  pokemon: {
    showTitle: "Pokémon",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Pokémon",
      medium: "anime",
      look: "Pokémon anime trainer design, bright friendly colors, clean cel anime, adventure outfit, optional companion creature silhouette that is generic (not a specific named Pokémon)",
      world: "route path, tall grass, poké-world town hints, cheerful sky",
      extra: "If a pet is in the order notes, treat it as a partner creature in Pokémon anime style.",
    }),
    negativePrompt: `${SHARED_NEGATIVE}, specific named Pokémon species unless requested in notes`,
  },
  "my-hero-academia": {
    showTitle: "My Hero Academia",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "My Hero Academia",
      medium: "anime",
      look: "hero costume design, bold comic-anime shading, dynamic hero pose, quirk energy effects",
      world: "city skyline, hero training ground, action poster motion blur and impact frames",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  bleach: {
    showTitle: "Bleach",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Bleach",
      medium: "anime",
      look: "soul reaper uniform or stylish shinigami fashion, zanpakuto, flowing fabric, sharp Bleach-era anime edges",
      world: "spiritual pressure, moonlit rooftops, reishi particles, dramatic contrast",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "death-note": {
    showTitle: "Death Note",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Death Note",
      medium: "anime",
      look: "psychological thriller anime realism, sharp shadows, intelligent gaze, minimalist dark wardrobe",
      world: "noir city lights, crimson accent lighting, tense atmosphere (no readable notebook text)",
    }),
    negativePrompt: `${SHARED_NEGATIVE}, readable Death Note text`,
  },
  "hunter-x-hunter": {
    showTitle: "Hunter × Hunter",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Hunter × Hunter",
      medium: "anime",
      look: "adventurer outfits, nen aura hints, expressive HxH-style faces, tactical gear",
      world: "wilderness, ruins, or hunter exam energy with adventurous sky",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "spy-x-family": {
    showTitle: "Spy × Family",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Spy × Family",
      medium: "anime",
      look: "stylish retro-modern fashion, warm family-comedy anime cleanliness, spy elegance when suitable",
      world: "Berlint city charm, cozy interiors or classy evening streets",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "sailor-moon": {
    showTitle: "Sailor Moon",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Sailor Moon",
      medium: "anime",
      look: "magical-girl sparkle, sailor-style costume design, elegant lashes, pastel highlights, graceful pose",
      world: "moonlight, stars, ribbons of light, magical girl transformation energy",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "one-punch-man": {
    showTitle: "One Punch Man",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "One Punch Man",
      medium: "anime",
      look: "hero costume satire or serious hero suit, OPM anime shading, deadpan or epic expression as fits the photo",
      world: "city destruction humor or heroic sky punch lighting",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "solo-leveling": {
    showTitle: "Solo Leveling",
    medium: "anime",
    prompt: posterPrompt({
      showTitle: "Solo Leveling",
      medium: "anime",
      look: "dark fantasy hunter gear, glowing eyes optional, sleek manhwa-anime hybrid rendering, power scaling aura",
      world: "dungeon gates, shadow soldiers mist, purple and blue magical glow",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "bobs-burgers": {
    showTitle: "Bob's Burgers",
    medium: "cartoon",
    prompt: posterPrompt({
      showTitle: "Bob's Burgers",
      medium: "cartoon",
      look: "Bob's Burgers flat 2D sitcom design, simple shapes, thick outlines, warm humor faces",
      world: "Ocean Avenue / diner neighborhood cartoon background",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "family-guy": {
    showTitle: "Family Guy",
    medium: "cartoon",
    prompt: posterPrompt({
      showTitle: "Family Guy",
      medium: "cartoon",
      look: "Family Guy adult-sitcom proportions, bold black outlines, simplified facial features",
      world: "suburban Quahog-style street or living-room cartoon set",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "the-simpsons": {
    showTitle: "The Simpsons",
    medium: "cartoon",
    prompt: posterPrompt({
      showTitle: "The Simpsons",
      medium: "cartoon",
      look: "yellow Simpsons skin tone, overbite charm, Simpsons sitcom linework, Springfield wardrobe",
      world: "Springfield neighborhood, couch gag energy, bright cartoon sky",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "south-park": {
    showTitle: "South Park",
    medium: "cartoon",
    prompt: posterPrompt({
      showTitle: "South Park",
      medium: "cartoon",
      look: "South Park construction-paper cutout style, simple shapes, minimal shading, funny stiff pose allowed",
      world: "Colorado mountain town snow or bus-stop cartoon background",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "rick-and-morty": {
    showTitle: "Rick and Morty",
    medium: "cartoon",
    prompt: posterPrompt({
      showTitle: "Rick and Morty",
      medium: "cartoon",
      look: "Rick and Morty sci-fi sitcom linework, wobbly pupils, portal sci-fi gadgets",
      world: "alien dimension, portal green glow, chaotic space garage",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  "avatar-the-last-airbender": {
    showTitle: "Avatar: The Last Airbender",
    medium: "cartoon",
    prompt: posterPrompt({
      showTitle: "Avatar: The Last Airbender",
      medium: "cartoon",
      look: "ATLA animation style, martial arts stance, elemental bending motion, practical fantasy clothing",
      world: "element-themed landscape — air temples, water tribe ice, fire nation ash, or earth kingdom rocks",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
  arcane: {
    showTitle: "Arcane",
    medium: "cartoon",
    prompt: posterPrompt({
      showTitle: "Arcane",
      medium: "cartoon",
      look: "Arcane painterly 3D-to-2D illustration look, brushy textures, dramatic facial lighting, Piltover/Zaun fashion",
      world: "steampunk city skyline, hextech glow, gritty cinematic color grading",
    }),
    negativePrompt: SHARED_NEGATIVE,
  },
};

export function getStyleArtPrompt(styleSlug: string): StyleArtPrompt | undefined {
  const entry = PROMPTS[styleSlug];
  if (!entry) return undefined;
  return { styleSlug, ...entry };
}

export function getStyleArtPromptOrFallback(styleSlug: string, styleName: string): StyleArtPrompt {
  const found = getStyleArtPrompt(styleSlug);
  if (found) return found;
  return {
    styleSlug,
    showTitle: styleName,
    medium: "anime",
    prompt: posterPrompt({
      showTitle: styleName,
      medium: "anime",
      look: "show-accurate linework, color palette, and costume design language",
      world: "iconic environments and mood from that series",
    }),
    negativePrompt: SHARED_NEGATIVE,
  };
}
