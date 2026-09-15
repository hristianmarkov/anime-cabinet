import type { KeywordResearch } from "./types";
import { loadEnvLocal, openAiTemperature } from "./env";

export async function generateGeoQueries(
  primaryKeyword: string,
  research: KeywordResearch
): Promise<string[]> {
  loadEnvLocal();
  const apiKey = process.env.OPENAI_API_KEY;
  const questionKeywords = research.ideas
    .filter((i) => i.keyword.includes("how ") || i.keyword.includes("what "))
    .map((i) => i.keyword)
    .slice(0, 5);

  if (!apiKey) {
    return questionKeywords.length
      ? questionKeywords
      : [
          `How do I order a ${primaryKeyword}?`,
          `How long does a ${primaryKeyword} take?`,
          `What photo works best for a ${primaryKeyword}?`,
        ];
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const body: Record<string, unknown> = {
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Generate natural search questions for Google AI Overviews about custom anime/cartoon portrait commissions. Return JSON: { questions: string[] }",
        },
        {
          role: "user",
          content: `Primary keyword: ${primaryKeyword}\nExisting questions: ${questionKeywords.join(", ")}`,
        },
      ],
    };
  const temp = openAiTemperature(0.4);
  if (temp !== undefined) body.temperature = temp;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return questionKeywords;
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return questionKeywords;

  try {
    const parsed = JSON.parse(content) as { questions?: string[] };
    return parsed.questions?.slice(0, 8) ?? questionKeywords;
  } catch {
    return questionKeywords;
  }
}
