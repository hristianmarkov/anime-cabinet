/**
 * Smoke-test OpenAI art-prompt + contact-reply helpers (uses .env.local).
 * Run: npx tsx --env-file=.env.local scripts/dry-run-openai-prompts.ts
 */
import { combineArtPromptWithOpenAI } from "../src/lib/artPromptOpenAi";
import { draftContactReplyWithOpenAI } from "../src/lib/contactReplyOpenAi";
import { draftDeliveryMessageWithOpenAI } from "../src/lib/deliveryMessageOpenAi";
import {
  buildOpenAiChatBody,
  getOpenAiModel,
  openAiModelUsesFixedTemperature,
} from "../src/lib/openAiChat";
import { getStyleArtPromptOrFallback } from "../src/data/style-art-prompts";

async function main() {
  const model = getOpenAiModel();
  const fixedTemp = openAiModelUsesFixedTemperature(model);
  const sampleBody = buildOpenAiChatBody({
    model,
    messages: [{ role: "user", content: "ping" }],
  });

  console.log("Model:", model);
  console.log("Fixed temperature (omit param):", fixedTemp);
  console.log("Request includes temperature:", "temperature" in sampleBody);

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY missing — load .env.local with --env-file");
    process.exit(1);
  }

  const stylePrompt = getStyleArtPromptOrFallback("naruto", "Naruto");
  const art = await combineArtPromptWithOpenAI({
    stylePrompt,
    customerNotes: "Include our dog in the background, heroic pose.",
    humanCharacterCount: 2,
    referencePhotoCount: 2,
    backgroundChoice: "Custom scene",
    expedited: false,
  });
  console.log("\nArt prompt OK — length:", art.prompt.length);
  console.log("Preview:", art.prompt.slice(0, 120) + "…");

  const ghibli = getStyleArtPromptOrFallback("ghibli-style", "Studio Ghibli");
  const memorial = await combineArtPromptWithOpenAI({
    stylePrompt: ghibli,
    humanCharacterCount: 1,
    referencePhotoCount: 1,
    backgroundChoice: "Classic scene from the show",
    customerNotes:
      "Gift for our veterinarian. Photo is our two dogs Ribeye (black Basenji) and Tig (yellow Lab), both passed. Capture their sweet recognizable faces. Warm, peaceful, happy.",
    expedited: false,
  });
  console.log("\nMemorial pet edge case OK — length:", memorial.prompt.length);
  const lower = memorial.prompt.toLowerCase();
  if (lower.includes("sole human") || lower.includes("veterinarian's face shape")) {
    console.error("FAIL: prompt wrongly treats dog photo as human likeness");
    process.exit(1);
  }
  console.log("Preview:", memorial.prompt.slice(0, 200) + "…");

  const deliveryMsg = await draftDeliveryMessageWithOpenAI({
    customerName: "Kourtney",
    styleName: "Studio Ghibli",
    characters: 1,
    formatLabel: "Digital File Only",
    backgroundLabel: "Classic Scene",
    customerNotes: "Memorial portrait of two dogs for their vet.",
    expedited: false,
    isDigital: true,
    revisionHours: 48,
    deliveryVersion: 1,
    adminNotes: "First preview — warm and peaceful tone.",
  });
  console.log("\nDelivery message OK — length:", deliveryMsg.length);
  const deliveryLower = deliveryMsg.toLowerCase();
  if (
    deliveryLower.includes("hand-painted ghibli") ||
    deliveryLower.includes("transform the entire image")
  ) {
    console.error("FAIL: delivery draft leaked art-direction language");
    process.exit(1);
  }
  console.log("Preview:", deliveryMsg.slice(0, 160) + "…");

  const reply = await draftContactReplyWithOpenAI({
    customerName: "Alex",
    subject: "Order help",
    thread: [{ direction: "inbound", body: "When will my portrait be ready?" }],
    adminNotes: "Mention 48h preview window.",
  });
  console.log("\nContact reply OK — length:", reply.length);
  console.log("Preview:", reply.slice(0, 120) + "…");

  console.log("\nDry run passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
