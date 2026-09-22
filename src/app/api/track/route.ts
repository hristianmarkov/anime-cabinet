import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { buildPublicOrderTracking } from "@/lib/orderTrackingPublic";
import {
  orderDeliveries,
  orderFinalFiles,
  orderTimelineEvents,
  orders,
} from "@/lib/schema";

export async function POST(request: Request) {
  let body: { orderId?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!orderId || !email) {
    return NextResponse.json({ error: "Order ID and email are required." }, { status: 400 });
  }

  try {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || order.email.toLowerCase() !== email) {
      return NextResponse.json({ error: "We couldn't find an order with those details." }, { status: 404 });
    }

    const deliveries = await db
      .select()
      .from(orderDeliveries)
      .where(eq(orderDeliveries.orderId, order.id))
      .orderBy(desc(orderDeliveries.versionNumber));

    const timeline = await db
      .select()
      .from(orderTimelineEvents)
      .where(eq(orderTimelineEvents.orderId, order.id))
      .orderBy(desc(orderTimelineEvents.createdAt))
      .limit(20);

    const [finalFile] = await db.select().from(orderFinalFiles)
      .where(eq(orderFinalFiles.orderId, order.id)).limit(1);

    return NextResponse.json({
      trackToken: order.trackToken,
      tracking: buildPublicOrderTracking(order, deliveries, timeline, finalFile ?? null),
    });
  } catch {
    return NextResponse.json({ error: "Tracking is temporarily unavailable." }, { status: 503 });
  }
}
