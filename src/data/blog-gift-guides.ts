import type { BlogPost } from "./blog";
import { productShowcase } from "./blog-blocks";
import { styleBlogConfigs } from "./blog-per-style-config";
import { site } from "./site";

interface GiftGuideConfig {
  styleSlug: string;
  fanLabel: string;
  productName: string;
  portraitPitch: string;
  extraGifts: string[];
  intro: string;
  pickParagraph: string;
  keywords: string[];
  date: string;
}

function buildGiftGuide(c: GiftGuideConfig): BlogPost {
  const portraitLink = `[${c.productName}](/portraits/${c.styleSlug})`;
  const config = styleBlogConfigs.find((s) => s.slug === c.styleSlug);
  const relatedLinks =
    config?.relatedSlugs
      ?.slice(0, 2)
      .map((slug) => {
        const rel = styleBlogConfigs.find((s) => s.slug === slug);
        return `[${rel?.name ?? slug}](/portraits/${slug})`;
      })
      .join(" and ") ?? "";
  const relatedNote = relatedLinks
    ? ` Fans of similar styles also love ${relatedLinks}.`
    : "";
  return {
    slug: `best-gifts-for-${c.styleSlug}-fans`,
    title: `Best Gifts for ${c.fanLabel} Fans`,
    description: `The best gifts for ${c.fanLabel} fans in 2026 — custom portrait ideas, figures, manga, and merch for birthdays, holidays, and fans who already own everything.`,
    metaTitle: `Best Gifts for ${c.fanLabel} Fans (2026)`,
    date: c.date,
    readingMinutes: 4,
    keywords: c.keywords,
    category: "gift",
    intro: `${c.intro} This guide ranks our favourite ${c.fanLabel} gift ideas for 2026 — starting with a hand-drawn ${c.productName.toLowerCase()} they literally cannot buy anywhere else, then layering in figures, manga, and merch that complement the portrait instead of competing with it.`,
    sections: [
      {
        heading: "Why a custom portrait beats more merch",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: `${c.fanLabel} fans can spot mass-produced gifts from across the room. They own the figure. They pre-ordered the box set. Their wishlist is a graveyard of things they already bought themselves. A ${portraitLink} solves the uniqueness problem completely — it is hand-drawn from their photo, revised until it is right, and exists for exactly one person on earth.`,
          },
          productShowcase(c.styleSlug, c.portraitPitch),
          {
            type: "paragraph",
            text: `That is the difference between another item on a shelf and something they hang, frame, and show every visitor. Our artists work across all twenty-four styles with unlimited revisions. The portrait is not a filter or an AI avatar — it is wall art starring them inside the ${c.fanLabel} visual world they already live in.`,
          },
        ],
      },
      {
        heading: "Our top picks",
        paragraphs: [
          `${c.fanLabel} fans are easy to shop for in theory and impossible in practice — they already own the obvious merch. Start with ${portraitLink} — something they cannot buy anywhere else — then layer in a few classics that pair well on a shelf or desk.`,
          `The best gift stacks combine one emotional centrepiece (the portrait) with one or two smaller items they will actually use. Below is our ranked list for ${c.fanLabel} fans in 2026.`,
        ],
        list: [
          `${portraitLink} (Anime Cabinet) — ${c.portraitPitch}`,
          ...c.extraGifts,
        ],
      },
      {
        heading: "How to pick the right gift",
        paragraphs: [
          `${c.pickParagraph} Browse [${c.fanLabel} portrait examples](/portraits/${c.styleSlug}) before you order — seeing finished work helps you decide between solo, couple, and group compositions.${relatedNote}`,
          `Think about how they talk about the fandom. Do they quote episodes, collect figures, or cosplay at conventions? Lore obsessives love portraits with custom details in the order notes. Collectors appreciate a portrait plus a display prop. Quiet fans often prefer something warm and frame-worthy over another loud piece of merch.`,
          `If you are unsure which direction to take, order the portrait first. It is the gift with the highest emotional ceiling — and the one they are least likely to already own.`,
        ],
      },
      {
        heading: "Photo tips for surprise portrait orders",
        paragraphs: [
          `You do not need a professional photo — a clear, well-lit image from their camera roll works. Face visible, minimal filters, natural expression. For stealth gift orders, grab a photo from a shared album or ask a mutual friend.`,
          `Include context in the order notes: their favourite character energy, inside jokes, preferred poses, or background ideas. Our artists read every note and use those details to personalise the ${c.fanLabel} portrait beyond a generic template.`,
        ],
        list: [
          "Pick a photo where their face is clearly visible — selfies and candid shots both work.",
          "Avoid heavy beauty filters that flatten skin tone; artists need accurate colouring.",
          "For group gifts, one photo per person beats one group shot with tiny faces.",
          "Mention the occasion in the notes — birthday, anniversary, graduation — so the composition fits the moment.",
        ],
      },
      {
        heading: "Timing and presentation",
        paragraphs: [
          `Order a custom portrait at least a week before you need it — standard preview delivery is within ${site.deliveryHours} hours, plus revision time if they want tweaks. Add priority delivery (+$10) if you are cutting it close for a birthday or holiday.`,
          `Presentation matters. A framed print unwrapped at dinner beats a JPEG sent over text — though setting the portrait as their phone wallpaper before the party is a underrated reveal move. Digital files arrive high-resolution and print-ready at any standard poster size.`,
          `Every order includes unlimited revisions until the preview is approved. That means you can fine-tune details before the big moment — and they receive a finished piece that feels unmistakably theirs, not off-the-shelf.`,
        ],
      },
    ],
    ctaStyle: c.styleSlug,
    ctaLabel: `Order ${c.productName.split(" — ")[0]}`,
  };
}

