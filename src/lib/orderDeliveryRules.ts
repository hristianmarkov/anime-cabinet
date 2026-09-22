import type { Order } from "@/lib/schema";

export const REVISION_WINDOW_HOURS = 72;

export function isDigitalOrder(order: Order): boolean {
  return order.formatId === "digital";
}

/** Hours the customer has to request revisions after a delivery email. */
export function revisionWindowHours(order: Order): number {
  return REVISION_WINDOW_HOURS;
}

export const REVISION_REMINDER_HOURS = [24, 48] as const;

export function revisionDeadlineFromSentAt(sentAt: Date): Date {
  return new Date(sentAt.getTime() + REVISION_WINDOW_HOURS * 60 * 60 * 1000);
}

export function revisionWindowLabel(order: Order): string {
  const h = revisionWindowHours(order);
  return `${h} hours`;
}
