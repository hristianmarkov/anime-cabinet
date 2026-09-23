import assert from "node:assert/strict";
import test from "node:test";
import { deliveryPreviewEmailCopy } from "./deliveryPreviewEmailCopy";

test("first artwork delivery is described as the initial preview", () => {
  const copy = deliveryPreviewEmailCopy("Custom Portrait", 1);
  assert.equal(copy.subject, "Your Custom Portrait artwork is ready to review");
  assert.match(copy.introduction, /preliminary version/i);
});

test("later artwork deliveries announce the new version and comparison page", () => {
  const copy = deliveryPreviewEmailCopy("Custom Portrait", 2);
  assert.equal(copy.subject, "A new version of your Custom Portrait artwork is ready");
  assert.equal(copy.heading, "A new artwork version is ready");
  assert.match(copy.introduction, /version 2/i);
  assert.match(copy.introduction, /compare it with earlier versions/i);
});
