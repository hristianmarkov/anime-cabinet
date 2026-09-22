import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDeliveryMessagePrompt,
  type DeliveryMessageOrderContext,
} from "./deliveryMessageOpenAi";

const baseInput: DeliveryMessageOrderContext = {
  customerName: "Mina",
  styleName: "Anime",
  characters: 2,
  formatLabel: "Digital File",
  backgroundLabel: "Detailed",
  customerNotes: "",
  expedited: false,
  isDigital: true,
  deliveryVersion: 1,
};

function assertMandatoryPreviewLanguage(systemPrompt: string) {
  assert.match(systemPrompt, /preliminary preview/i);
  assert.match(systemPrompt, /comments or revision notes within 72 hours/i);
  assert.match(systemPrompt, /automatically advance to the Digital File stage/i);
  assert.match(systemPrompt, /final high-resolution, print-ready file/i);
  assert.match(systemPrompt, /supplied separately afterward/i);
  assert.match(systemPrompt, /NEVER include art-direction briefs/i);
  assert.match(systemPrompt, /internal artist instructions/i);
}

test("first-preview prompt requires all customer-facing preview disclosures", () => {
  const messages = buildDeliveryMessagePrompt(baseInput);

  assertMandatoryPreviewLanguage(messages[0].content);
  assert.match(messages[0].content, /This is the first preview/i);
  assert.match(messages[0].content, /not as the final artwork or final file/i);
  assert.equal(JSON.parse(messages[1].content).order.deliveryVersion, 1);
});

test("revised-preview prompt retains every mandatory disclosure", () => {
  const messages = buildDeliveryMessagePrompt({
    ...baseInput,
    deliveryVersion: 2,
    adminNotes: "The requested eye-color adjustment is included.",
  });

  assertMandatoryPreviewLanguage(messages[0].content);
  assert.match(messages[0].content, /revised preview following the customer's feedback/i);
  assert.match(messages[0].content, /still clearly describing/i);
  assert.equal(JSON.parse(messages[1].content).order.deliveryVersion, 2);
});


test("delivery notes retain every separate customer-relevant fact", () => {
  const adminNotes = [
    "We created the requested romantic pose in a Dragon Ball-inspired style.",
    "We preserved the male character's necklace and earrings from his individual reference photo.",
    "The female character's earrings came from the joint photo.",
    "We deliberately omitted the female character's necklaces because they would have cluttered the neckline of her outfit.",
    "We had to use some imagination to interpret the male character's hairstyle because he wore a hat in both photos.",
  ].join(" ");
  const messages = buildDeliveryMessagePrompt({ ...baseInput, adminNotes });
  const suppliedNotes = JSON.parse(messages[1].content).adminNotes as string;
  for (const fact of [
    "requested romantic pose",
    "male character's necklace",
    "female character's earrings came from the joint photo",
    "deliberately omitted the female character's necklaces",
    "use some imagination to interpret the male character's hairstyle",
  ]) {
    assert.ok(suppliedNotes.includes(fact), `prompt should retain: ${fact}`);
  }
  assert.match(messages[0].content, /source material to rewrite/i);
  assert.match(messages[0].content, /preserve every customer-relevant factual point/i);
  assert.match(messages[0].content, /do not omit or combine details/i);
  assert.match(messages[0].content, /Do not strengthen uncertain language/i);
  assert.match(messages[0].content, /short, customer-friendly paragraphs/i);
});
