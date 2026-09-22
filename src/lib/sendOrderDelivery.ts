import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sendDeliveryPreviewEmail } from "@/lib/emails";
import {
  revisionDeadlineFromSentAt,
  revisionWindowHours,
} from "@/lib/orderDeliveryRules";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { orderDeliveries, orderReviewMessages, orders } from "@/lib/schema";

export async function sendOrderDeliveryToCustomer(input: {
  orderId: string;
  comment: string;
  imageUrls: string[];
}): Promise<{ ok: true; deliveryId: string } | { ok: false; error: string }> {
  if (input.imageUrls.length === 0) {
    return { ok: false, error: "Add at least one artwork image." };
  }
  if (input.imageUrls.length > 10) {
    return { ok: false, error: "Maximum 10 images per delivery." };
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "cancelled") {
    return { ok: false, error: "Cannot send artwork for a cancelled order." };
  }

  const [latest] = await db
    .select({ versionNumber: orderDeliveries.versionNumber })
    .from(orderDeliveries)
    .where(eq(orderDeliveries.orderId, order.id))
    .orderBy(desc(orderDeliveries.versionNumber))
    .limit(1);

  const versionNumber = (latest?.versionNumber ?? 0) + 1;
  const revisionHours = revisionWindowHours(order);
  const now = new Date();
  const revisionDeadline = revisionDeadlineFromSentAt(now);

  await db
    .update(orderDeliveries)
    .set({ autoCompletedAt: now })
    .where(
      and(
        eq(orderDeliveries.orderId, order.id),
        isNotNull(orderDeliveries.sentAt),
        isNull(orderDeliveries.autoCompletedAt)
      )
    );

  const [delivery] = await db
    .insert(orderDeliveries)
    .values({
      orderId: order.id,
      versionNumber,
      comment: input.comment.slice(0, 5000),
      imageUrls: input.imageUrls,
      sentAt: now,
      revisionHours,
      revisionDeadline,
    })
    .returning();

  await db.update(orders).set({ status: "review" }).where(eq(orders.id, order.id));

  if (input.comment.trim()) {
    await db.insert(orderReviewMessages).values({
      orderId: order.id,
      deliveryId: delivery.id,
      direction: "admin",
      author: "Anime Cabinet",
      body: input.comment.trim().slice(0, 5000),
    });
  }

  await sendDeliveryPreviewEmail(order, delivery);

  await addOrderTimelineEvent({
    orderId: order.id,
    kind: "delivery_sent",
    summary: `Artwork v${versionNumber} sent to customer`,
    detail: input.comment.trim() || undefined,
    metadata: {
      deliveryId: delivery.id,
      imageCount: input.imageUrls.length,
      revisionHours,
      revisionDeadline: revisionDeadline.toISOString(),
    },
  });

  return { ok: true, deliveryId: delivery.id };
}
