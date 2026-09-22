import type { Order } from "@/lib/schema";

export function isDigitalOrder(order: Order): boolean {
  return order.formatId === "digital";
}

/** Hours the customer has to request revisions after a delivery email. */
export function revisionWindowHours(order: Order): number {
  void order;
  return 72;
}

export function revisionWindowLabel(order: Order): string {
  const h = revisionWindowHours(order);
  return `${h} hours`;
}
