import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OrderTrackingDisplay } from "@/components/OrderTrackingDisplay";
import { getDb } from "@/lib/db";
import { buildPublicOrderTracking } from "@/lib/orderTrackingPublic";
import { orderDeliveries, orderReviewMessages, orderTimelineEvents, orders } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TrackOrderTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let order = null;
  let deliveries: (typeof orderDeliveries.$inferSelect)[] = [];
  let timeline: (typeof orderTimelineEvents.$inferSelect)[] = [];
  let reviewMessages: (typeof orderReviewMessages.$inferSelect)[] = [];

  try {
    const db = getDb();
    const [row] = await db.select().from(orders).where(eq(orders.trackToken, token)).limit(1);
    order = row ?? null;
    if (order) {
      deliveries = await db
        .select()
        .from(orderDeliveries)
        .where(eq(orderDeliveries.orderId, order.id))
        .orderBy(desc(orderDeliveries.versionNumber));
      timeline = await db
        .select()
        .from(orderTimelineEvents)
        .where(eq(orderTimelineEvents.orderId, order.id))
        .orderBy(desc(orderTimelineEvents.createdAt))
        .limit(20);
      reviewMessages = await db
        .select()
        .from(orderReviewMessages)
        .where(eq(orderReviewMessages.orderId, order.id))
        .orderBy(orderReviewMessages.createdAt);
    }
  } catch {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-flame">Tracking is temporarily unavailable. Please try again later.</p>
      </section>
    );
  }

  if (!order || order.status === "pending") {
    notFound();
  }

  const tracking = buildPublicOrderTracking(order, deliveries, timeline, reviewMessages);

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/track" className="text-sm font-semibold text-accent hover:underline">
        ← Look up another order
      </Link>
      <div className="mt-6">
        <OrderTrackingDisplay tracking={tracking} trackToken={token} />
      </div>
    </section>
  );
}
