import { NextResponse } from "next/server";
import { processPendingDeliveries } from "@/lib/processPendingDeliveries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processPendingDeliveries();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Cron order-deliveries failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
