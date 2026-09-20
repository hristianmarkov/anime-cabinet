import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { combineArtPromptWithOpenAI } from "@/lib/artPromptOpenAi";
import { getDb } from "@/lib/db";
import { getStyleArtPromptOrFallback } from "@/data/style-art-prompts";
import { BACKGROUND_OPTIONS } from "@/data/pricing";
import { orders } from "@/lib/schema";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  try {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const stylePrompt = getStyleArtPromptOrFallback(order.styleSlug, order.styleName);
    const backgroundLabel =
      BACKGROUND_OPTIONS.find((b) => b.id === order.background)?.label ?? order.background;

    const combined = await combineArtPromptWithOpenAI({
      stylePrompt,
      customerNotes: order.notes,
      characters: order.characters,
      backgroundChoice: backgroundLabel,
      expedited: order.expedited,
    });

    return NextResponse.json({
      ok: true,
      showTitle: stylePrompt.showTitle,
      basePrompt: stylePrompt.prompt,
      baseNegativePrompt: stylePrompt.negativePrompt,
      ...combined,
    });
  } catch (error) {
    console.error("generate-art-prompt:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
