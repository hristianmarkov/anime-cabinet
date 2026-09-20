"use client";

import { useState } from "react";
import type { OrderStatus } from "@/lib/schema";
import { updateOrderStatus } from "../../actions";
import { statusLabels } from "../../order-ui";

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "in_progress",
  "review",
  "approved",
  "printing",
  "shipped",
  "delivered",
  "cancelled",
];

export function StatusUpdateForm({
  orderId,
  currentStatus,
  returnTo,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  returnTo: string;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  return (
    <form action={updateOrderStatus} className="mt-6 flex flex-col gap-3 border-t border-line pt-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="order-status" className="text-xs text-faint">
          Override status
        </label>
        <select
          id="order-status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream focus:border-accent focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-surface-raised px-4 py-2 text-xs font-semibold text-cream hover:bg-line"
        >
          Update status
        </button>
      </div>

      {status === "cancelled" && (
        <div className="rounded-xl border border-flame/30 bg-flame/5 p-4">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-cream">
            <input
              type="checkbox"
              name="sendCancelEmail"
              value="1"
              defaultChecked
              className="mt-1"
            />
            <span>
              Email the customer that this order was cancelled
              <span className="mt-1 block text-xs font-normal text-muted">
                Uncheck for internal-only cancellations (e.g. duplicate test order).
              </span>
            </span>
          </label>
          <label className="mt-3 block text-xs text-faint">Optional note in the email</label>
          <textarea
            name="cancelNote"
            rows={2}
            placeholder="Reason or next steps (refund timeline, etc.)"
            className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-cream"
          />
        </div>
      )}
    </form>
  );
}
