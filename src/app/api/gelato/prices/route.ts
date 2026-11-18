import { NextResponse } from "next/server";
import { isCurrencyCode } from "@/data/currencies";
import { getAllPrintPrices } from "@/lib/gelato-pricing";
import { isGelatoConfigured } from "@/lib/gelato";

export async function GET(request: Request) {
  if (!isGelatoConfigured()) {
    return NextResponse.json(
      { error: "Print pricing is not configured yet." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const country = (searchParams.get("country") ?? "US").toUpperCase();
  const currency = (searchParams.get("currency") ?? "USD").toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
  }

  if (!isCurrencyCode(currency)) {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  }

  try {
    const prices = await getAllPrintPrices(country, currency);
    return NextResponse.json({ country, currency, prices });
  } catch (err) {
    console.error("Gelato prices error:", err);
    return NextResponse.json(
      { error: "Could not load print prices. Please try again." },
      { status: 502 }
    );
  }
}
