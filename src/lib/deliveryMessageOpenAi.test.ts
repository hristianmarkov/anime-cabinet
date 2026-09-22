import assert from "node:assert/strict";
import test from "node:test";

import { buildDeliveryMessagePrompt } from "./deliveryMessageOpenAi";

test("Dragon Ball delivery notes retain every separate customer-relevant fact", () => {
  const adminNotes = [
    "We created the requested romantic pose in a Dragon Ball-inspired style.",
    "We preserved the male character's necklace and earrings from his individual reference photo.",
    "The female character's earrings came from the joint photo.",
    "We deliberately omitted the female character's necklaces because they would have cluttered the neckline of her outfit.",
    "We had to use some imagination to interpret the male character's hairstyle because he wore a hat in both photos.",
  ].join(" ");

  const result = buildDeliveryMessagePrompt({
    customerName: "Bulma",
    styleName: "Dragon Ball Z",
    characters: 2,
    formatLabel: "Digital",
    backgroundLabel: "Custom",
    customerNotes: "Please make the pose romantic.",
    expedited: false,
    isDigital: true,
    revisionHours: 72,
    deliveryVersion: 1,
    adminNotes,
  });

  const suppliedNotes = JSON.parse(result.user).adminNotes as string;
  const separateFacts = [
    "requested romantic pose",
    "Dragon Ball-inspired style",
    "male character's necklace",
    "male character's earrings",
    "female character's earrings came from the joint photo",
    "deliberately omitted the female character's necklaces",
    "because they would have cluttered the neckline of her outfit",
    "use some imagination to interpret the male character's hairstyle because he wore a hat in both photos",
  ];

  for (const fact of separateFacts) {
    assert.ok(suppliedNotes.includes(fact), `prompt should retain: ${fact}`);
  }
  assert.match(result.system, /source material to rewrite/i);
  assert.match(result.system, /preserve every customer-relevant factual point/i);
  assert.match(result.system, /do not omit or combine details/i);
  assert.doesNotMatch(result.system, /2–5 sentences/);
  assert.match(result.system, /Do not strengthen uncertain language/i);
  assert.match(result.system, /short, customer-friendly paragraphs/i);
});
