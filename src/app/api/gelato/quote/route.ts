import { NextResponse } from "next/server";
import { isCurrencyCode } from "@/data/currencies";
import { isPrintFormat, PRINT_FORMATS } from "@/data/pricing";
import { isCompleteShippingAddress } from "@/data/shipping";
import { isGelatoConfigured } from "@/lib/gelato";
import { getPrintQuote } from "@/lib/gelato-pricing";
import type { ShippingAddress } from "@/lib/schema";

export async function POST(request: Request) {
  if (!isGelatoConfigured()) {
    return NextResponse.json(
      { error: "Print shipping is temporarily unavailable." },
      { status: 503 }
    );
  }

  let body: { formatId?: string; currency?: string; recipient?: ShippingAddress } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { formatId, currency = "USD", recipient } = body ?? {};
  if (!formatId || !isPrintFormat(formatId) ||
      !PRINT_FORMATS.some((format) => format.id === formatId) || !isCurrencyCode(currency)) {
    return NextResponse.json({ error: "Invalid print format or currency" }, { status: 400 });
  }
  if (!isCompleteShippingAddress(recipient)) {
    return NextResponse.json({ error: "Complete shipping address required" }, { status: 400 });
  }

  try {
    const quote = await getPrintQuote(formatId, recipient, currency);
    return NextResponse.json(quote);
  } catch (error) {
    console.error("Gelato quote error:", error);
    return NextResponse.json(
      { error: "Could not get print and shipping prices. Check your address and try again." },
      { status: 502 }
    );
  }
}
