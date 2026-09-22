import { getOpenAiModel, openAiChatCompletion } from "@/lib/openAiChat";

export interface DeliveryMessageOrderContext {
  customerName: string;
  styleName: string;
  characters: number;
  formatLabel: string;
  backgroundLabel: string;
  customerNotes: string;
  expedited: boolean;
  isDigital: boolean;
  revisionHours: number;
  /** 1 = first preview, 2+ = revision send */
  deliveryVersion: number;
  adminNotes?: string;
}

export function buildDeliveryMessagePrompt(input: DeliveryMessageOrderContext) {
  const system = `You write the optional personal message that appears in Anime Cabinet's "artwork ready to review" email when an artist sends a preview to the customer.

Rules:
- Output plain text only (no markdown, no subject line).
- Tone: warm, concise, professional. You may sign off briefly as "The Anime Cabinet team" only if it fits naturally; often no sign-off is needed because the email template already has one.
- Use ONLY the order facts and adminNotes in the user JSON. Do not invent details, discounts, or policies.
- Treat adminNotes as source material to rewrite into a polished customer-facing message, not as optional context to summarize. When adminNotes are present, preserve every customer-relevant factual point, explanation, uncertainty, and artistic decision they contain.
- You may improve grammar, spelling, structure, warmth, and professionalism, but do not omit or combine details merely to make the message shorter. Write the shortest natural message that retains all meaningful information; detailed adminNotes may require a longer response.
- Keep distinct details distinct and attribute them accurately. This includes which character an accessory belongs to, which reference photo supplied a detail, why an element was omitted, and where the artist had to interpret unclear source material.
- Do not strengthen uncertain language into a fact. Preserve the appropriate qualification of phrases such as "we think," "we interpreted," and "we had to use some imagination."
- NEVER include art-direction briefs, image-generation prompts, style templates, or internal artist instructions (e.g. long descriptions of linework, backgrounds, or "transform the photo into…"). Customer-relevant decisions and explanations in adminNotes are not internal instructions and must still be preserved.
- The styleName field is the product the customer ordered (e.g. a show style label) — you may mention it naturally once; do not expand it into art direction.
- If deliveryVersion is 1, this is the first preview; if greater than 1, acknowledge it is an updated version after their feedback.
- Explain that the customer can reply to the email with revision requests within revisionHours, and accurately explain the next step after that period using isDigital.
- For longer messages, use short, customer-friendly paragraphs when useful, in this order: greeting and preview introduction; details intentionally preserved; intentional artistic choices or interpretations; review instructions and the revisionHours-hour next step.`;

  const user = JSON.stringify(
    {
      order: {
        customerName: input.customerName,
        styleName: input.styleName,
        characters: input.characters,
        formatLabel: input.formatLabel,
        backgroundLabel: input.backgroundLabel,
        customerNotes: input.customerNotes.trim() || null,
        expedited: input.expedited,
        isDigital: input.isDigital,
        revisionHours: input.revisionHours,
        deliveryVersion: input.deliveryVersion,
      },
      adminNotes: input.adminNotes?.trim() || null,
    },
    null,
    2
  );

  return { system, user };
}

export async function draftDeliveryMessageWithOpenAI(
  input: DeliveryMessageOrderContext
): Promise<string> {
  const model = getOpenAiModel();
  const { system, user } = buildDeliveryMessagePrompt(input);

  return openAiChatCompletion({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
}
