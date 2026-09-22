import { NextResponse } from "next/server";
import { processPendingDeliveries } from "@/lib/processPendingDeliveries";
import { processScheduledProduction } from "@/lib/processScheduledProduction";
import { PRODUCTION_SCHEDULE_LABEL } from "@/lib/londonSchedule";

export const dynamic = "force-dynamic";

let consecutiveFailures = 0;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("Cron order-deliveries is unconfigured", { alert: true, reason: "missing_cron_secret" });
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    console.warn("Cron order-deliveries authorization rejected", { alert: true });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [deliveries, productionStarted] = await Promise.all([
      processPendingDeliveries(),
      processScheduledProduction(),
    ]);
    consecutiveFailures = 0;
    return NextResponse.json({
      ok: true,
      ...deliveries,
      productionStarted,
      productionSchedule: PRODUCTION_SCHEDULE_LABEL,
    });
  } catch (error) {
    consecutiveFailures++;
    console.error("Cron order-deliveries failed", {
      alert: consecutiveFailures >= 3,
      consecutiveFailures,
      error,
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
