import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import {
  sendDeliveryAutoCompletedEmail,
  sendRevisionReminderEmail,
} from "@/lib/emails";
import { statusAfterReviewWindowLapse } from "@/lib/orderWorkflow";
import { orderDeliveries, orders, type Order, type OrderDelivery } from "@/lib/schema";

const HOUR_MS = 60 * 60 * 1000;

async function loadOrder(orderId: string): Promise<Order | null> {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order ?? null;
}

async function completeDelivery(order: Order, delivery: OrderDelivery): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db
    .update(orderDeliveries)
    .set({ autoCompletedAt: now })
    .where(eq(orderDeliveries.id, delivery.id));

  const nextStatus = statusAfterReviewWindowLapse(order);
  await db.update(orders).set({
    status: nextStatus,
    digitalFulfillmentStatus: "completed",
    ...(nextStatus === "delivered" ? {} : { shippingFulfillmentStatus: "approved" as const }),
  }).where(eq(orders.id, order.id));

  await sendDeliveryAutoCompletedEmail(order, delivery);

  await addOrderTimelineEvent({
    orderId: order.id,
    kind: "auto_completed",
    summary:
      nextStatus === "delivered"
        ? "Review window ended — order completed"
        : "Review window ended — artwork approved, ready for print",
    detail: `Version ${delivery.versionNumber} auto-approved after revision window.`,
    metadata: { deliveryId: delivery.id, status: nextStatus },
  });
}

export async function processPendingDeliveries(): Promise<{
  reminders24: number;
  reminders48: number;
  completed: number;
}> {
  const db = getDb();
  const now = new Date();
  let reminders24 = 0;
  let reminders48 = 0;
  let completed = 0;

  const openDeliveries = await db
    .select()
    .from(orderDeliveries)
    .where(and(isNotNull(orderDeliveries.sentAt), isNull(orderDeliveries.autoCompletedAt)));

  for (const delivery of openDeliveries) {
    const sentAt = delivery.sentAt;
    if (!sentAt) continue;

    const order = await loadOrder(delivery.orderId);
    if (!order || order.status === "cancelled") continue;

    const sentMs = new Date(sentAt).getTime();

    if (now.getTime() >= sentMs + 24 * HOUR_MS && !delivery.reminder24SentAt) {
      await sendRevisionReminderEmail(order, delivery, 1);
      await db
        .update(orderDeliveries)
        .set({ reminder24SentAt: now })
        .where(eq(orderDeliveries.id, delivery.id));
      await addOrderTimelineEvent({
        orderId: order.id,
        kind: "reminder_24h",
        summary: "24-hour revision reminder sent",
        metadata: { deliveryId: delivery.id },
      });
      reminders24++;
    }

    if (now.getTime() >= sentMs + 48 * HOUR_MS && !delivery.reminder48SentAt) {
      await sendRevisionReminderEmail(order, delivery, 2);
      await db
        .update(orderDeliveries)
        .set({ reminder48SentAt: now })
        .where(eq(orderDeliveries.id, delivery.id));
      await addOrderTimelineEvent({
        orderId: order.id,
        kind: "reminder_48h",
        summary: "48-hour revision reminder sent",
        metadata: { deliveryId: delivery.id },
      });
      reminders48++;
    }

    if (
      delivery.revisionDeadline &&
      now.getTime() >= new Date(delivery.revisionDeadline).getTime()
    ) {
      await completeDelivery(order, delivery);
      completed++;
    }
  }

  return { reminders24, reminders48, completed };
}
