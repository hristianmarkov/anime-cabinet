import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isCurrencyCode, type CurrencyCode } from "@/data/currencies";
import {
  MAX_CHARACTERS,
  PRINT_FORMATS,
  orderTotalCents,
  getOrderFormatLabel,
  isPrintFormat,
} from "@/data/pricing";
import { getStyleBySlug } from "@/data/styles";
import { site } from "@/data/site";
import { getDb } from "@/lib/db";
import { checkoutShippingRate, PRINT_DESTINATIONS } from "@/lib/print-shipping";
import { orders } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";

interface CheckoutPayload {
  styleSlug: string;
  characters: number;
  formatId: string;
  notes: string;
  photoUrls: string[];
  expedited?: boolean;
  currency?: CurrencyCode;
}

function baseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const origin = request.headers.get("origin");
  return origin ?? site.url;
}

export async function POST(request: Request) {
  let payload: CheckoutPayload | null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const style = getStyleBySlug(payload.styleSlug);
  const format = PRINT_FORMATS.find((f) => f.id === payload.formatId);
  const characters = Number(payload.characters);
  const currency = payload.currency ?? "USD";
  const expedited = Boolean(payload.expedited);

  if (
    !isCurrencyCode(currency) ||
    !style ||
    !format ||
    !Number.isInteger(characters) ||
    characters < 1 ||
    characters > MAX_CHARACTERS ||
    !Array.isArray(payload.photoUrls) ||
    payload.photoUrls.length === 0
  ) {
    return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
  }

  const needsShipping = isPrintFormat(format.id);
  const amountCents = orderTotalCents({ characters, currency, expedited, formatId: format.id });
  const currencyCode = currency.toLowerCase();

  const descParts = [
    `${characters} character${characters > 1 ? "s" : ""}`,
    getOrderFormatLabel(format.id),
    expedited ? "24h priority" : `${site.deliveryHours}h artwork preview`,
  ];

  try {
    const db = getDb();
    const [order] = await db
      .insert(orders)
      .values({
        styleSlug: style.slug,
        styleName: style.productName,
        characters,
        // Retained as an internal compatibility value for existing schemas;
        // customers no longer select or see a background option.
        background: "artist-choice",
        formatId: format.id,
        notes: (payload.notes ?? "").slice(0, 5000),
        email: "",
        photoUrls: payload.photoUrls.slice(0, 10),
        expedited,
        amountTotal: amountCents,
        currency: currencyCode,
      })
      .returning({ id: orders.id });

    const url = baseUrl(request);
    const stripe = getStripe();
    const confirmationUrl = `${url}/order/success?session_id={CHECKOUT_SESSION_ID}`;
    const session = await stripe.checkout.sessions.create({
      ui_mode: "hosted_page",
      success_url: confirmationUrl,
      cancel_url: `${url}/portraits/${style.slug}`,
      integration_identifier: "anime-cabinet-jnwpxqfz",
      ...(needsShipping ? {
        shipping_address_collection: { allowed_countries: [...PRINT_DESTINATIONS] },
        shipping_options: [checkoutShippingRate(currencyCode)],
        metadata: { orderId: order.id, printDelivery: "stripe" },
      } : { metadata: { orderId: order.id } }),
      mode: "payment",
      adaptive_pricing: { enabled: false },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currencyCode,
            unit_amount: amountCents,
            product_data: {
              name: style.productName,
              description: descParts.join(" · "),
            },
          },
        },
      ],
    });

    await db
      .update(orders)
      .set({ stripeSessionId: session.id })
      .where(eq(orders.id, order.id));

    try {
      await addOrderTimelineEvent({
        orderId: order.id,
        kind: "order_created",
        summary: "Order created — awaiting payment",
        metadata: { styleSlug: style.slug, formatId: format.id },
      });
    } catch (err) {
      console.error("Timeline event failed:", err);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please try again shortly." },
      { status: 500 }
    );
  }
}
