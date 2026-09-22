import assert from "node:assert/strict";
import test from "node:test";
import {
  formatLondonNineLabel,
  nextWorkingDayAtNineLondon,
} from "./londonSchedule";

test("schedules the next working day, not the next calendar day, over a weekend", () => {
  const friday = new Date("2026-09-18T16:30:00.000Z");
  assert.equal(nextWorkingDayAtNineLondon(friday).toISOString(), "2026-09-21T08:00:00.000Z");
});

test("uses 09:00 GMT in winter", () => {
  const monday = new Date("2026-01-12T22:00:00.000Z");
  assert.equal(nextWorkingDayAtNineLondon(monday).toISOString(), "2026-01-13T09:00:00.000Z");
});

test("uses 09:00 BST in summer", () => {
  const monday = new Date("2026-07-13T22:00:00.000Z");
  const scheduled = nextWorkingDayAtNineLondon(monday);
  assert.equal(scheduled.toISOString(), "2026-07-14T08:00:00.000Z");
  assert.match(formatLondonNineLabel(scheduled), /09:00/);
});

test("handles the spring DST weekend", () => {
  const friday = new Date("2026-03-27T17:00:00.000Z");
  assert.equal(nextWorkingDayAtNineLondon(friday).toISOString(), "2026-03-30T08:00:00.000Z");
});

test("regression: c7b47b40-4838-44eb-9af7-4a45e9c0f163 starts Monday at 09:00 UK", () => {
  const saturday = new Date("2026-09-19T10:00:00.000Z");
  assert.equal(nextWorkingDayAtNineLondon(saturday).toISOString(), "2026-09-21T08:00:00.000Z");
});
