import assert from "node:assert/strict";
import test from "node:test";
import { stripQuotedReply } from "./inboundEmail";

test("removes common legal signature blocks from inbound order replies", () => {
  const message = `I can send more photos. Please let the artist know.\n\nInformation About Brokerage Services\nhttps://example.com/legal\nTexas Real Estate Commission Consumer Protection Notice`;
  assert.equal(stripQuotedReply(message), "I can send more photos. Please let the artist know.");
});

test("removes quoted reply history", () => {
  assert.equal(stripQuotedReply("My answer\n\nOn Monday, Anime Cabinet wrote:\n> old copy"), "My answer");
});