const giftGuideConfigs: GiftGuideConfig[] = [
  {
    styleSlug: "naruto",
    fanLabel: "Naruto",
    productName: "Custom Naruto Portrait",
    portraitPitch:
      "turn them into a Hidden Leaf shinobi from their own photo — headband, jutsu pose, and village background included. The gift no figure shelf can match.",
    extraGifts: [
      "Hidden Leaf or Akatsuki headband — instant cosplay energy for conventions or wall display.",
      "Naruto manga box set — the complete story for fans who've only watched the anime.",
      "High-quality figure of their favourite character (Kakashi, Itachi, or Naruto himself).",
      "Ichiraku ramen bowl set — niche, funny, and weirdly perfect for a Naruto-themed kitchen.",
    ],
    intro:
      "Naruto fans don't want generic anime merch — they want to feel like they're part of the Hidden Leaf. Whether it's a birthday, Christmas, or a 'you finally finished Shippuden' celebration, these gifts hit the fandom where it lives.",
    pickParagraph:
      "Lead with the portrait if you want tears. Lead with manga if they're a lore-first reader. Figures work for collectors; the headband works for everyone who ever ran with their arms behind their back.",
    keywords: ["best gifts for naruto fans", "naruto gift ideas", "naruto birthday gift", "custom naruto portrait gift"],
    date: "2026-04-02",
  },
  {
    styleSlug: "one-piece",
    fanLabel: "One Piece",
    productName: "Custom One Piece Portrait",
    portraitPitch:
      "draw them as a Straw Hat crew member in full One Piece style — expressive eyes, bold linework, and a scene that feels ripped from the manga.",
    extraGifts: [
      "One Piece manga box sets — East Blue through Wano, pick their current arc obsession.",
      "Straw Hat replica — the most recognisable hat in anime, full stop.",
      "Devil Fruit replica or themed snack box — fun desk piece or party gift.",
      "Premium figure from the Grand Line roster (Luffy, Zoro, Nami, or their favourite villain).",
    ],
    intro:
      "One Piece fans measure loyalty in hundreds of episodes and thousands of pages. They've cried at Enies Lobby. They have opinions about the live-action. These gifts respect the commitment.",
    pickParagraph:
      "Couples and friend groups love crew portraits. Solo fans want to be the protagonist. If they quote Luffy constantly, the portrait wins every time.",
    keywords: ["best gifts for one piece fans", "one piece gift ideas", "straw hat crew gift", "one piece portrait gift"],
    date: "2026-04-04",
  },
  {
    styleSlug: "one-piece-wanted-poster",
    fanLabel: "One Piece Wanted Poster",
    productName: "Custom One Piece Wanted Poster",
    portraitPitch:
      "a personalised wanted poster with their face, custom bounty, and epithet — the single most One Piece gift that exists, drawn from their photo.",
    extraGifts: [
      "Grand Line world map poster — perfect wall companion to a wanted poster.",
      "One Piece manga volumes or box set — context for the bounty jokes.",
      "Straw Hat or Jolly Roger flag — room decor that screams pirate.",
      "Premium Luffy or Shanks figure — for the shelf below the poster.",
    ],
    intro:
      "Every One Piece fan has imagined their bounty. Some have a number in mind; all of them have an epithet ready. A custom wanted poster turns that fantasy into wall art — and it's the gift they'll show every visitor.",
    pickParagraph:
      "Put their dream bounty in the order notes. Inside jokes as epithets ('Destroyer of Buffets', 'Sleeper of Alarms') make it unforgettable. Frame it before you wrap it.",
    keywords: ["one piece wanted poster gift", "custom bounty poster", "best gifts for one piece fans", "personalised wanted poster"],
    date: "2026-04-06",
  },
  {
    styleSlug: "dragon-ball-z",
    fanLabel: "Dragon Ball Z",
    productName: "Custom Dragon Ball Z Portrait",
    portraitPitch:
      "Super Saiyan aura, powered-up pose, and DBZ cel-shading — drawn from their photo so they look like they belong in the Tournament of Power.",
    extraGifts: [
      "Scouter replica — the classic power-level gag gift.",
      "Dragon Ball Z manga or Dragon Ball Super collected editions.",
      "High-end Goku, Vegeta, or Gohan figure in a dynamic pose.",
      "Senzu Beans candy jar — silly, cheap, and instantly recognisable.",
    ],
    intro:
      "DBZ fans still power-scale everything. They have a favourite transformation, a favourite saga, and strong feelings about dub vs sub. These gifts fuel the debate and look great on a shelf.",
    pickParagraph:
      "Ask which form they want — base, Super Saiyan, Ultra Instinct. The portrait lets them pick; the scouter lets them measure everyone else's reaction.",
    keywords: ["best gifts for dragon ball z fans", "dbz gift ideas", "dragon ball portrait gift", "anime gifts for him"],
    date: "2026-04-08",
  },
  {
    styleSlug: "demon-slayer",
    fanLabel: "Demon Slayer",
    productName: "Custom Demon Slayer Portrait",
    portraitPitch:
      "draw them as a Demon Slayer Corps member with haori pattern, nichirin sword, and the show's gorgeous colour palette — from their photo.",
    extraGifts: [
      "Nichirin sword replica (display size) — the centrepiece prop every fan wants.",
      "Demon Slayer manga box set or art book — Ufotable's art deserves a hardcover.",
      "Nezuko or Tanjiro premium figure.",
      "Hanafuda earring replica — subtle fan jewellery that true fans notice.",
    ],
    intro:
      "Demon Slayer fans fell in love with the animation first and stayed for the characters. Gifts that capture the visual beauty of the series — or put them inside it — land harder than generic anime hoodies.",
    pickParagraph:
      "Pick their breathing style in the order notes. Water, Flame, Thunder — it personalises the portrait instantly. Sword replicas pair perfectly as a two-part gift.",
    keywords: ["best gifts for demon slayer fans", "kimetsu no yaiba gifts", "demon slayer portrait", "anime gift ideas 2026"],
    date: "2026-04-10",
  },
  {
    styleSlug: "jujutsu-kaisen",
    fanLabel: "Jujutsu Kaisen",
    productName: "Custom Jujutsu Kaisen Portrait",
    portraitPitch:
      "cursed energy, JJK linework, and sorcerer uniform — a portrait that looks like they stepped out of Shibuya Incident arc key art.",
    extraGifts: [
      "Jujutsu Kaisen manga volumes or box set.",
      "Gojo Satoru or Sukuna premium figure.",
      "Domain Expansion art print or cursed technique poster.",
      "Blindfold and white hair wig combo — only for fans with a sense of humour (and Gojo energy).",
    ],
    intro:
      "JJK fans are loud about their favourite sorcerers and louder about power scaling. The fandom skews young and very online — personalised art beats mass merch every time.",
    pickParagraph:
      "Couples often order matching sorcerer portraits. Solo fans usually want Gojo-adjacent cool or Sukuna-adjacent chaos — specify in the notes.",
    keywords: ["best gifts for jujutsu kaisen fans", "jjk gift ideas", "gojo gift", "custom jujutsu kaisen portrait"],
    date: "2026-04-12",
  },
  {
    styleSlug: "attack-on-titan",
    fanLabel: "Attack on Titan",
    productName: "Custom Attack on Titan Portrait",
    portraitPitch:
      "Survey Corps uniform, ODM gear, and AoT's dramatic shading — a portrait that captures the series' intensity from their photo.",
    extraGifts: [
      "Survey Corps jacket replica — wearable and instantly iconic.",
      "Attack on Titan manga complete box set — the full story, ending and all.",
      "ODM gear desktop model or keychain.",
      "Levi or Mikasa premium figure.",
    ],
    intro:
      "AoT fans invested years in the story. The ending divided them, but the early seasons united everyone. Gifts that honour the Survey Corps era or their favourite character still hit hard.",
    pickParagraph:
      "Regiment cape colour, blade count, or a specific scene reference in the notes goes a long way. The jacket + portrait combo is the ultimate AoT room makeover.",
    keywords: ["best gifts for attack on titan fans", "aot gift ideas", "survey corps gift", "attack on titan portrait"],
    date: "2026-04-14",
  },
  {
    styleSlug: "ghibli-style",
    fanLabel: "Studio Ghibli",
    productName: "Custom Ghibli-Style Portrait",
    portraitPitch:
      "soft painterly light, warm colours, and a whimsical scene — a portrait that feels like a frame from a Ghibli film, drawn from their photo.",
    extraGifts: [
      "Studio Ghibli film Blu-ray collection — Spirited Away, Howl's Moving Castle, Totoro.",
      "Large Totoro or Catbus plush — comfort object and decor in one.",
      "Ghibli cookbook or art book — for fans who love the food and backgrounds as much as the story.",
      "Museum-quality Ghibli exhibition prints — if you want museum-tier wall art alongside the portrait.",
    ],
    intro:
      "Ghibli fans aren't always loud cosplayers — they're often the person who rewatchs Howl's Moving Castle when they need comfort. These gifts match that gentle, nostalgic energy.",
    pickParagraph:
      "Couples love picnic or train-ride compositions. Families want everyone in one warm scene. Solo fans often ask for a flying moment or a quiet forest backdrop.",
    keywords: ["best gifts for ghibli fans", "studio ghibli gift ideas", "ghibli portrait gift", "anime couple gift"],
    date: "2026-04-16",
  },
  {
    styleSlug: "pokemon",
    fanLabel: "Pokemon",
    productName: "Custom Pokemon Portrait",
    portraitPitch:
      "draw them as a Pokemon trainer with their actual pet as their partner Pokemon — or solo in full trainer gear. The gift that makes every Pokemon fan cry happy tears.",
    extraGifts: [
      "Pokemon Scarlet/Violet or latest mainline game — if they don't already own it.",
      "Elite Trainer Box or booster packs for the TCG collector.",
      "Large plush of their favourite Pokemon (Eevee, Pikachu, Lucario).",
      "Pokemon Center exclusive merch — region-specific items feel special.",
    ],
    intro:
      "Pokemon spans generations — parents who played Red and Blue, kids on Scarlet and Violet, and everyone in between. The through-line is wanting to be a trainer. These gifts make that real.",
    pickParagraph:
      "Include their favourite Pokemon and starter choice in the order notes. If they have a dog or cat, the pet-as-partner portrait is the nuclear option for emotional impact.",
    keywords: ["best gifts for pokemon fans", "pokemon gift ideas", "pokemon trainer portrait", "custom pokemon art gift"],
    date: "2026-04-18",
  },
  {
    styleSlug: "my-hero-academia",
    fanLabel: "My Hero Academia",
    productName: "Custom My Hero Academia Portrait",
    portraitPitch:
      "hero costume, Quirk effects, and MHA's bold comic style — drawn from their photo as the hero they always said they'd be.",
    extraGifts: [
      "My Hero Academia manga box set.",
      "Hero costume hoodie or cosplay piece (Deku, Bakugo, or Todoroki).",
      "Premium figure from Class 1-A.",
      "Plus Ultra enamel pin set or UA High lanyard.",
    ],
    intro:
      "MHA fans have a Quirk picked. They have a hero name ready. They've assigned everyone they know a character. Give them the portrait that makes the bit official.",
    pickParagraph:
      "Describe their Quirk and hero name in the order notes. Group portraits work brilliantly for friend squads who've already cast themselves as Class 1-A.",
    keywords: ["best gifts for my hero academia fans", "mha gift ideas", "bnha portrait gift", "hero academia custom art"],
    date: "2026-04-22",
  },
  {
    styleSlug: "bleach",
    fanLabel: "Bleach",
    productName: "Custom Bleach Portrait",
    portraitPitch:
      "Soul Reaper uniform, zanpakuto, and Bleach's sharp stylised look — a portrait drawn from their photo for the fan who never stopped defending the series.",
    extraGifts: [
      "Bleach manga box set or Thousand-Year Blood War Blu-ray.",
      "Zanpakuto replica (display) — pick Ichigo's, Rukia's, or Byakuya's.",
      "Soul Reaper badge or Gotei 13 division patch.",
      "Premium Ichigo or Aizen figure.",
    ],
    intro:
      "Bleach fans waited years for the TYBW anime payoff. They're loyal, nostalgic, and very specific about their favourite captain. These gifts honour that dedication.",
    pickParagraph:
      "Bankai name in the notes is mandatory for true fans. Division number on the uniform personalises the portrait — Eleventh for fighters, Fourth for healers.",
    keywords: ["best gifts for bleach fans", "bleach gift ideas", "soul reaper portrait", "bleach anime gifts"],
    date: "2026-04-24",
  },
  {
    styleSlug: "death-note",
    fanLabel: "Death Note",
    productName: "Custom Death Note Portrait",
    portraitPitch:
      "dramatic Death Note shading — as Light, L, Misa, or an original Kira-era character drawn from their photo. Morally questionable? Maybe. Memorable? Absolutely.",
    extraGifts: [
      "Death Note replica notebook — the classic prop, rules included.",
      "Death Note manga complete box set.",
      "L figurine or Nendoroid — desk companion for the strategist fan.",
      "Apple-shaped anything — inside joke for L fans.",
    ],
    intro:
      "Death Note fans love the cat-and-mouse, the aesthetics, and the 'what would you do with a notebook' debate. Lean into the drama — these gifts are for fans with a dark sense of humour.",
    pickParagraph:
      "Specify Light vs L energy in the notes. Couples sometimes order opposing portraits — Kira and the detective. Frame them facing each other.",
    keywords: ["best gifts for death note fans", "death note gift ideas", "death note portrait", "anime gifts for goth fans"],
    date: "2026-04-26",
  },
  {
    styleSlug: "hunter-x-hunter",
    fanLabel: "Hunter x Hunter",
    productName: "Custom Hunter x Hunter Portrait",
    portraitPitch:
      "Hunter license ready, nen aura optional, and HxH's clean character design — drawn from their photo in the style Togashi built.",
    extraGifts: [
      "Hunter x Hunter manga — Chimera Ant arc onwards for the brave reader.",
      "Hunter license replica card — wallet-sized flex.",
      "Premium Gon, Killua, or Hisoka figure.",
      "Nen type chart poster — for fans who've assigned everyone an aura.",
    ],
    intro:
      "HxH fans are patient (they had to be) and deeply analytical about nen. The fandom rewards gifts that acknowledge the system's complexity — or just look cool on a wall.",
    pickParagraph:
      "Name their nen type and favourite arc in the notes. Killua-adjacent lightning effects or Chrollo's book — small details our artists love to include.",
    keywords: ["best gifts for hunter x hunter fans", "hxh gift ideas", "hunter license gift", "custom hxh portrait"],
    date: "2026-04-28",
  },
  {
    styleSlug: "spy-x-family",
    fanLabel: "Spy x Family",
    productName: "Custom Spy x Family Portrait",
    portraitPitch:
      "Forger family elegance — draw them as Loid, Yor, Anya, or a full family composition in Spy x Family's clean, stylish look.",
    extraGifts: [
      "Spy x Family manga or Blu-ray.",
      "Anya plush or 'waku waku' mug.",
      "Bond plush for the dog person in the fandom.",
      "Premium Anya or Yor figure.",
    ],
    intro:
      "Spy x Family fans love the wholesome chaos — telepathy, assassins, and found family. Gifts that let them join the Forger household hit the sweet spot.",
    pickParagraph:
      "Family orders with kids are the sweet spot — assign roles in the notes. Solo fans often want Anya faces or Yor's assassin elegance.",
    keywords: ["best gifts for spy x family fans", "spy family gift ideas", "anya gift", "spy x family portrait"],
    date: "2026-05-02",
  },
  {
    styleSlug: "sailor-moon",
    fanLabel: "Sailor Moon",
    productName: "Custom Sailor Moon Portrait",
    portraitPitch:
      "transformation sequence energy, sailor uniform, and sparkly shoujo aesthetics — drawn from their photo as their own sailor guardian.",
    extraGifts: [
      "Sailor Moon manga Eternal Edition or Crystal Blu-ray.",
      "Transformation brooch or wand replica.",
      "Premium Sailor Moon or Luna figure.",
      "Crystal Tokyo art print or moon stick necklace.",
    ],
    intro:
      "Sailor Moon fans grew up with the scouts — or discovered them and felt the same magic. Nostalgia runs deep. These gifts honour the pretty guardian in every fan.",
    pickParagraph:
      "Pick their guardian planet and colour scheme in the notes. Group portraits for friend squads who've been calling each other inner senshi since middle school.",
    keywords: ["best gifts for sailor moon fans", "sailor moon gift ideas", "sailor scout portrait", "shoujo anime gifts"],
    date: "2026-05-04",
  },
  {
    styleSlug: "one-punch-man",
    fanLabel: "One Punch Man",
    productName: "Custom One Punch Man Portrait",
    portraitPitch:
      "hero association badge, cape optional, and ONE's expressive character design — drawn from their photo as S-Class material (or C-Class for the meme).",
    extraGifts: [
      "One Punch Man manga or Blu-ray.",
      "Saitama 'OK' face hoodie or Genos figure.",
      "Hero Association membership cap.",
      "Premium Saitama or Garou figure.",
    ],
    intro:
      "OPM fans love the gag and the fight scenes equally. Gifts should be funny first or cool second — ideally both. A serious portrait of them as a hero is the twist they don't expect.",
    pickParagraph:
      "Specify hero rank and cape colour. Group portraits of the whole hero association friend group are underrated gold.",
    keywords: ["best gifts for one punch man fans", "opm gift ideas", "saitama gift", "one punch man portrait"],
    date: "2026-05-06",
  },
  {
    styleSlug: "solo-leveling",
    fanLabel: "Solo Leveling",
    productName: "Custom Solo Leveling Portrait",
    portraitPitch:
      "shadow monarch aura, hunter rank badge, and Solo Leveling's sleek manhwa style — drawn from their photo as an S-Rank hunter.",
    extraGifts: [
      "Solo Leveling manhwa volumes or novel box set.",
      "Hunter rank license replica.",
      "Sung Jin-Woo or Igris figure (when available).",
      "Shadow army art print.",
    ],
    intro:
      "Solo Leveling blew up fast — fans who discovered it in 2024–2026 are still in peak obsession mode. Strike while the shadow monarch hype is hot.",
    pickParagraph:
      "Name their hunter rank and favourite shadow soldier in the notes. Dual portraits (before/after awakening) work as couple or sibling gifts.",
    keywords: ["best gifts for solo leveling fans", "solo leveling gift ideas", "sung jin woo gift", "solo leveling portrait"],
    date: "2026-05-08",
  },
  {
    styleSlug: "bobs-burgers",
    fanLabel: "Bob's Burgers",
    productName: "Custom Bob's Burgers Portrait",
    portraitPitch:
      "draw the whole family behind the Belcher counter — or solo in Bob's Burgers' round, warm character style. The gift for the fan who quotes Tina every dinner.",
    extraGifts: [
      "Bob's Burgers cookbook — real recipes, Louise energy.",
      "Belcher family funko set.",
      "Bob's Burgers Blu-ray or season pass.",
      "Custom apron with 'Burger of the Day' chalkboard patch.",
    ],
    intro:
      "Bob's Burgers fans are loyal in a quiet way — they've watched every episode twice and have a favourite child (it's Louise). These gifts match the show's warmth and weirdness.",
    pickParagraph:
      "Family portraits need one photo per person — same as any group order. Put them in the restaurant, on the couch, or at Wonder Wharf.",
    keywords: ["best gifts for bobs burgers fans", "belcher family gift", "bobs burgers portrait", "cartoon family portrait gift"],
    date: "2026-05-16",
  },
  {
    styleSlug: "family-guy",
    fanLabel: "Family Guy",
    productName: "Custom Family Guy Portrait",
    portraitPitch:
      "draw them on the couch, at the Drunken Clam, or in Quahog's unmistakable character style — from their photo, four fingers included.",
    extraGifts: [
      "Family Guy complete season Blu-ray.",
      "Stewie or Brian plush.",
      "Quahog IPA glass or Pawtucket Patriot beer mug (prop).",
      "Premium Peter or Stewie figure.",
    ],
    intro:
      "Family Guy fans communicate in cutaway references. A portrait on the famous couch is the gift that gets framed in the actual living room — meta and perfect.",
    pickParagraph:
      "Couch scene for families. Drunken Clam for friend groups. Solo fans often want the chicken fight pose — specify if that's the energy.",
    keywords: ["best gifts for family guy fans", "family guy gift ideas", "quahog portrait", "custom family guy art"],
    date: "2026-05-18",
  },
  {
    styleSlug: "the-simpsons",
    fanLabel: "The Simpsons",
    productName: "Custom Simpsons-Style Portrait",
    portraitPitch:
      "turn them yellow — Simpsons couch scene, Springfield backdrop, four fingers and overbite included. The 'turn me yellow' gift every Simpsons fan secretly wants.",
    extraGifts: [
      "Simpsons complete season box set (pick classic era).",
      "Lard Lad doughnut plush or Homer Simpson socks.",
      "Simpsons LEGO set — Kwik-E-Mart or The Simpson House.",
      "Duff beer mug (prop) or Springfield map poster.",
    ],
    intro:
      "Simpsons fans span forty years of references. They've dreamed of being yellow since childhood. These gifts make Springfield personal.",
    pickParagraph:
      "Couch composition for families. Solo fans want Moe's Tavern, the nuclear plant, or a custom background from their own photo of home.",
    keywords: ["best gifts for simpsons fans", "turn me yellow gift", "simpsons portrait gift", "simpsons family portrait"],
    date: "2026-05-22",
  },
  {
    styleSlug: "south-park",
    fanLabel: "South Park",
    productName: "Custom South Park Portrait",
    portraitPitch:
      "construction-paper style, winter hats, and deadpan dot-eyes — drawn from their photo as a South Park kid (or Randy, if that's the vibe).",
    extraGifts: [
      "South Park complete collection Blu-ray.",
      "Kenny parka hoodie — muffled speech optional.",
      "Towelie towel or Memberberries prop.",
      "Premium Cartman or Butters figure.",
    ],
    intro:
      "South Park fans have dark humour and strong opinions about seasons 1–6 vs everything else. Lean into the jokes — these gifts should feel like an episode premise.",
    pickParagraph:
      "Friend group at the bus stop is the classic. Specify which kid energy each person has. Avoid gifting to anyone who doesn't share the show's sense of humour.",
    keywords: ["best gifts for south park fans", "south park gift ideas", "south park portrait", "cartman gift"],
    date: "2026-05-24",
  },
  {
    styleSlug: "rick-and-morty",
    fanLabel: "Rick and Morty",
    productName: "Custom Rick and Morty Portrait",
    portraitPitch:
      "portal gun, multiverse energy, and Rick and Morty's wobbly sci-fi style — draw them as a Rick/Morty duo, a solo Rick, or a Pickle Rick situation (yes, we do those).",
    extraGifts: [
      "Portal gun replica with sound effects — the desk toy every fan wants.",
      "Pickle Rick plush or enamel pin.",
      "Rick and Morty Blu-ray or Season pass.",
      "Meeseeks box prop ('I'm Mr. Meeseeks, look at me!').",
    ],
    intro:
      "Rick and Morty fans quote the show constantly, own the pickle merch ironically, and argue about which season peaked. A custom portrait in the multiverse is the gift they'll actually frame — next to the portal gun.",
    pickParagraph:
      "Couples as Rick and Morty is the default. Friend duos work too. Solo fans: specify Rick drip level (lab coat, flask, burp intensity). Pickle requests go in the notes — we mean it.",
    keywords: ["best gifts for rick and morty fans", "rick and morty gift ideas", "portal gun gift", "rick and morty portrait commission"],
    date: "2026-05-26",
  },
  {
    styleSlug: "avatar-the-last-airbender",
    fanLabel: "Avatar: The Last Airbender",
    productName: "Custom Avatar Portrait",
    portraitPitch:
      "bending effects, nation colours, and Avatar's animated style — draw them as a waterbender, firebender, or airbender from their photo.",
    extraGifts: [
      "Avatar: The Last Airbender complete series Blu-ray or steelbook.",
      "Element symbol wall set (water, earth, fire, air).",
      "Appa or Momo plush.",
      "Premium Aang or Zuko figure.",
    ],
    intro:
      "Avatar fans know their element, their favourite nation, and whether they forgive the live-action. A portrait that lets them bend is the gift that respects the lore.",
    pickParagraph:
      "One bender per element in group portraits — the dream composition. Specify hair loopies for Water Tribe or topknot for Air Nomads.",
    keywords: ["best gifts for avatar fans", "avatar the last airbender gifts", "bending portrait gift", "avatar fan gift ideas"],
    date: "2026-05-30",
  },
  {
    styleSlug: "arcane",
    fanLabel: "Arcane",
    productName: "Custom Arcane Portrait",
    portraitPitch:
      "painterly Arcane texture, hextech glow, and Piltover or Zaun atmosphere — a portrait that looks like official key art, drawn from their photo.",
    extraGifts: [
      "Arcane Blu-ray or art book — the animation art is frame-worthy.",
      "Hextech crystal replica or LED prop.",
      "Vi gauntlets or Jinx wig for cosplay-inclined fans.",
      "Premium Vi or Jinx figure.",
    ],
    intro:
      "Arcane fans treat the show like fine art — because it is. Gifts should feel premium and moody, not cartoon-cute. A painterly portrait leads the list.",
    pickParagraph:
      "Piltover gold vs Zaun teal — specify the city. Couples on opposite sides of the bridge (Vi/Jinx energy) make devastatingly good gifts. Handle sibling dynamics carefully.",
    keywords: ["best gifts for arcane fans", "arcane gift ideas", "vi jinx gift", "arcane portrait commission"],
    date: "2026-06-03",
  },
];

export const giftGuidePosts: BlogPost[] = giftGuideConfigs.map(buildGiftGuide);
