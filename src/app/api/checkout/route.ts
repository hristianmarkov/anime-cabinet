import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { convertFromUsd } from "@/data/currencies";
import type { CurrencyCode } from "@/data/currencies";
import {
  BACKGROUND_OPTIONS,
  MAX_CHARACTERS,
  PRINT_FORMATS,
  calcTotal,
  isPrintFormat,
} from "@/data/pricing";
import { getStyleBySlug } from "@/data/styles";
import { site } from "@/data/site";
import { getDb } from "@/lib/db";
import { orders, type ShippingAddress } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";

interface CheckoutPayload {
  styleSlug: string;
  characters: number;
  background: string;
  formatId: string;
  notes: string;
  email: string;
  photoUrls: string[];
  expedited?: boolean;
  currency?: CurrencyCode;
  shippingAddress?: ShippingAddress | null;
  shippingMethodUid?: string;
  shippingMethodName?: string;
  shippingAmountUsd?: number;
  gelatoQuoteId?: string;
}

function baseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const origin = request.headers.get("origin");
  return origin ?? site.url;
}

export async function POST(request: Request) {
  let payload: CheckoutPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const style = getStyleBySlug(payload.styleSlug);
  const format = PRINT_FORMATS.find((f) => f.id === payload.formatId);
  const background = BACKGROUND_OPTIONS.find((b) => b.id === payload.background);
  const characters = Number(payload.characters);
  const currencyCode = (payload.currency ?? "USD").toLowerCase();
  const expedited = Boolean(payload.expedited);
  const shippingUsd = payload.shippingAmountUsd ?? 0;

  if (
    !style ||
    !format ||
    !background ||
    !Number.isInteger(characters) ||
    characters < 1 ||
    characters > MAX_CHARACTERS ||
    !payload.email ||
    !Array.isArray(payload.photoUrls) ||
    payload.photoUrls.length === 0
  ) {
    return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
  }

  if (isPrintFormat(format.id)) {
    if (!payload.shippingAddress || !payload.shippingMethodUid || shippingUsd <= 0) {
      return NextResponse.json(
        { error: "Shipping address and method required for print orders." },
        { status: 400 }
      );
    }
  }

  const totalUsd = calcTotal({
    basePrice: style.priceFrom,
    characters,
    formatId: format.id,
    expedited,
    shippingUsd,
  });

  const chargeAmount = convertFromUsd(totalUsd, payload.currency ?? "USD");
  const amountCents = Math.round(chargeAmount * 100);

  const descParts = [
    `${characters} character${characters > 1 ? "s" : ""}`,
    format.label,
    background.label,
    expedited ? "24h priority" : `${site.deliveryHours}h delivery`,
  ];
  if (shippingUsd > 0 && payload.shippingMethodName) {
    descParts.push(`Shipping: ${payload.shippingMethodName}`);
  }

  try {
    const db = getDb();
    const [order] = await db
      .insert(orders)
      .values({
        styleSlug: style.slug,
        styleName: style.productName,
        characters,
        background: background.id,
        formatId: format.id,
        notes: (payload.notes ?? "").slice(0, 5000),
        email: payload.email.slice(0, 320),
        photoUrls: payload.photoUrls.slice(0, 10),
        expedited,
        shippingAddress: payload.shippingAddress ?? null,
        shippingMethodUid: payload.shippingMethodUid ?? null,
        shippingMethodName: payload.shippingMethodName ?? null,
        shippingAmount: Math.round(shippingUsd * 100),
        gelatoQuoteId: payload.gelatoQuoteId ?? null,
        amountTotal: amountCents,
        currency: currencyCode,
      })
      .returning({ id: orders.id });

    const url = baseUrl(request);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payload.email,
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
      metadata: { orderId: order.id },
      success_url: `${url}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url}/portraits/${style.slug}`,
    });

    await db
      .update(orders)
      .set({ stripeSessionId: session.id })
      .where(eq(orders.id, order.id));

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please try again shortly." },
      { status: 500 }
    );
  }
}
