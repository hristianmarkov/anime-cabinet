import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { nextWorkingDayAtNineLondon } from "@/lib/londonSchedule";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { notifyCustomerOfStatusChange } from "@/lib/orderStatusEmails";
import { orders } from "@/lib/schema";

export async function processScheduledProduction(): Promise<number> {
  const db = getDb();
  const now = new Date();

  const paidOrders = await db.select().from(orders).where(eq(orders.status, "paid"));

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
        .where(and(eq(orders.id, order.id), eq(orders.status, "paid"), isNull(orders.productionScheduledAt)))
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
      .where(and(eq(orders.id, order.id), eq(orders.status, "paid")))
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
