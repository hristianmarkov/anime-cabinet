import type { Order, OrderDelivery, OrderFinalFile, OrderReviewMessage, OrderTimelineEvent } from "@/lib/schema";
import { isDigitalOrder } from "@/lib/orderDeliveryRules";
import { buildOrderPipeline, getActiveDelivery, type OrderPipeline } from "@/lib/orderWorkflow";
import { statusLabels } from "@/app/admin/order-ui";
import { PRINT_FORMATS, formatUsd } from "@/data/pricing";
import { formatLondonNineLabel } from "@/lib/londonSchedule";

export interface PublicOrderTracking {
  styleName: string;
  status: Order["status"];
  statusLabel: string;
  formatLabel: string;
  placedAt: string;
  expedited: boolean;
  digital: boolean;
  pipeline: OrderPipeline;
  revisionDeadline: string | null;
  revisionHours: number | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippingMethodName: string | null;
  maskedRecipient: string | null;
  maskedDestination: string | null;
  amountDisplay: string;
  milestones: { label: string; at: string }[];
  productionStartsAt: string | null;

  previewDelivery: {
    id: string;
    versionNumber: number;
    imageUrls: string[];
    adminMessage: string;
    revisionDeadline: string | null;
  } | null;
  reviewMessages: {
    id: string;
    direction: "customer" | "admin";
    author: string;
    body: string;
    deliveryVersion: number | null;
    createdAt: string;
  }[];
  firstPreviewDeadline: string | null;
  customerCopy: string | null;
  finalFile: { previewUrl: string; downloadUrl: string } | null;
}

function getFirstPreviewCopy(status: Order["status"]): string | null {
  if (status === "paid") {
    return "We’ve received your order and are allocating it to an artist.";
  }
  if (status === "in_progress") {
    return "Your artist is working on the first draft and will provide it within the time shown.";
  }
  return null;
}

function maskName(first: string, last: string): string {
  const f = first.trim();
  const l = last.trim();
  if (!f && !l) return "Customer";
  const lastMask = l.length > 1 ? `${l.charAt(0)}${"•".repeat(Math.min(l.length - 1, 4))}` : l || "";
  return `${f.charAt(0).toUpperCase()}${f.length > 1 ? "." : ""} ${lastMask}`.trim();
}

function maskDestination(addr: NonNullable<Order["shippingAddress"]>): string {
  const post = addr.postCode.trim();
  const postMask = post.length > 2 ? `${post.slice(0, 2)}•••` : post;
  return `${addr.city}, ${addr.country} · ${postMask}`;
}

const PUBLIC_MILESTONE_KINDS = new Set([
  "payment_received",
  "delivery_sent",
  "artwork_approved",
  "auto_completed",
  "final_file_sent",
  "status_updated",
]);

export function buildPublicOrderTracking(
  order: Order,
  deliveries: OrderDelivery[],
  timeline: OrderTimelineEvent[],
  reviewMessages: OrderReviewMessage[] = [],
  finalFile: OrderFinalFile | null = null
): PublicOrderTracking {
  const format = PRINT_FORMATS.find((f) => f.id === order.formatId);
  const digital = isDigitalOrder(order);
  const active = getActiveDelivery(deliveries);
  const shipping = order.shippingAddress;

  const milestones = timeline
    .filter((e) => PUBLIC_MILESTONE_KINDS.has(e.kind))
    .slice(0, 8)
    .reverse()
    .map((e) => ({
      label: e.summary,
      at: new Date(e.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    }));

  return {
    styleName: order.styleName,
    status: order.status,
    statusLabel: statusLabels[order.status],
    formatLabel: format?.label ?? order.formatId,
    placedAt: new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    expedited: order.expedited,
    digital,
    pipeline: buildOrderPipeline(order),
    revisionDeadline:
      order.status === "review" && active?.revisionDeadline
        ? new Date(active.revisionDeadline).toISOString()
        : null,
    revisionHours: active?.revisionHours ?? null,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    shippingMethodName: order.shippingMethodName,
    maskedRecipient:
      !digital && shipping ? maskName(shipping.firstName, shipping.lastName) : null,
    maskedDestination: !digital && shipping ? maskDestination(shipping) : null,
    amountDisplay: `${formatUsd(order.amountTotal / 100)} ${order.currency.toUpperCase()}`,
    milestones,
    productionStartsAt:
      order.status === "paid" && order.productionScheduledAt
        ? formatLondonNineLabel(new Date(order.productionScheduledAt))
        : null,

    previewDelivery: active
      ? {
          id: active.id,
          versionNumber: active.versionNumber,
          imageUrls: active.imageUrls.filter((url) => /^https:\/\//i.test(url)),
          adminMessage: active.comment,
          revisionDeadline: active.revisionDeadline
            ? new Date(active.revisionDeadline).toISOString()
            : null,
        }
      : null,
    reviewMessages: reviewMessages.map((message) => ({
      id: message.id,
      direction: message.direction,
      author: message.author,
      body: message.body,
      deliveryVersion:
        deliveries.find((delivery) => delivery.id === message.deliveryId)?.versionNumber ?? null,
      createdAt: new Date(message.createdAt).toISOString(),
    })),
    firstPreviewDeadline:
      (order.status === "paid" || order.status === "in_progress") && order.firstPreviewDeadline
        ? new Date(order.firstPreviewDeadline).toISOString()
        : null,
    customerCopy: getFirstPreviewCopy(order.status),
    finalFile:
      order.status === "delivered" && finalFile
        ? { previewUrl: finalFile.previewUrl, downloadUrl: finalFile.fileUrl }
        : null,

  };
}
