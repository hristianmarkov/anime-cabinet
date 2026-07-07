import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";
import { sendNewOrderAlert, sendOrderConfirmation } from "@/lib/emails";
import { incrementSatisfiedBuyers } from "@/lib/siteStats";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const db = getDb();
      const [order] = await db
        .update(orders)
        .set({ status: "paid" })
        .where(eq(orders.id, orderId))
        .returning();

      if (order) {
        await incrementSatisfiedBuyers();
        // Emails must not fail the webhook — Stripe retries on non-2xx.
        try {
          await Promise.all([
            sendOrderConfirmation(order),
            sendNewOrderAlert(order),
          ]);
        } catch (err) {
          console.error("Order email failed:", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
