import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import {
  sendDeliveryAutoCompletedEmail,
  sendRevisionReminderEmail,
} from "@/lib/emails";
import { statusAfterReviewWindowLapse } from "@/lib/orderWorkflow";
import { REVISION_REMINDER_HOURS } from "@/lib/orderDeliveryRules";
import { orderDeliveries, orders, type Order, type OrderDelivery } from "@/lib/schema";

const HOUR_MS = 60 * 60 * 1000;

export function pendingDeliveryActions(
  delivery: Pick<
    OrderDelivery,
    "sentAt" | "revisionDeadline" | "reminder24SentAt" | "reminder48SentAt"
  >,
  now: Date
): { expire: boolean; reminder24: boolean; reminder48: boolean } {
  if (!delivery.sentAt) {
    return { expire: false, reminder24: false, reminder48: false };
  }

  const nowMs = now.getTime();
  if (delivery.revisionDeadline && nowMs >= new Date(delivery.revisionDeadline).getTime()) {
    return { expire: true, reminder24: false, reminder48: false };
  }

  const elapsedMs = nowMs - new Date(delivery.sentAt).getTime();
  return {
    expire: false,
    reminder24:
      elapsedMs >= REVISION_REMINDER_HOURS[0] * HOUR_MS &&
      elapsedMs < REVISION_REMINDER_HOURS[1] * HOUR_MS &&
      !delivery.reminder24SentAt,
    reminder48:
      elapsedMs >= REVISION_REMINDER_HOURS[1] * HOUR_MS && !delivery.reminder48SentAt,
  };
}

async function loadOrder(orderId: string): Promise<Order | null> {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return order ?? null;
}

async function expireDeliveryReview(order: Order, delivery: OrderDelivery): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db
    .update(orderDeliveries)
    .set({ autoCompletedAt: now })
    .where(eq(orderDeliveries.id, delivery.id));

  const nextStatus = statusAfterReviewWindowLapse(order);
  await db.update(orders).set({ status: nextStatus }).where(eq(orders.id, order.id));

  await sendDeliveryAutoCompletedEmail(order, delivery);

  await addOrderTimelineEvent({
    orderId: order.id,
    kind: "auto_completed",
    summary: "Review window ended — final file required",
    detail: `Version ${delivery.versionNumber} auto-approved after revision window.`,
    metadata: { deliveryId: delivery.id, status: nextStatus },
  });
}

export async function processPendingDeliveries(): Promise<{
  reminders24: number;
  reminders48: number;
  expired: number;
}> {
  const db = getDb();
  const now = new Date();
  let reminders24 = 0;
  let reminders48 = 0;
  let expired = 0;

  const openDeliveries = await db
    .select()
    .from(orderDeliveries)
    .where(and(isNotNull(orderDeliveries.sentAt), isNull(orderDeliveries.autoCompletedAt)));

  for (const delivery of openDeliveries) {
    const sentAt = delivery.sentAt;
    if (!sentAt) continue;

    const order = await loadOrder(delivery.orderId);
    if (!order || order.status === "cancelled") continue;

    const actions = pendingDeliveryActions(delivery, now);

    if (actions.expire) {
      await expireDeliveryReview(order, delivery);
      expired++;
      continue;
    }

    if (actions.reminder24) {
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

    if (actions.reminder48) {
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
  }

  return { reminders24, reminders48, expired };
}
