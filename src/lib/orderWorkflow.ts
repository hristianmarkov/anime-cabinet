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

export function getActiveDelivery(deliveries: OrderDelivery[]): OrderDelivery | null {
  return deliveries.find((d) => d.sentAt && !d.autoCompletedAt) ?? null;
}

export function msUntilDeadline(deadline: Date | string | null): number | null {
  if (!deadline) return null;
  return new Date(deadline).getTime() - Date.now();
}

export function buildOrderPipeline(order: Order): PipelineStep[] {
  const digital = isDigitalOrder(order);
  const s = order.status;

  const defs: { id: PipelineStepId; label: string }[] = digital
    ? [
        { id: "started", label: "Created" },
        { id: "production", label: "In production" },
        { id: "customer_review", label: "Customer review" },
        { id: "digital_file", label: "Digital File" },
        { id: "completed", label: "Completed" },
      ]
    : [
        { id: "started", label: "Created" },
        { id: "production", label: "In production" },
        { id: "customer_review", label: "Customer review" },
        { id: "digital_file", label: "Digital File" },
        { id: "approved", label: "Artwork approved" },
        { id: "printing", label: "Print production" },
        { id: "dispatched", label: "Dispatched" },
        { id: "completed", label: "Delivered" },
      ];

  const currentStepId = (): PipelineStepId => {
    switch (s) {
      case "pending":
        return "started";
      case "paid":
        return "started";
      case "in_progress":
        return "production";
      case "review":
        return "customer_review";
      case "digital_file":
        return "digital_file";
      case "approved":
        return digital ? "completed" : "approved";
      case "printing":
        return "printing";
      case "shipped":
        return "dispatched";
      case "delivered":
        return "completed";
      case "cancelled":
        return "started";
      default:
        return "production";
    }
  };

  const current = currentStepId();
  const currentIndex = defs.findIndex((d) => d.id === current);

  if (s === "delivered") {
    return defs.map((d) => ({ ...d, state: "done" as const }));
  }
  if (s === "cancelled") {
    return defs.map((d, i) => ({
      ...d,
      state: i === 0 ? ("done" as const) : ("upcoming" as const),
    }));
  }

  return defs.map((d, i) => ({
    ...d,
    state:
      i < currentIndex ? ("done" as const) : i === currentIndex ? ("current" as const) : ("upcoming" as const),
  }));
}

export function statusAfterArtworkApproval(order: Order): OrderStatus {
  return "digital_file";
}

export function statusAfterReviewWindowLapse(order: Order): OrderStatus {
  return "digital_file";
}
