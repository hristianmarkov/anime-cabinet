import assert from "node:assert/strict";
import test from "node:test";
import type { Order } from "@/lib/schema";
import { buildOrderPipeline } from "@/lib/orderWorkflow";

function order(overrides: Partial<Order>): Order {
  return {
    status: "review",
    formatId: "digital",
    shippingAddress: null,
    digitalFulfillmentStatus: "pending",
    shippingFulfillmentStatus: "pending",
    ...overrides,
  } as Order;
}

test("digital-only orders expose only the digital post-review branch", () => {
  const pipeline = buildOrderPipeline(order({ status: "delivered", digitalFulfillmentStatus: "completed" }));
  assert.equal(pipeline.branches.shipping, null);
  assert.deepEqual(pipeline.branches.digital.map((step) => step.state), ["done", "done"]);
});

test("physical orders before review keep both branches upcoming", () => {
  const pipeline = buildOrderPipeline(order({ status: "in_progress", formatId: "a3", shippingAddress: {} as Order["shippingAddress"] }));
  assert.equal(pipeline.shared[1].state, "current");
  assert.deepEqual(pipeline.branches.digital.map((step) => step.state), ["upcoming", "upcoming"]);
  assert.deepEqual(pipeline.branches.shipping?.map((step) => step.state), ["upcoming", "upcoming", "upcoming"]);
});

test("a physical order can complete its digital branch independently", () => {
  const pipeline = buildOrderPipeline(order({ status: "approved", formatId: "a3", shippingAddress: {} as Order["shippingAddress"], digitalFulfillmentStatus: "completed" }));
  assert.deepEqual(pipeline.branches.digital.map((step) => step.state), ["done", "done"]);
  assert.deepEqual(pipeline.branches.shipping?.map((step) => step.state), ["current", "upcoming", "upcoming"]);
});

test("a physical order can complete both fulfillment branches", () => {
  const pipeline = buildOrderPipeline(order({ status: "approved", formatId: "a3", shippingAddress: {} as Order["shippingAddress"], digitalFulfillmentStatus: "completed", shippingFulfillmentStatus: "delivered" }));
  assert.deepEqual(pipeline.branches.digital.map((step) => step.state), ["done", "done"]);
  assert.deepEqual(pipeline.branches.shipping?.map((step) => step.state), ["done", "done", "done"]);
});

test("a physical order waiting for its final file keeps print production upcoming", () => {
  const pipeline = buildOrderPipeline(order({ status: "digital_file", formatId: "a3", shippingAddress: {} as Order["shippingAddress"] }));
  assert.deepEqual(pipeline.branches.shipping?.map((step) => step.state), ["upcoming", "upcoming", "upcoming"]);
});
