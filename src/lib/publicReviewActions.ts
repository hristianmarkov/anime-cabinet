import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orderDeliveries, orders } from "@/lib/schema";

const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function consumeReviewRateLimit(token: string, action: string): boolean {
  const key = `${token}:${action}`;
  const cutoff = Date.now() - WINDOW_MS;
  const recent = (attempts.get(key) ?? []).filter((at) => at > cutoff);
  if (recent.length >= MAX_ATTEMPTS) return false;
  recent.push(Date.now());
  attempts.set(key, recent);
  return true;
}

export async function loadActivePublicReview(trackToken: string) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.trackToken, trackToken)).limit(1);
  if (!order || order.status !== "review") return null;
  const [delivery] = await db
    .select()
    .from(orderDeliveries)
    .where(and(eq(orderDeliveries.orderId, order.id), isNotNull(orderDeliveries.sentAt), isNull(orderDeliveries.autoCompletedAt)))
    .orderBy(desc(orderDeliveries.versionNumber))
    .limit(1);
  if (!delivery || !delivery.revisionDeadline || new Date(delivery.revisionDeadline).getTime() <= Date.now()) return null;
  return { db, order, delivery };
}

export async function closeReviewDelivery(deliveryId: string) {
  const db = getDb();
  await db.update(orderDeliveries).set({ autoCompletedAt: new Date() }).where(eq(orderDeliveries.id, deliveryId));
}
