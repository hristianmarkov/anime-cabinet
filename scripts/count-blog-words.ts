import { blogPosts } from "../src/data/blog";

function extractText(post: (typeof blogPosts)[0]): string[] {
  const texts: string[] = [post.intro];
  for (const s of post.sections) {
    if (s.heading) texts.push(s.heading);
    texts.push(...s.paragraphs);
    if (s.list) texts.push(...s.list);
    if (s.blocks) {
      for (const b of s.blocks) {
        if (b.type === "paragraph") texts.push(b.text);
        else if (b.type === "list") texts.push(...b.items);
        else if (b.type === "pullQuote") texts.push(b.text);
        else if (b.type === "heading") texts.push(b.text);
      }
    }
  }
  return texts;
}

function wordCount(post: (typeof blogPosts)[0]) {
  return extractText(post).join(" ").split(/\s+/).filter(Boolean).length;
}

const target = process.argv[2];
const counts = blogPosts.map((p) => ({ slug: p.slug, words: wordCount(p) }));

if (target) {
  const p = blogPosts.find((x) => x.slug === target);
  console.log(target, p ? wordCount(p) : "not found");
} else {
  console.log("Total posts:", blogPosts.length);
  console.log("Under 600:", counts.filter((c) => c.words < 600).length);
  console.log("600-700:", counts.filter((c) => c.words >= 600 && c.words <= 700).length);
  console.log("Over 700:", counts.filter((c) => c.words > 700).length);
  console.log("Avg:", Math.round(counts.reduce((a, c) => a + c.words, 0) / counts.length));
  const under600 = counts.filter((c) => c.words < 600);
  console.log("\nUnder 600 words:");
  for (const c of under600) {
    console.log(`  ${c.words}\t${c.slug}`);
  }
}
