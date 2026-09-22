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
  /** 1 = first preview, 2+ = revision send */
  deliveryVersion: number;
  adminNotes?: string;
}

type DeliveryPromptMessage = {
  role: "system" | "user";
  content: string;
};

/** Build the prompt separately so its customer-facing requirements can be unit tested. */
export function buildDeliveryMessagePrompt(
  input: DeliveryMessageOrderContext
): DeliveryPromptMessage[] {
  const previewVersionRule =
    input.deliveryVersion === 1
      ? "This is the first preview. Clearly describe the attached artwork as a preliminary preview, not as the final artwork or final file."
      : "This is a revised preview following the customer's feedback. Acknowledge the update while still clearly describing the attached artwork as a preliminary preview, not as the final artwork or final file.";

  const system = `You write the optional personal message that appears in Anime Cabinet's "artwork ready to review" email when an artist sends a preview to the customer.

Rules:
- Output plain text only (no markdown, no subject line).
- Tone: warm, concise, professional. You may sign off briefly as "The Anime Cabinet team" only if it fits naturally; often no sign-off is needed because the email template already has one.
- Use ONLY the order facts and adminNotes in the user JSON. Do not invent details, discounts, or policies.
- Treat adminNotes as source material to rewrite into a polished customer-facing message, not as optional context to summarize. When adminNotes are present, preserve every customer-relevant factual point, explanation, uncertainty, and artistic decision they contain.
- You may improve grammar, spelling, structure, warmth, and professionalism, but do not omit or combine details merely to make the message shorter. Write the shortest natural message that retains all meaningful information; detailed adminNotes may require a longer response.
- Keep distinct details distinct and attribute them accurately. This includes which character an accessory belongs to, which reference photo supplied a detail, why an element was omitted, and where the artist had to interpret unclear source material.
- Do not strengthen uncertain language into a fact. Preserve the appropriate qualification of phrases such as "we think," "we interpreted," and "we had to use some imagination."
- NEVER include art-direction briefs, image-generation prompts, style templates, or internal artist instructions (e.g. long descriptions of linework, backgrounds, or "transform the photo into…").
- The styleName field is the product the customer ordered (e.g. a show style label) — you may mention it naturally once; do not expand it into art direction.
- ${previewVersionRule}
- Invite the customer to reply with any comments or revision notes within 72 hours.
- State clearly that if no response is received within 72 hours, the order will automatically advance to the Digital File stage.
- Explain that the final high-resolution, print-ready file will be supplied separately afterward; do not imply that the attached preliminary preview is that final file.
- These preview, 72-hour, automatic-advance, and separately-supplied-final-file requirements are mandatory even if adminNotes do not mention them.
- For longer messages, use short, customer-friendly paragraphs. Keep the message concise when possible, but never omit customer-relevant details or the mandatory information above.`;

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
        deliveryVersion: input.deliveryVersion,
      },
      adminNotes: input.adminNotes?.trim() || null,
    },
    null,
    2
  );

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export async function draftDeliveryMessageWithOpenAI(
  input: DeliveryMessageOrderContext
): Promise<string> {
  const model = getOpenAiModel();

  return openAiChatCompletion({
    model,
    messages: buildDeliveryMessagePrompt(input),
  });
}
