import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowTimelineDetail } from "./timelinePresentation";

test("hides customer and artist message bodies from the event log", () => {
  assert.equal(shouldShowTimelineDetail("customer_feedback"), false);
  assert.equal(shouldShowTimelineDetail("delivery_sent"), false);
  assert.equal(shouldShowTimelineDetail("revision_requested"), false);
});

test("keeps operational event details visible", () => {
  assert.equal(shouldShowTimelineDetail("auto_completed"), true);
  assert.equal(shouldShowTimelineDetail("gelato_status_sync"), true);
});
