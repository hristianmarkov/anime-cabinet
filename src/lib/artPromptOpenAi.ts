import type { StyleArtPrompt } from "@/data/style-art-prompts";
import { getOpenAiModel, openAiChatCompletion } from "@/lib/openAiChat";

export interface CombineArtPromptInput {
  stylePrompt: StyleArtPrompt;
  customerNotes: string;
  /** People count from checkout (pricing), not total subjects in the artwork. */
  humanCharacterCount: number;
  referencePhotoCount: number;
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
- Subjects must remain original characters based on the reference photo(s); never instruct copying existing named cast from the show.
- The style template assumes people in the photos by default — override that whenever customer notes describe a different composition (pets only, gift for someone not pictured, memorial tribute, etc.).
- humanCharacterCount (${input.humanCharacterCount}) is how many people the customer paid for on the form, NOT necessarily who appears in the uploaded photo(s). Total figures in the artwork may include pets or other subjects described in the notes even when humanCharacterCount is 0 or 1.
- Read notes to decide WHO must appear and WHO the reference photo(s) actually depict. If notes say photos are of pets, use the photo(s) for pet likeness only — do not describe a human likeness "from the uploaded photo" unless notes clearly say a person is in the reference.
- Gift / tribute orders: if the portrait is a gift for someone (e.g. a veterinarian) but notes focus on depicting pets or other subjects, prioritize those subjects; only include the gift recipient in the art if the customer asks for them in the scene.
- Memorial / passed-away pets: follow the customer's tone (often warm, peaceful, happy); avoid grim or mourning horror imagery unless requested.
- Honor customer notes for names, breeds, poses, outfits, relationships, and mood. Keep pet and people names spelled as the customer wrote them.
- Background preference from order form: ${input.backgroundChoice}.
- referencePhotoCount: ${input.referencePhotoCount} — align subject count and likeness instructions with what notes imply about those photos.
- Output JSON only: {"prompt":"..."}
- One cohesive block an artist or image model can follow; stay under 220 words for prompt.`;

  const user = JSON.stringify(
    {
      styleTemplate: input.stylePrompt.prompt,
      customerNotes: input.customerNotes.trim() || "(none)",
      humanCharacterCount: input.humanCharacterCount,
      referencePhotoCount: input.referencePhotoCount,
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
