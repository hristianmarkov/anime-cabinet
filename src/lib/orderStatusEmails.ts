import type { Order, OrderDelivery, OrderStatus } from "@/lib/schema";
import { isDigitalOrder } from "@/lib/orderDeliveryRules";
import {
  sendOrderCancelledEmail,
  sendOrderDeliveredEmail,
  sendPrintArtworkApprovedEmail,
  sendPrintProductionEmail,
  sendProductionStartedEmail,
  sendRevisionWorkStartedEmail,
  sendShippedEmail,
} from "@/lib/emails";

export interface StatusEmailOptions {
  /** Set when moving to `review` via artwork upload — customer already got preview email. */
  skipReviewEmail?: boolean;
  sendCancelEmail?: boolean;
  cancelNote?: string;
  /** Latest sent delivery — used for download links on completion emails. */
  latestDelivery?: OrderDelivery | null;
}

/**
 * Sends customer-facing email for meaningful status transitions.
 * Payment confirmation is handled by the Stripe webhook (paid), not here.
 */
export async function notifyCustomerOfStatusChange(
  order: Order,
  from: OrderStatus,
  to: OrderStatus,
  options: StatusEmailOptions = {}
): Promise<void> {
  if (from === to) return;

  if (to === "pending" || to === "paid") return;

  if (to === "review") {
    if (options.skipReviewEmail) return;
    return;
  }

  // Entering this state is an internal hand-off: the dedicated final-file
  // action sends the customer email only after the asset is safely stored.
  if (to === "digital_file") return;

  if (to === "cancelled") {
    if (options.sendCancelEmail) {
      await sendOrderCancelledEmail(order, options.cancelNote);
    }
    return;
  }

  const digital = isDigitalOrder(order);

  if (to === "in_progress") {
    if (from === "review") {
      await sendRevisionWorkStartedEmail(order);
    } else if (from === "paid") {
      await sendProductionStartedEmail(order);
    }
    return;
  }

  if (to === "approved" && !digital) {
    await sendPrintArtworkApprovedEmail(order, options.latestDelivery ?? null);
    return;
  }

  if (to === "printing") {
    await sendPrintProductionEmail(order);
    return;
  }

  if (to === "shipped") {
    await sendShippedEmail(order);
    return;
  }

  if (to === "delivered") {
    if (from === "review" && digital) {
      await sendOrderDeliveredEmail(order, options.latestDelivery ?? null, "approved");
      return;
    }
    if (digital) {
      await sendOrderDeliveredEmail(order, options.latestDelivery ?? null, "complete");
      return;
    }
    await sendOrderDeliveredEmail(order, options.latestDelivery ?? null, "delivered");
  }
}
