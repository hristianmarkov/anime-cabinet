import type { StyleArtPrompt } from "@/data/style-art-prompts";

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

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

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty OpenAI response");

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
