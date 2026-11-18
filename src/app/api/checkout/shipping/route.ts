import { timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isPrintFormat } from "@/data/pricing";
import { getDb } from "@/lib/db";
import { checkoutShippingRate, getPrintDelivery, readCheckoutAddress } from "@/lib/print-shipping";
import { orders } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const recipient = readCheckoutAddress(body?.shippingDetails);
  const sessionId = body?.sessionId;
  if (!recipient || typeof sessionId !== "string" || !/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Enter a complete shipping address." }, { status: 400 });
  }

  const token = request.headers.get("authorization")?.slice(7);
  if (!token?.startsWith(`${sessionId}_secret_`)) {
    return NextResponse.json({ error: "Checkout session not available." }, { status: 403 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const secret = session.client_secret;
    if (!secret || Buffer.byteLength(token) !== Buffer.byteLength(secret) ||
        !timingSafeEqual(Buffer.from(token), Buffer.from(secret)) || session.status !== "open" ||
        session.ui_mode !== "form" || session.metadata?.printDelivery !== "stripe") {
      return NextResponse.json({ error: "Checkout session not available." }, { status: 403 });
    }

    const [order] = await getDb().select({ formatId: orders.formatId, currency: orders.currency })
      .from(orders).where(and(eq(orders.stripeSessionId, sessionId), eq(orders.status, "pending"))).limit(1);
    if (!order || !isPrintFormat(order.formatId)) {
      return NextResponse.json({ error: "Print order not available." }, { status: 404 });
    }

    const { standard, express, quoteId } = await getPrintDelivery(order.formatId, order.currency, recipient);
    if (!standard) {
      return NextResponse.json({ error: "Delivery is unavailable for this address." }, { status: 422 });
    }

    const shippingOptions = [checkoutShippingRate(order.currency, "Standard", standard, quoteId)];
    if (express) shippingOptions.push(checkoutShippingRate(order.currency, "Express", express, quoteId));

    await stripe.checkout.sessions.update(sessionId, { shipping_options: shippingOptions });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Stripe shipping update failed:", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "Could not load delivery options. Please try again." }, { status: 502 });
  }
}
