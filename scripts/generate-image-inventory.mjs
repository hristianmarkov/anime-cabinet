import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, "..");

function parseStyles(file) {
  const text = fs.readFileSync(path.join(base, "src/data", file), "utf8");
  const styles = [];
  const re = /slug: "([^"]+)"[\s\S]*?name: "([^"]+)"/g;
  let m;
  while ((m = re.exec(text))) styles.push({ slug: m[1], name: m[2] });
  return styles;
}

const styles = [...parseStyles("styles-anime.ts"), ...parseStyles("styles-cartoon.ts")];

const reviewsText = fs.readFileSync(path.join(base, "src/data/reviews.ts"), "utf8");
const reviewSeeds = [...reviewsText.matchAll(/reviewImage\("([^"]+)"\)/g)].map((m) => m[1]);

const rows = [];

function add(file, style, type, location) {
  rows.push({ file, style, type, location });
}

add("logo.png", "Site", "Logo", "Header, footer, favicon, JSON-LD");
add("hero-naruto.jpg", "Naruto", "After (finished portrait)", "Homepage hero tile");
add("hero-one-piece.jpg", "One Piece", "After (finished portrait)", "Homepage hero tile");
add("hero-rick-and-morty.jpg", "Rick and Morty", "After (finished portrait)", "Homepage hero tile");
add("hero-the-simpsons.jpg", "The Simpsons", "After (finished portrait)", "Homepage hero tile");

for (const s of styles.slice(0, 16)) {
  add(
    `gallery-${s.slug}.jpg`,
    s.name,
    "After (finished portrait)",
    `Homepage gallery masonry — can reuse ${s.slug}-after.jpg`
  );
}

for (const s of styles) {
  add(
    `${s.slug}-before.jpg`,
    s.name,
    "Before (customer photo)",
    "Product page slider + style card — one before/after pair per style"
  );
  add(
    `${s.slug}-after.jpg`,
    s.name,
    "After (finished portrait)",
    "Product page slider + style card — one before/after pair per style"
  );
  for (let n = 1; n <= 3; n++) {
    add(
      `${s.slug}-example-${n}.jpg`,
      s.name,
      "After (finished portrait)",
      "Product page thumbnail row — finished artwork only"
    );
  }
}

for (const seed of reviewSeeds) {
  add(
    `review-${seed}.jpg`,
    "(see review style field)",
    "After (finished portrait)",
    "Reviews — homepage, /reviews, product pages"
  );
}

const md = [
  "# Site image inventory",
  "",
  "Suggested filenames for `public/art/`. Each product page has **one** before/after pair for the slider (also used on style cards). The three thumbnails below are **finished portraits only** — no before photos.",
  "",
  `**Total: ${rows.length} image slots**`,
  "",
  "",
  "| File name (suggested) | Style | Type | Location |",
  "|---|---|---|---|",
  ...rows.map((r) => `| ${r.file} | ${r.style} | ${r.type} | ${r.location} |`),
  "",
].join("\n");

const csv = [
  '"File name (suggested)","Style","Type","Location"',
  ...rows.map(
    (r) =>
      `"${r.file}","${r.style.replace(/"/g, '""')}","${r.type}","${r.location.replace(/"/g, '""')}"`
  ),
].join("\n");

fs.writeFileSync(path.join(base, "IMAGES-INVENTORY.md"), md, "utf8");
fs.writeFileSync(path.join(base, "IMAGES-INVENTORY.csv"), csv, "utf8");

console.log(`Generated ${rows.length} slots (${styles.length} styles, ${reviewSeeds.length} review images)`);
