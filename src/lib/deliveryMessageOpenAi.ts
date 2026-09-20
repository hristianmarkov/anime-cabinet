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

export async function draftDeliveryMessageWithOpenAI(
  input: DeliveryMessageOrderContext
): Promise<string> {
  const model = getOpenAiModel();

  const system = `You write the optional personal message that appears in Anime Cabinet's "artwork ready to review" email when an artist sends a preview to the customer.

Rules:
- Output plain text only (no markdown, no subject line).
- Tone: warm, concise, professional. You may sign off briefly as "The Anime Cabinet team" only if it fits naturally; often no sign-off is needed because the email template already has one.
- Use ONLY the order facts and adminNotes in the user JSON. Do not invent details, discounts, or policies.
- NEVER include art-direction briefs, image-generation prompts, style templates, or internal artist instructions (e.g. long descriptions of linework, backgrounds, or "transform the photo into…").
- The styleName field is the product the customer ordered (e.g. a show style label) — you may mention it naturally once; do not expand it into art direction.
- If deliveryVersion is 1, this is the first preview; if greater than 1, acknowledge it is an updated version after their feedback.
- Mention they can reply to the email with revision requests within revisionHours if helpful, without being repetitive.
- Keep the message short unless adminNotes ask for more detail (typically 2–5 sentences).`;

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

  return openAiChatCompletion({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
}
