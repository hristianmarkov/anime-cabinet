import { desc, eq } from "drizzle-orm";
import { BACKGROUND_OPTIONS, PRINT_FORMATS } from "@/data/pricing";
import { draftDeliveryMessageWithOpenAI } from "@/lib/deliveryMessageOpenAi";
import { getDb } from "@/lib/db";
import { isDigitalOrder } from "@/lib/orderDeliveryRules";
import { orderDeliveries, orders } from "@/lib/schema";

export type GenerateDeliveryMessageResult =
  | { ok: true; draft: string }
  | { ok: false; error: string; status: number };

function customerDisplayName(order: typeof orders.$inferSelect): string {
  const first = order.shippingAddress?.firstName?.trim();
  if (first) return first;
  const local = order.email.split("@")[0]?.replace(/[._]/g, " ").trim();
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "there";
}

export async function generateDeliveryMessageForOrder(
  orderId: string,
  adminNotes?: string
): Promise<GenerateDeliveryMessageResult> {
  const trimmed = orderId.trim();
  if (!trimmed) {
    return { ok: false, error: "orderId is required", status: 400 };
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, trimmed)).limit(1);
  if (!order) {
    return { ok: false, error: "Order not found", status: 404 };
  }

  const [latestDelivery] = await db
    .select({ versionNumber: orderDeliveries.versionNumber })
    .from(orderDeliveries)
    .where(eq(orderDeliveries.orderId, order.id))
    .orderBy(desc(orderDeliveries.versionNumber))
    .limit(1);

  const deliveryVersion = (latestDelivery?.versionNumber ?? 0) + 1;
  const formatLabel =
    PRINT_FORMATS.find((f) => f.id === order.formatId)?.label ?? order.formatId;
  const backgroundLabel =
    BACKGROUND_OPTIONS.find((b) => b.id === order.background)?.label ?? order.background;

  try {
    const draft = await draftDeliveryMessageWithOpenAI({
      customerName: customerDisplayName(order),
      styleName: order.styleName,
      characters: order.characters,
      formatLabel,
      backgroundLabel,
      customerNotes: order.notes,
      expedited: order.expedited,
      isDigital: isDigitalOrder(order),
      deliveryVersion,
      adminNotes,
    });
    return { ok: true, draft };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return { ok: false, error: message, status: 500 };
  }
}
