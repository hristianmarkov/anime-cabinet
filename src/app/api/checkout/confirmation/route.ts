import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";

/** Public summary for GA purchase event on the success page (no PII). */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 404 });
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || order.stripeSessionId !== sessionId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      transaction_id: sessionId,
      value: order.amountTotal / 100,
      currency: order.currency,
      item_id: order.styleSlug,
      item_name: order.styleName,
      item_category: order.formatId,
    });
  } catch (error) {
    console.error("checkout confirmation:", error);
    return NextResponse.json({ error: "Unable to load order" }, { status: 500 });
  }
}
