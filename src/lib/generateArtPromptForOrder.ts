import { eq } from "drizzle-orm";
import { combineArtPromptWithOpenAI } from "@/lib/artPromptOpenAi";
import { getDb } from "@/lib/db";
import { getStyleArtPromptOrFallback } from "@/data/style-art-prompts";
import { BACKGROUND_OPTIONS } from "@/data/pricing";
import { orders } from "@/lib/schema";

export type GenerateArtPromptResult =
  | {
      ok: true;
      showTitle: string;
      basePrompt: string;
      prompt: string;
    }
  | { ok: false; error: string; status: number };

export async function generateArtPromptForOrder(orderId: string): Promise<GenerateArtPromptResult> {
  const trimmed = orderId.trim();
  if (!trimmed) {
    return { ok: false, error: "orderId is required", status: 400 };
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, trimmed)).limit(1);
  if (!order) {
    return { ok: false, error: "Order not found", status: 404 };
  }

  const stylePrompt = getStyleArtPromptOrFallback(order.styleSlug, order.styleName);
  const backgroundLabel =
    BACKGROUND_OPTIONS.find((b) => b.id === order.background)?.label ?? order.background;

  const combined = await combineArtPromptWithOpenAI({
    stylePrompt,
    customerNotes: order.notes,
    humanCharacterCount: order.characters,
    referencePhotoCount: order.photoUrls?.length ?? 0,
    backgroundChoice: backgroundLabel,
    expedited: order.expedited,
  });

  return {
    ok: true,
    showTitle: stylePrompt.showTitle,
    basePrompt: stylePrompt.prompt,
    ...combined,
  };
}
