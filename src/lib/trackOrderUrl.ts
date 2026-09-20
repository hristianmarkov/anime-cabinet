import { site } from "@/data/site";
import type { Order } from "@/lib/schema";

export function trackOrderUrl(order: Pick<Order, "trackToken">): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  return `${base.replace(/\/$/, "")}/track/${order.trackToken}`;
}
