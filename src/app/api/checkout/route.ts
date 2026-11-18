import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isCurrencyCode, type CurrencyCode } from "@/data/currencies";
import {
  MAX_CHARACTERS,
  PRINT_FORMATS,
  orderTotalCents,
  getOrderFormatLabel,
  type PrintQuote,
  type ShippingOption,
  isPrintFormat,
} from "@/data/pricing";
import { isCompleteShippingAddress } from "@/data/shipping";
import { getStyleBySlug } from "@/data/styles";
import { site } from "@/data/site";
import { getDb } from "@/lib/db";
import { getPrintQuote } from "@/lib/gelato-pricing";
import { orders, type ShippingAddress } from "@/lib/schema";
import { getStripe } from "@/lib/stripe";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";

interface CheckoutPayload {
  styleSlug: string;
  characters: number;
  formatId: string;
  notes: string;
  email: string;
  photoUrls: string[];
  expedited?: boolean;
  currency?: CurrencyCode;
  shippingAddress?: ShippingAddress | null;
  shippingMethodUid?: string;
  shippingCents?: number;
  printPriceCents?: number;
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
    !payload.email ||
    !Array.isArray(payload.photoUrls) ||
    payload.photoUrls.length === 0
  ) {
    return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
  }

  let quote: PrintQuote | undefined;
  let shippingMethod: ShippingOption | undefined;
  if (isPrintFormat(format.id)) {
    if (!isCompleteShippingAddress(payload.shippingAddress) || !payload.shippingMethodUid) {
      return NextResponse.json(
        { error: "Shipping address and method required for print orders." },
        { status: 400 }
      );
    }

    try {
      quote = await getPrintQuote(format.id, payload.shippingAddress, currency);
      shippingMethod = quote.methods.find((method) => method.uid === payload.shippingMethodUid);
    } catch (error) {
      console.error("Checkout Gelato quote error:", error);
      return NextResponse.json({ error: "Could not confirm print and shipping prices. Please try again." }, { status: 502 });
    }

    if (!shippingMethod || shippingMethod.priceCents !== payload.shippingCents ||
        quote.printPriceCents !== payload.printPriceCents) {
      return NextResponse.json(
        { error: "Print or shipping prices changed. Review the updated total before checking out." },
        { status: 409 }
      );
    }
  }

  const amountCents = orderTotalCents({
    basePrice: style.priceFrom,
    characters,
    currency,
    expedited,
    printPriceCents: quote?.printPriceCents,
    shippingCents: shippingMethod?.priceCents,
  });
  const currencyCode = currency.toLowerCase();

  const descParts = [
    `${characters} character${characters > 1 ? "s" : ""}`,
    getOrderFormatLabel(format.id, payload.shippingAddress?.country),
    expedited ? "24h priority" : `${site.deliveryHours}h delivery`,
  ];
  if (shippingMethod) {
    descParts.push(`Shipping: ${shippingMethod.name}`);
  }

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
        email: payload.email.slice(0, 320),
        photoUrls: payload.photoUrls.slice(0, 10),
        expedited,
        shippingAddress: shippingMethod ? payload.shippingAddress : null,
        shippingMethodUid: shippingMethod?.uid ?? null,
        shippingMethodName: shippingMethod?.name ?? null,
        shippingAmount: shippingMethod?.priceCents ?? 0,
        gelatoQuoteId: quote?.quoteId ?? null,
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
