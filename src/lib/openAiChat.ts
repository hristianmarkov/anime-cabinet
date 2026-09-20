export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

/** Chat models that only accept the API default temperature (omit `temperature` in the body). */
export function openAiModelUsesFixedTemperature(model: string): boolean {
  const m = model.toLowerCase();
  return /^o\d/.test(m) || m.includes("gpt-5") || m.includes("reasoning");
}

export function openAiTemperature(model: string): number | undefined {
  if (openAiModelUsesFixedTemperature(model)) return undefined;
  const raw = process.env.OPENAI_TEMPERATURE?.trim();
  if (raw === "" || raw === "default") return undefined;
  if (raw) {
    const n = Number(raw);
    if (!Number.isNaN(n)) return n;
  }
  return 0.4;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function buildOpenAiChatBody(input: {
  model: string;
  messages: ChatMessage[];
  response_format?: { type: "json_object" };
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: input.model,
    messages: input.messages,
  };
  if (input.response_format) {
    body.response_format = input.response_format;
  }
  const temperature = openAiTemperature(input.model);
  if (temperature !== undefined) {
    body.temperature = temperature;
  }
  return body;
}

export async function openAiChatCompletion(input: {
  model: string;
  messages: ChatMessage[];
  response_format?: { type: "json_object" };
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildOpenAiChatBody(input)),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error("Empty OpenAI response");
  return content.trim();
}
