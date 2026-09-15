import type { ContentBrief, ContentDraft } from "./types";
import { loadDraftContext } from "./context";
import { loadEnvLocal, openAiTemperature } from "./env";
import { loadPage } from "./pages";
import { draftPath, writeJson } from "./paths";

function buildJsonSchema(brief: ContentBrief): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const slot of brief.slots) {
    required.push(slot.name);
    if (["description", "faqs", "keywords", "sections", "bodySections"].includes(slot.name)) {
      properties[slot.name] = { type: "string", description: `${slot.instruction} Return valid JSON as a string.` };
    } else {
      properties[slot.name] = { type: "string", description: slot.instruction };
    }
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

export async function writeDraft(
  url: string,
  brief: ContentBrief,
  options: { retryThin?: boolean } = {}
): Promise<ContentDraft> {
  loadEnvLocal();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set in .env.local");
  }

  const page = loadPage(url);
  const context = loadDraftContext(page);
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const systemPrompt = `You are an SEO copywriter for Anime Cabinet (animecabinet.com), a hand-drawn custom anime and cartoon portrait shop.

Rules:
- Hand-drawn by human artists — never describe the product as AI-generated or an AI filter.
- Fan-art inspired style: customers become original characters in a style's visual language — not impersonating copyrighted characters.
- Delivery: preview within ${context.site && (context.site as { deliveryHours: string }).deliveryHours} hours standard; unlimited free revisions.
- Internal links use markdown: [anchor text](/portraits/slug) or [text](/blog/slug).
- Do not invent customer reviews, star ratings, or fake statistics.
- Match the brief's word count target (${brief.wordCount.target} words total across body fields).
- Respect cannibalization: supporting pages use long-tail intent and link to owner URLs listed in the brief.
- Unique angle: ${brief.uniqueAngle}
- Primary keyword: ${brief.keywords.primary}
- On-page keywords to weave naturally: ${brief.keywords.onPage.slice(0, 6).join(", ")}
- Answer these GEO questions in FAQ or body where relevant: ${brief.geoQueries.slice(0, 5).join("; ")}
${brief.layout === "style-landing" ? `
Product page rules:
- description must be a JSON array of exactly 2-3 paragraphs (never put FAQs in description).
- faqs must be a JSON array of exactly 2 objects {q, a} in the faqs field only.
- Do not use markdown bold (**). Plain text only.
- Never target AI-tool keywords (generator, filter, photo to anime) in keywords array.
- Do not include Australia/geo keywords unless the brief primary keyword mentions them.
- Minimum ${brief.wordCount.min} words across description + faqs + metaDescription.` : ""}
${options.retryThin ? `
IMPORTANT: Previous draft was too thin. Write longer, style-specific description paragraphs.` : ""}`;

  const userPrompt = JSON.stringify({ brief, context }, null, 2);

  const body: Record<string, unknown> = {
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "content_draft",
          strict: true,
          schema: buildJsonSchema(brief),
        },
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };
  const temp = openAiTemperature(0.55);
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
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");

  const slots = JSON.parse(content) as Record<string, unknown>;

  const draft: ContentDraft = {
    url,
    slug: brief.slug,
    layout: brief.layout,
    generatedAt: new Date().toISOString(),
    model,
    slots,
  };

  writeJson(draftPath(brief.slug), draft);
  return draft;
}
