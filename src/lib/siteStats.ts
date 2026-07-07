import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteCounters } from "@/lib/schema";
import { site } from "@/data/site";

const SATISFIED_BUYERS_KEY = "satisfied_buyers";

export async function getSatisfiedBuyersCount(): Promise<number> {
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(siteCounters)
      .where(eq(siteCounters.key, SATISFIED_BUYERS_KEY))
      .limit(1);

    if (row) return row.value;

    await db
      .insert(siteCounters)
      .values({ key: SATISFIED_BUYERS_KEY, value: site.satisfiedBuyersBase })
      .onConflictDoNothing();

    return site.satisfiedBuyersBase;
  } catch {
    return site.satisfiedBuyersBase;
  }
}

export async function incrementSatisfiedBuyers(): Promise<void> {
  try {
    const db = getDb();
    await db
      .insert(siteCounters)
      .values({ key: SATISFIED_BUYERS_KEY, value: site.satisfiedBuyersBase })
      .onConflictDoNothing();

    await db
      .update(siteCounters)
      .set({ value: sql`${siteCounters.value} + 1` })
      .where(eq(siteCounters.key, SATISFIED_BUYERS_KEY));
  } catch (err) {
    console.error("Failed to increment satisfied buyers:", err);
  }
}
