import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orderDeliveries, type OrderDelivery } from "@/lib/schema";

export async function getLatestSentDelivery(orderId: string): Promise<OrderDelivery | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(orderDeliveries)
    .where(eq(orderDeliveries.orderId, orderId))
    .orderBy(desc(orderDeliveries.versionNumber))
    .limit(1);
  return row?.sentAt ? row : null;
}
