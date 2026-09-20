import type { StyleArtPrompt } from "@/data/style-art-prompts";
import { getOpenAiModel, openAiChatCompletion } from "@/lib/openAiChat";

export interface CombineArtPromptInput {
  stylePrompt: StyleArtPrompt;
  customerNotes: string;
  characters: number;
  backgroundChoice: string;
  expedited?: boolean;
}

export async function combineArtPromptWithOpenAI(
  input: CombineArtPromptInput
): Promise<{ prompt: string }> {
  const model = getOpenAiModel();

  const system = `You write final image-generation prompts for Anime Cabinet artists.
Merge the fixed ${input.stylePrompt.showTitle} style template with the customer's order notes.
Rules:
- Keep the show named explicitly (${input.stylePrompt.showTitle} style — not vague "inspired by" wording).
- Subjects must remain original characters based on the reference photo; never instruct copying existing cast.
- Honor customer notes for poses, outfits, pets, relationships, inside jokes, and background requests when compatible.
- Respect character count: ${input.characters}.
- Background preference from order form: ${input.backgroundChoice}.
- Output JSON only: {"prompt":"..."}
- Prompt should be one cohesive block an artist or image model can follow; stay under 220 words for prompt.`;

  const user = JSON.stringify(
    {
      styleTemplate: input.stylePrompt.prompt,
      customerNotes: input.customerNotes.trim() || "(none)",
      characters: input.characters,
      backgroundChoice: input.backgroundChoice,
      expedited: input.expedited ?? false,
    },
    null,
    2
  );

  const raw = await openAiChatCompletion({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  let parsed: { prompt?: string };
  try {
    parsed = JSON.parse(raw) as { prompt?: string };
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  if (!parsed.prompt?.trim()) {
    throw new Error("OpenAI response missing prompt");
  }

  return {
    prompt: parsed.prompt.trim(),
  };
}
