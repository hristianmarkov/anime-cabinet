import type { StyleArtPrompt } from "@/data/style-art-prompts";
import { getOpenAiModel, openAiChatCompletion } from "@/lib/openAiChat";
import {
  assembleArtPromptFromStructured,
  legacyPromptToStructured,
  parseStructuredArtDirection,
  type StructuredArtDirection,
} from "@/lib/artPromptStructured";

export interface CombineArtPromptInput {
  stylePrompt: StyleArtPrompt;
  customerNotes: string;
  /** People count from checkout (pricing), not total subjects in the artwork. */
  humanCharacterCount: number;
  referencePhotoCount: number;
  backgroundChoice: string;
  formatLabel: string;
  printCompositionHint: string | null;
  expedited?: boolean;
}

const STRUCTURED_JSON_SHAPE = `{
  "openingLikeness": "1–2 sentences. MUST start with reference photos + recognizable identity; style is the treatment, not the subject.",
  "referenceUsage": "Semi-structured photo roles, e.g. Photo 1 = pose/composition only; Photo 2 = … likeness. Infer from customer notes when possible.",
  "humanSubjects": "How many human subjects (from humanCharacterCount). Clarify that additional requested non-human elements (dragons, pets, spirits, etc.) are allowed if notes request them.",
  "likenessAndIdentity": "Only traits explicitly in customer notes or order metadata — faces, hair, skin tone, jewelry, etc. Do not invent.",
  "mustRemoveOrAvoid": "Explicit removals from notes (phone, obscured faces, etc.) or empty string.",
  "outfitsCharacterTreatment": "Outfits, poses, relationship energy — from notes + style template, original characters only.",
  "styleVisuals": "Concrete show-specific visuals from the style template (linework, shading, anatomy) — avoid vague repeats like 'high quality' or saying 'authentic X style' three times.",
  "background": "Environment from notes, else template world, respecting backgroundChoice from the order form.",
  "compositionAndPrint": "Orientation, aspect ratio, safe margins — use printCompositionHint when provided; else from customer notes.",
  "exclusions": "No copied named cast, logos, text — brief."
}`;

function buildSystemPrompt(input: CombineArtPromptInput): string {
  const show = input.stylePrompt.showTitle;
  return `You write structured art direction for Anime Cabinet artists and image models.
Merge the fixed ${show} style template with order metadata and customer notes.

PRIORITY (strict, highest first):
1. Likeness — preserve recognizable identity from the supplied reference photos. Style transformation must NEVER come at the expense of facial likeness.
2. Correct human subject count (humanCharacterCount).
3. Requested composition and reference-photo roles from customer notes.
4. ${show} aesthetic (original characters in that show's look — not copying named cast).
5. Background embellishments and extras only when requested.

humanCharacterCount (${input.humanCharacterCount}) counts HUMAN subjects based on uploaded people / notes. It does NOT prohibit pets, creatures, monsters, spirits, dragons, or other non-human elements explicitly requested in customer notes.

referencePhotoCount: ${input.referencePhotoCount}. When notes describe multiple photos (couple shot vs individual portraits), infer and state explicit roles: Photo 1 = pose/composition; Photo 2+ = facial likeness for specific people. Use the customer's numbering when they provide it.

NON-INVENTION (critical): Never invent physical traits, clothing, accessories, relationships, ages, genders, poses, scene elements, or emotions not supported by the style template, order metadata, customer notes, or explicit reference instructions. If unsure, omit rather than guess.

The style template may say not to keep original composition — customer notes OVERRIDE that when they ask to keep pose/closeness from a specific photo.

backgroundChoice from order form: ${input.backgroundChoice}.
formatLabel: ${input.formatLabel}.
${input.printCompositionHint ? `printCompositionHint: ${input.printCompositionHint}` : "printCompositionHint: (none — use customer notes if they mention print size/orientation.)"}

Output JSON only, matching this shape (all string values, no markdown inside values):
${STRUCTURED_JSON_SHAPE}

Keep total content roughly under 280 words across all fields combined. openingLikeness must NOT lead with style-first wording (avoid opening with only "Create a … ${show} style portrait" without reference/likeness first).`;
}

export async function combineArtPromptWithOpenAI(
  input: CombineArtPromptInput
): Promise<{ prompt: string; structured?: StructuredArtDirection }> {
  const model = getOpenAiModel();

  const user = JSON.stringify(
    {
      styleTemplate: input.stylePrompt.prompt,
      showTitle: input.stylePrompt.showTitle,
      medium: input.stylePrompt.medium,
      customerNotes: input.customerNotes.trim() || "(none)",
      humanCharacterCount: input.humanCharacterCount,
      referencePhotoCount: input.referencePhotoCount,
      backgroundChoice: input.backgroundChoice,
      formatLabel: input.formatLabel,
      printCompositionHint: input.printCompositionHint,
      expedited: input.expedited ?? false,
    },
    null,
    2
  );

  const raw = await openAiChatCompletion({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(input) },
      { role: "user", content: user },
    ],
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  if (typeof parsed.prompt === "string" && parsed.prompt.trim()) {
    const legacy = legacyPromptToStructured(parsed.prompt);
    return { prompt: parsed.prompt.trim(), structured: legacy };
  }

  const structured = parseStructuredArtDirection(parsed);
  if (!structured) {
    throw new Error("OpenAI response missing structured art direction");
  }

  const prompt = assembleArtPromptFromStructured(structured);
  if (!prompt.trim()) {
    throw new Error("OpenAI response assembled to empty prompt");
  }

  return { prompt: prompt.trim(), structured };
}
