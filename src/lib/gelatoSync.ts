import { and, eq, isNotNull, notInArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getGelatoOrder, isGelatoConfigured, mapGelatoFulfillmentToOrderStatus } from "@/lib/gelato";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { notifyCustomerOfStatusChange } from "@/lib/orderStatusEmails";
import { getLatestSentDelivery } from "@/lib/orderDeliveries";
import { orders } from "@/lib/schema";

export async function syncGelatoOrdersFromApi(): Promise<{ synced: number; updated: number }> {
  if (!isGelatoConfigured()) {
    return { synced: 0, updated: 0 };
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        isNotNull(orders.gelatoOrderId),
        notInArray(orders.status, ["delivered", "cancelled"])
      )
    );

  let synced = 0;
  let updated = 0;

  for (const order of rows) {
    if (!order.gelatoOrderId) continue;
    synced++;

    try {
      const remote = await getGelatoOrder(order.gelatoOrderId);
      const mapped = mapGelatoFulfillmentToOrderStatus(remote.fulfillmentStatus);
      const patch: Partial<typeof orders.$inferInsert> = {
        gelatoFulfillmentStatus: remote.fulfillmentStatus,
        trackingNumber: remote.trackingNumber ?? order.trackingNumber,
        trackingUrl: remote.trackingUrl ?? order.trackingUrl,
      };

      let nextStatus = order.status;
      if (mapped && mapped !== order.status) {
        const rank: Record<string, number> = {
          approved: 1,
          printing: 2,
          shipped: 3,
          delivered: 4,
        };
        if ((rank[mapped] ?? 0) >= (rank[order.status] ?? 0)) {
          patch.status = mapped;
          nextStatus = mapped;
        }
      }

      const changed =
        patch.gelatoFulfillmentStatus !== order.gelatoFulfillmentStatus ||
        patch.trackingNumber !== order.trackingNumber ||
        patch.trackingUrl !== order.trackingUrl ||
        patch.status !== undefined;

      if (!changed) continue;

      await db.update(orders).set(patch).where(eq(orders.id, order.id));
      updated++;

      await addOrderTimelineEvent({
        orderId: order.id,
        kind: "gelato_status_sync",
        summary: `Gelato: ${remote.fulfillmentStatus ?? "updated"}`,
        metadata: {
          trackingNumber: remote.trackingNumber,
          trackingUrl: remote.trackingUrl,
        },
      });

      if (patch.status && order.status !== nextStatus) {
        const [fresh] = await db.select().from(orders).where(eq(orders.id, order.id)).limit(1);
        if (fresh) {
          const latestDelivery = await getLatestSentDelivery(order.id);
          await notifyCustomerOfStatusChange(fresh, order.status, nextStatus, { latestDelivery });
        }
      }
    } catch (err) {
      console.error(`Gelato sync failed for order ${order.id}:`, err);
    }
  }

  return { synced, updated };
}
