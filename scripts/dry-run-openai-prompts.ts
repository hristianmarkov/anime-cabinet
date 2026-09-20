/**
 * Smoke-test OpenAI art-prompt + contact-reply helpers (uses .env.local).
 * Run: npx tsx --env-file=.env.local scripts/dry-run-openai-prompts.ts
 */
import { combineArtPromptWithOpenAI } from "../src/lib/artPromptOpenAi";
import { draftContactReplyWithOpenAI } from "../src/lib/contactReplyOpenAi";
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
    characters: 2,
    backgroundChoice: "Custom scene",
    expedited: false,
  });
  console.log("\nArt prompt OK — length:", art.prompt.length);
  console.log("Preview:", art.prompt.slice(0, 120) + "…");

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
