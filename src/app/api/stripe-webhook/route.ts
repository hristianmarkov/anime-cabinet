import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/lib/db";
import { readCheckoutAddress } from "@/lib/print-shipping";
import { orders } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";
import { sendNewOrderAlert, sendOrderConfirmation } from "@/lib/emails";
import { incrementSatisfiedBuyers } from "@/lib/siteStats";
import { nextWorkingDayAtNineLondon } from "@/lib/londonSchedule";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { calculateFirstPreviewDeadline } from "@/lib/firstPreviewDeadline";

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

  if (
    (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") &&
    event.data.object.payment_status === "paid"
  ) {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const db = getDb();
      const paidAt = new Date(event.created * 1_000);
      const [pendingOrder] = await db
        .select({ createdAt: orders.createdAt, expedited: orders.expedited })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
        .limit(1);

      if (!pendingOrder) return NextResponse.json({ received: true });
      let delivery: Partial<typeof orders.$inferInsert> = {};
      if (session.metadata?.printDelivery === "stripe") {
        try {
          // Read the current API representation regardless of the webhook endpoint's API version.
          const checkout = await getStripe().checkout.sessions.retrieve(session.id, {
            expand: ["shipping_cost.shipping_rate"],
          });
          const recipient = readCheckoutAddress(checkout.collected_information?.shipping_details);
          const rate = checkout.shipping_cost?.shipping_rate;
          if (!recipient || !rate || typeof rate === "string" || checkout.amount_total === null) {
            throw new Error("Stripe delivery details are incomplete");
          }
          delivery = {
            amountTotal: checkout.amount_total,
            shippingAddress: recipient,
            shippingMethodUid: rate.metadata.gelatoMethod || null,
            shippingMethodName: rate.metadata.gelatoName
              ? `${rate.display_name} (${rate.metadata.gelatoName})`
              : rate.display_name,
            shippingAmount: checkout.shipping_cost?.amount_total ?? 0,
            gelatoQuoteId: rate.metadata.gelatoQuoteId || null,
          };
        } catch (error) {
          console.error("Stripe delivery details could not be saved:", error instanceof Error ? error.name : "Unknown error");
          return NextResponse.json({ error: "Could not save delivery details" }, { status: 500 });
        }
      }

      const [order] = await db
        .update(orders)
        .set({
          ...delivery,
          status: "paid",
          paidAt,
          firstPreviewDeadline: calculateFirstPreviewDeadline(
            new Date(pendingOrder.createdAt),
            pendingOrder.expedited
          ),
          productionScheduledAt: nextWorkingDayAtNineLondon(paidAt),
        })
        .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
        .returning();

      if (order) {
        await incrementSatisfiedBuyers();
        try {
          await addOrderTimelineEvent({
            orderId: order.id,
            kind: "payment_received",
            summary: "Payment received",
            metadata: { amountTotal: order.amountTotal, currency: order.currency },
          });
        } catch (err) {
          console.error("Timeline event failed:", err);
        }
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
