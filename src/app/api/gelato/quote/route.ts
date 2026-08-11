import { NextResponse } from "next/server";
import { getGelatoProductUid } from "@/data/gelato-products";
import { isGelatoConfigured, quoteGelatoOrder } from "@/lib/gelato";
import { gelatoCostToPrintAddOn } from "@/lib/gelato-pricing";
import type { ShippingAddress } from "@/lib/schema";

export async function POST(request: Request) {
  if (!isGelatoConfigured()) {
    return NextResponse.json(
      { error: "Print shipping is not configured yet. Please contact us." },
      { status: 503 }
    );
  }

  let body: {
    formatId: string;
    currency?: string;
    recipient: ShippingAddress;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const productUid = getGelatoProductUid(body.formatId);
  if (!productUid) {
    return NextResponse.json(
      { error: "This print format is not available for shipping quotes yet." },
      { status: 400 }
    );
  }

  const { recipient } = body;
  if (
    !recipient?.firstName ||
    !recipient?.lastName ||
    !recipient?.addressLine1 ||
    !recipient?.city ||
    !recipient?.postCode ||
    !recipient?.country
  ) {
    return NextResponse.json({ error: "Complete shipping address required" }, { status: 400 });
  }

  try {
    const quote = await quoteGelatoOrder({
      productUid,
      currency: body.currency ?? "USD",
      recipient,
    });

    const gelatoProduct = quote.products?.[0];
    const printAddOnUsd = gelatoProduct?.price
      ? gelatoCostToPrintAddOn(gelatoProduct.price)
      : undefined;

    return NextResponse.json({
      quoteId: quote.quoteId,
      printAddOnUsd,
      methods: quote.methods.map((m) => ({
        uid: m.shipmentMethodUid,
        name: m.name,
        priceUsd: m.price,
        currency: m.currency,
        minDays: m.minDeliveryDays,
        maxDays: m.maxDeliveryDays,
      })),
    });
  } catch (err) {
    console.error("Gelato quote error:", err);
    return NextResponse.json(
      { error: "Could not get shipping rates for this address. Check your details and try again." },
      { status: 502 }
    );
  }
}
