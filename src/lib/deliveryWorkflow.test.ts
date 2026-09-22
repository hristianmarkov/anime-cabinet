import assert from "node:assert/strict";
import test from "node:test";
import type { Order } from "@/lib/schema";
import {
  revisionDeadlineFromSentAt,
  revisionWindowHours,
} from "@/lib/orderDeliveryRules";
import {
  statusAfterArtworkApproval,
  statusAfterRevisionRequest,
  statusAfterReviewWindowLapse,
} from "@/lib/orderWorkflow";
import { pendingDeliveryActions } from "@/lib/processPendingDeliveries";

function order(formatId: string): Order {
  return { formatId } as Order;
}

const sentAt = new Date("2026-09-22T10:15:00.000Z");
const revisionDeadline = revisionDeadlineFromSentAt(sentAt);

test("every preliminary version receives an exact 72-hour review deadline", () => {
  assert.equal(revisionWindowHours(order("digital")), 72);
  assert.equal(revisionWindowHours(order("poster")), 72);
  assert.equal(revisionDeadline.toISOString(), "2026-09-25T10:15:00.000Z");
});

test("approval and revision feedback move orders to their expected statuses", () => {
  assert.equal(statusAfterArtworkApproval(order("digital")), "delivered");
  assert.equal(statusAfterArtworkApproval(order("poster")), "approved");
  assert.equal(statusAfterRevisionRequest(), "in_progress");
});

test("review reminders are due at 24 and 48 hours only once", () => {
  const base = { sentAt, revisionDeadline, reminder24SentAt: null, reminder48SentAt: null };
  assert.deepEqual(pendingDeliveryActions(base, new Date(sentAt.getTime() + 24 * 3_600_000)), {
    expire: false,
    reminder24: true,
    reminder48: false,
  });
  assert.deepEqual(
    pendingDeliveryActions(
      { ...base, reminder24SentAt: new Date(sentAt.getTime() + 24 * 3_600_000) },
      new Date(sentAt.getTime() + 48 * 3_600_000)
    ),
    { expire: false, reminder24: false, reminder48: true }
  );
  assert.deepEqual(pendingDeliveryActions(base, new Date(sentAt.getTime() + 48 * 3_600_000)), {
    expire: false,
    reminder24: false,
    reminder48: true,
  });
});

test("the 72-hour timeout expires without sending stale reminders", () => {
  assert.deepEqual(pendingDeliveryActions(
    { sentAt, revisionDeadline, reminder24SentAt: null, reminder48SentAt: null },
    revisionDeadline
  ), { expire: true, reminder24: false, reminder48: false });
  assert.equal(statusAfterReviewWindowLapse(order("digital")), "delivered");
  assert.equal(statusAfterReviewWindowLapse(order("canvas")), "approved");
});
