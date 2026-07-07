import { NextResponse } from "next/server";
import { getSatisfiedBuyersCount } from "@/lib/siteStats";

export const dynamic = "force-dynamic";

export async function GET() {
  const satisfiedBuyers = await getSatisfiedBuyersCount();
  return NextResponse.json({ satisfiedBuyers });
}
