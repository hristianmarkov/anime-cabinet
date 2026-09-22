import assert from "node:assert/strict";
import test from "node:test";

import { calculateFirstPreviewDeadline, resolveFirstPreviewDeadline } from "./firstPreviewDeadline";

const createdAt = new Date("2026-09-20T17:38:00.000Z");

test("standard first-preview countdown starts at order creation and lasts 72 hours", () => {
  assert.equal(
    calculateFirstPreviewDeadline(createdAt, false).toISOString(),
    "2026-09-23T17:38:00.000Z"
  );
});

test("expedited first-preview countdown starts at order creation and lasts 24 hours", () => {
  assert.equal(
    calculateFirstPreviewDeadline(createdAt, true).toISOString(),
    "2026-09-21T17:38:00.000Z"
  );
});

test("legacy orders without a stored deadline receive a countdown fallback", () => {
  assert.equal(
    resolveFirstPreviewDeadline({ createdAt, expedited: false, firstPreviewDeadline: null }).toISOString(),
    "2026-09-23T17:38:00.000Z"
  );
});

test("stored deadlines remain stable", () => {
  const stored = new Date("2026-09-25T09:00:00.000Z");
  assert.equal(
    resolveFirstPreviewDeadline({ createdAt, expedited: false, firstPreviewDeadline: stored }).toISOString(),
    stored.toISOString()
  );
});
