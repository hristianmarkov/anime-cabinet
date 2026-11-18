import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDeliveryEstimate, formatPrintSize, getOrderFormatLabel, orderTotalCents } from "@/data/pricing";
import type { ShippingAddress } from "@/lib/schema";

test("format dimensions by destination and retain the dimensions of existing orders", () => {
  assert.equal(formatPrintSize("12x16", "US", "en-US"), "12 × 16 in");
  assert.equal(formatPrintSize("12x16", "DE", "de-DE"), "30,5 × 40,6 cm");
  assert.equal(formatPrintSize("18x24", "GB", "en-GB"), "45.7 × 61 cm");
  assert.match(getOrderFormatLabel("framed-12x18"), /12x18/);
});

test("Gelato quotes keep their currency and use the correct product UID for each size", async (t) => {
  process.env.GELATO_API_KEY = "test-key";
  process.env.GELATO_UID_FRAMED_12X16 = "small-frame";
  process.env.GELATO_UID_FRAMED_18X24 = "large-frame";
  process.env.GELATO_UID_FRAMED_12X18 = "legacy-frame";
  process.env.GELATO_PRINT_SURCHARGE = "2.50";
  const { getPrintQuote } = await import("./gelato-pricing");
  const { POST: quoteRoute } = await import("@/app/api/gelato/quote/route");
  const { POST: checkoutRoute } = await import("@/app/api/checkout/route");
  const { allStyles } = await import("@/data/styles");
  const { getGelatoProductUid } = await import("@/data/gelato-products");
  const address: ShippingAddress = {
    firstName: "Test",
    lastName: "Customer",
    addressLine1: "1 Main St",
    city: "Los Angeles",
    state: "CA",
    postCode: "90012",
    country: "US",
  };

  t.mock.method(globalThis, "fetch", async (input: string, init: RequestInit) => {
    const url = new URL(input);
    if (url.hostname === "product.gelatoapis.com") {
      assert.equal(url.searchParams.get("country"), "US");
      assert.equal(url.searchParams.get("currency"), "GBP");
      const productUid = url.pathname.split("/")[3];
      assert.ok(productUid === "small-frame" || productUid === "large-frame");
      const price = productUid === "small-frame" ? 10.10 : 10.20;
      return Response.json([{ quantity: 1, price, country: "US", currency: "GBP" }]);
    }

    assert.equal(url.hostname, "order.gelatoapis.com");
    const body = JSON.parse(String(init.body));
    assert.equal(body.currency, "GBP");
    assert.equal(body.recipient.state, "CA");
    const productUid = body.products[0].productUid;
    assert.ok(productUid === "small-frame" || productUid === "large-frame");
    const price = productUid === "small-frame" ? 7.45 : 9.35;
    return Response.json({ quotes: [{ id: productUid, shipmentMethods: [
      { shipmentMethodUid: "wrong-currency", name: "Express", type: "express", isPrivate: true, price: 1, currency: "USD" },
      { shipmentMethodUid: "pickup", name: "Pickup", type: "pick_up", isPrivate: true, price: 0, currency: "GBP" },
      { shipmentMethodUid: "commercial", name: "Commercial", type: "normal", isPrivate: false, price: 1, currency: "GBP" },
      { shipmentMethodUid: "other-economy", name: "Other carrier", type: "standard", isPrivate: true, price: price + 1, currency: "GBP" },
      { shipmentMethodUid: "standard", name: "Standard", type: "normal", isPrivate: true, price, currency: "GBP", minDeliveryDays: 8, maxDeliveryDays: 8 },
      { shipmentMethodUid: "express", name: "Express", type: "express", isPrivate: true, price: price + 3, currency: "GBP" },
    ] }] });
  });

  const small = await getPrintQuote("framed-12x16", address, "GBP");
  const large = await getPrintQuote("framed-18x24", address, "GBP");
  assert.equal(small.quoteId, "small-frame");
  assert.equal(large.quoteId, "large-frame");
  assert.equal(small.printPriceCents, 1260);
  assert.equal(large.printPriceCents, 1270);
  assert.equal(small.methods[0].priceCents, 745);
  assert.equal(large.methods[0].priceCents, 935);
  assert.deepEqual(small.methods.map(({ name }) => name), ["Standard (Economy)", "Express (Express)"]);
  assert.equal(formatDeliveryEstimate(small.methods[0]), "8 days");
  assert.equal(formatDeliveryEstimate(small.methods[1]), null);
  assert.equal(getGelatoProductUid("framed-12x18"), "legacy-frame");
  await assert.rejects(getPrintQuote("framed-12x18", address, "GBP"), /Unknown print format/);

  const quoteResponse = await quoteRoute(new Request("http://localhost/api/gelato/quote", {
    method: "POST",
    body: JSON.stringify({ formatId: "framed-18x24", currency: "GBP", recipient: address }),
  }));
  assert.equal(quoteResponse.status, 200);
  assert.deepEqual(await quoteResponse.json(), JSON.parse(JSON.stringify(large)));

  const checkoutResponse = await checkoutRoute(new Request("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify({
      styleSlug: allStyles[0].slug,
      characters: 1,
      formatId: "framed-18x24",
      currency: "GBP",
      email: "test@example.com",
      photoUrls: ["https://example.com/photo.jpg"],
      shippingAddress: address,
      shippingMethodUid: "standard",
      shippingCents: small.methods[0].priceCents,
      printPriceCents: small.printPriceCents,
    }),
  }));
  assert.equal(checkoutResponse.status, 409);

  assert.equal(orderTotalCents({
    basePrice: 40,
    characters: 1,
    currency: "GBP",
    expedited: false,
    printPriceCents: small.printPriceCents,
    shippingCents: small.methods[0].priceCents,
  }), 5204);
});
