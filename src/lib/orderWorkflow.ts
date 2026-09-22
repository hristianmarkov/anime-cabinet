import type { Order, OrderDelivery, OrderStatus } from "@/lib/schema";
import { isDigitalOrder } from "@/lib/orderDeliveryRules";

export type PipelineStepId =
  | "started"
  | "production"
  | "customer_review"
  | "digital_file"
  | "approved"
  | "printing"
  | "dispatched"
  | "completed";

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  state: "upcoming" | "current" | "done";
}

export interface OrderPipeline {
  shared: PipelineStep[];
  branches: {
    digital: PipelineStep[];
    shipping: PipelineStep[] | null;
  };
}

export function getActiveDelivery(deliveries: OrderDelivery[]): OrderDelivery | null {
  return deliveries.find((d) => d.sentAt && !d.autoCompletedAt) ?? null;
}

export function msUntilDeadline(deadline: Date | string | null): number | null {
  if (!deadline) return null;
  return new Date(deadline).getTime() - Date.now();
}

export function buildOrderPipeline(order: Order): OrderPipeline {
  const digital = isDigitalOrder(order);
  const s = order.status;

  const preReviewRank: Record<OrderStatus, number> = {
    pending: 0, paid: 0, in_progress: 1, review: 2, approved: 3,
    digital_file: 3, printing: 3, shipped: 3, delivered: 3, cancelled: 0,
  };
  const sharedDefs = [
    { id: "started" as const, label: "Created" },
    { id: "production" as const, label: "In production" },
    { id: "customer_review" as const, label: "Customer review" },
  ];
  const rank = preReviewRank[s];
  const shared = sharedDefs.map((step, index) => ({
    ...step,
    state: (index < rank ? "done" : index === rank ? "current" : "upcoming") as PipelineStep["state"],
  }));

  const reviewComplete = rank >= 3;
  const digitalComplete = order.digitalFulfillmentStatus === "completed" || (digital && s === "delivered");
  const digitalSteps: PipelineStep[] = [
    { id: "digital_file", label: "Digital File", state: digitalComplete ? "done" : reviewComplete ? "current" : "upcoming" },
    { id: "completed", label: "Completed", state: digitalComplete ? "done" : "upcoming" },
  ];

  const legacyShipping = (["approved", "printing", "shipped", "delivered"] as OrderStatus[]).includes(s)
    ? s as "approved" | "printing" | "shipped" | "delivered"
    : "pending";
  const shippingStatus = order.shippingFulfillmentStatus ?? legacyShipping;
  const shippingRank = { pending: -1, approved: -1, printing: 0, shipped: 1, delivered: 2 }[shippingStatus];
  const shippingDefs = [
    { id: "printing" as const, label: "Print production" },
    { id: "dispatched" as const, label: "Dispatch" },
    { id: "completed" as const, label: "Delivery" },
  ];
  const shippingStarted = s !== "digital_file" && reviewComplete;
  const shipping = digital ? null : shippingDefs.map((step, index) => ({
    ...step,
    state: (index <= shippingRank ? "done" : index === shippingRank + 1 && shippingStarted ? "current" : "upcoming") as PipelineStep["state"],
  }));

  return { shared, branches: { digital: digitalSteps, shipping } };
}

export function statusAfterArtworkApproval(order: Order): OrderStatus {
  return "digital_file";
}

export function statusAfterReviewWindowLapse(order: Order): OrderStatus {
  return "digital_file";
}

export function statusAfterRevisionRequest(): OrderStatus {
  return "review";
}
