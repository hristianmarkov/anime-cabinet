import assert from "node:assert/strict";
import test from "node:test";
import { injectStyleBlogBlocks, normalizeBlogSection } from "./apply";

test("article normalisation preserves body text alongside a visual block", () => {
  const section = normalizeBlogSection({
    heading: "Photo guidance",
    blocks: [{ type: "figure", file: "naruto-after.jpg" }],
    body: "Use an evenly lit photo.",
    paragraphs: ["Keep both eyes visible."],
  });
  assert.deepEqual(section.blocks.slice(1), [
    { type: "paragraph", text: "Use an evenly lit photo." },
    { type: "paragraph", text: "Keep both eyes visible." },
  ]);
});

test("unknown generated blocks cannot discard a valid section body", () => {
  const section = normalizeBlogSection({
    blocks: [{ type: "unsupported" }],
    body: "Describe the outfit in your notes.",
  });
  assert.deepEqual(section.blocks, [{ type: "paragraph", text: "Describe the outfit in your notes." }]);
});

test("adding product imagery preserves existing editorial paragraphs", () => {
  const [section] = injectStyleBlogBlocks([
    { heading: "Your reference photo", paragraphs: ["Use a clear photo."], blocks: [] },
  ], "naruto", "blog-style-transform");
  assert.deepEqual(section.paragraphs, ["Use a clear photo."]);
  assert(section.blocks.length > 0);
});
