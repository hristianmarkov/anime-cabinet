import { getDb } from "@/lib/db";
import {
  orderTimelineEvents,
  type TimelineEventKind,
} from "@/lib/schema";

export async function addOrderTimelineEvent(input: {
  orderId: string;
  kind: TimelineEventKind;
  summary: string;
  detail?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = getDb();
  await db.insert(orderTimelineEvents).values({
    orderId: input.orderId,
    kind: input.kind,
    summary: input.summary,
    detail: input.detail ?? "",
    metadata: input.metadata ?? {},
  });
}
