import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { nextWorkingDayAtNineLondon } from "@/lib/londonSchedule";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { notifyCustomerOfStatusChange } from "@/lib/orderStatusEmails";
import { orders } from "@/lib/schema";

export const SCHEDULED_PRODUCTION_SOURCE_STATUS = "paid" as const;

/** Only successfully paid orders may enter production from the scheduled job. */
export function isEligibleForScheduledProduction(status: string): boolean {
  return status === SCHEDULED_PRODUCTION_SOURCE_STATUS;
}

export async function processScheduledProduction(): Promise<number> {
  const db = getDb();
  const now = new Date();

  // Filter at the database boundary so pending-payment (and every other)
  // order is never considered for scheduling, notification, or progression.
  const paidOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.status, SCHEDULED_PRODUCTION_SOURCE_STATUS));

  let moved = 0;
  let backfilled = 0;
  let overdue = 0;

  for (const order of paidOrders) {
    const scheduled =
      order.productionScheduledAt ??
      nextWorkingDayAtNineLondon(order.createdAt);

    if (!order.productionScheduledAt) {
      const backfill = await db
        .update(orders)
        .set({ productionScheduledAt: scheduled })
        .where(and(
          eq(orders.id, order.id),
          eq(orders.status, SCHEDULED_PRODUCTION_SOURCE_STATUS),
          isNull(orders.productionScheduledAt)
        ))
        .returning({ id: orders.id });
      backfilled += backfill.length;
    }

    if (scheduled.getTime() > now.getTime()) continue;
    overdue++;

    // Claim the order atomically. Only the cron invocation that changes paid ->
    // in_progress may emit the timeline event and customer notification.
    const [claimed] = await db
      .update(orders)
      .set({ status: "in_progress" })
      .where(and(
        eq(orders.id, order.id),
        eq(orders.status, SCHEDULED_PRODUCTION_SOURCE_STATUS)
      ))
      .returning();
    if (!claimed) continue;

    await addOrderTimelineEvent({
      orderId: order.id,
      kind: "status_updated",
      summary: "In production — studio queue (9:00 UK)",
      metadata: { from: "paid", to: "in_progress", scheduledAt: scheduled.toISOString() },
    });

    try {
      await notifyCustomerOfStatusChange(claimed, "paid", "in_progress");
    } catch (err) {
      console.error("Scheduled production email failed:", err);
    }

    moved++;
  }

  console.info("Scheduled production reconciliation completed", {
    paidScanned: paidOrders.length,
    schedulesBackfilled: backfilled,
    overdueFound: overdue,
    productionStarted: moved,
  });

  return moved;
}
