import assert from "node:assert/strict";
import test from "node:test";
import { orderNotice, unansweredCount } from "./adminNotices";

const at = (minute: number) => new Date(`2026-09-22T10:${String(minute).padStart(2, "0")}:00Z`);

test("counts consecutive customer messages until the latest admin response", () => {
  assert.equal(unansweredCount([
    { direction: "admin", createdAt: at(1) },
    { direction: "customer", createdAt: at(2) },
    { direction: "customer", createdAt: at(3) },
  ]), 2);
  assert.equal(unansweredCount([
    { direction: "customer", createdAt: at(1) },
    { direction: "admin", createdAt: at(2) },
  ]), 0);
});

test("shows the latest artwork decision", () => {
  assert.equal(orderNotice({ messages: [], latestDecision: { kind: "artwork_approved", createdAt: at(2) } }), "Approved");
  assert.equal(orderNotice({ messages: [], latestDecision: { kind: "revision_requested", createdAt: at(2) } }), "Rejected");
});
