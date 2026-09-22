import type { TimelineEventKind } from "@/lib/schema";

const MESSAGE_BODY_EVENT_KINDS = new Set<TimelineEventKind>([
  "customer_feedback",
  "delivery_sent",
  "revision_requested",
]);

/** Message content belongs in the review conversation, not the concise event log. */
export function shouldShowTimelineDetail(kind: TimelineEventKind): boolean {
  return !MESSAGE_BODY_EVENT_KINDS.has(kind);
}
