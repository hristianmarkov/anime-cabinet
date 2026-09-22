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
