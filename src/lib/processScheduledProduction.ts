import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { nextWorkingDay915London } from "@/lib/londonSchedule";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { notifyCustomerOfStatusChange } from "@/lib/orderStatusEmails";
import { orders } from "@/lib/schema";

export async function processScheduledProduction(): Promise<number> {
  const db = getDb();
  const now = new Date();

  const paidOrders = await db.select().from(orders).where(eq(orders.status, "paid"));

  let moved = 0;

  for (const order of paidOrders) {
    const scheduled =
      order.productionScheduledAt ??
      nextWorkingDay915London(order.createdAt);

    if (!order.productionScheduledAt) {
      await db
        .update(orders)
        .set({ productionScheduledAt: scheduled })
        .where(eq(orders.id, order.id));
    }

    if (scheduled.getTime() > now.getTime()) continue;

    await db.update(orders).set({ status: "in_progress" }).where(eq(orders.id, order.id));

    await addOrderTimelineEvent({
      orderId: order.id,
      kind: "status_updated",
      summary: "In production — studio queue (9:15 UK)",
      metadata: { from: "paid", to: "in_progress", scheduledAt: scheduled.toISOString() },
    });

    const [updated] = await db.select().from(orders).where(eq(orders.id, order.id)).limit(1);
    if (updated) {
      try {
        await notifyCustomerOfStatusChange(updated, "paid", "in_progress");
      } catch (err) {
        console.error("Scheduled production email failed:", err);
      }
    }

    moved++;
  }

  return moved;
}
