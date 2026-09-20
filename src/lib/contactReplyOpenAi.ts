import { getOpenAiModel, openAiChatCompletion } from "@/lib/openAiChat";

export async function draftContactReplyWithOpenAI(input: {
  customerName: string;
  subject: string;
  thread: { direction: "inbound" | "outbound"; body: string }[];
  adminNotes?: string;
}): Promise<string> {
  const model = getOpenAiModel();

  const system = `You write email replies for Anime Cabinet customer support.
Tone: warm, concise, professional. Sign off as "The Anime Cabinet team".
Do not invent order details or policies. If unsure, suggest the customer reply with their order ID.
Output plain text only (no markdown).`;

  const user = JSON.stringify(
    {
      customerName: input.customerName,
      subject: input.subject,
      conversation: input.thread,
      adminNotesToInclude: input.adminNotes?.trim() || null,
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
