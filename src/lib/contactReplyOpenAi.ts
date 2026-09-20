export async function draftContactReplyWithOpenAI(input: {
  customerName: string;
  subject: string;
  thread: { direction: "inbound" | "outbound"; body: string }[];
  adminNotes?: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

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

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty OpenAI response");
  return text;
}
