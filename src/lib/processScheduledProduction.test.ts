import assert from "node:assert/strict";
import test from "node:test";

import { isEligibleForScheduledProduction } from "./processScheduledProduction";

test("the scheduled production job accepts paid orders only", () => {
  assert.equal(isEligibleForScheduledProduction("paid"), true);

  for (const status of [
    "pending",
    "in_progress",
    "review",
    "digital_file",
    "approved",
    "printing",
    "shipped",
    "delivered",
    "cancelled",
  ]) {
    assert.equal(
      isEligibleForScheduledProduction(status),
      false,
      `${status} orders must not enter scheduled production`
    );
  }
});
