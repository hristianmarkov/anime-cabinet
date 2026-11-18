import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrintSize, getOrderFormatLabel, orderTotalCents, PRINT_FORMATS } from "@/data/pricing";

test("all print sizes have fixed USD prices with free shipping", () => {
  const expected = [3999, 6499, 7499, 8999, 10999, 9999, 12999];
  assert.deepEqual(PRINT_FORMATS.map(({ id: formatId }) =>
    orderTotalCents({ characters: 1, currency: "USD", expedited: false, formatId })), expected);
  assert.equal(orderTotalCents({ characters: 2, currency: "USD", expedited: true, formatId: "framed-18x24" }), 15499);

  const totalGbp = orderTotalCents({ characters: 2, currency: "GBP", expedited: true, formatId: "poster-12x16" });
  assert.equal(totalGbp, 3199 + 1199 + 799 + 1999);
});

test("format dimensions by locale and retain the dimensions of existing orders", () => {
  assert.equal(formatPrintSize("12x16", "US", "en-US"), "12 × 16 in");
  assert.equal(formatPrintSize("12x16", "DE", "de-DE"), "30,5 × 40,6 cm");
  assert.equal(formatPrintSize("18x24", "GB", "en-GB"), "45.7 × 61 cm");
  assert.match(getOrderFormatLabel("framed-12x18"), /12x18/);
});

test("Standard is free in Stripe and Gelato fulfillment uses the cheapest eligible carrier", async (t) => {
  process.env.GELATO_API_KEY = "test-key";
  process.env.GELATO_UID_FRAMED_12X16 = "small-frame";
  const { readCheckoutAddress, getStandardPrintDelivery, checkoutShippingRate } = await import("./print-shipping");
  const address = {
    name: "Test Customer",
    address: {
      line1: "1 Main St", line2: "Apt 2", city: "Los Angeles", state: "CA",
      postal_code: "90012", country: "US",
    },
  };
  const recipient = readCheckoutAddress(address);
  assert.ok(recipient);
  assert.equal(readCheckoutAddress({ ...address, address: { ...address.address, country: "JP" } }), null);
  assert.equal(readCheckoutAddress({ ...address, address: { ...address.address, state: "" } }), null);

  const candidates = [
    { shipmentMethodUid: "express", name: "Express", type: "express", price: 15, maxDeliveryDays: 2 },
    { shipmentMethodUid: "faster", name: "Faster", type: "normal", price: 7, maxDeliveryDays: 4 },
    { shipmentMethodUid: "standard", name: "Slowest", type: "standard", price: 6, maxDeliveryDays: 5 },
    { shipmentMethodUid: "slower", name: "Slower", type: "normal", price: 8, maxDeliveryDays: 6 },
    { shipmentMethodUid: "pickup", name: "Pickup", type: "pick_up", price: 0, maxDeliveryDays: 7 },
    { shipmentMethodUid: "commercial", name: "Commercial", type: "normal", price: 5, maxDeliveryDays: 8, isPrivate: false },
  ];
  t.mock.method(globalThis, "fetch", async (input: string, init: RequestInit) => {
    assert.equal(input, "https://order.gelatoapis.com/v4/orders:quote");
    const body = JSON.parse(String(init.body));
    assert.equal(body.recipient.addressLine2, "Apt 2");
    assert.equal(body.recipient.state, "CA");
    assert.equal(body.currency, "GBP");
    assert.equal(body.products[0].productUid, "small-frame");
    return Response.json({ quotes: [{ id: "quote-1", shipmentMethods: candidates.map((method) => ({
      currency: "GBP", isPrivate: true, minDeliveryDays: 2, ...method,
    })) }] });
  });

  const quote = await getStandardPrintDelivery("framed-12x16", "gbp", recipient);
  assert.equal(quote.standard?.shipmentMethodUid, "standard");
  assert.equal(quote.quoteId, "quote-1");
  const rate = checkoutShippingRate("gbp").shipping_rate_data;
  assert.equal(rate?.display_name, "Standard");
  assert.deepEqual(rate?.fixed_amount, { amount: 0, currency: "gbp" });
});

test("hosted checkout collects the customer email and address for free Standard delivery", async (t) => {
  process.env.STRIPE_SECRET_KEY = "sk_test_example";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_example";
  process.env.DATABASE_URL = "postgresql://test:test@database.example/test";
  const { getDb } = await import("./db");
  const { getStripe } = await import("./stripe");
  const { POST: startCheckout } = await import("@/app/api/checkout/route");
  const { POST: receivePayment } = await import("@/app/api/stripe-webhook/route");

  const db = getDb();
  const stripe = getStripe();
  const sessionId = "cs_test_abc";
  const checkoutUrl = "https://checkout.stripe.com/c/pay/cs_test_abc";
  const orderId = "00000000-0000-4000-8000-000000000001";
  const shippingDetails = {
    name: "Test Customer",
    address: { line1: "1 Main St", line2: "Apt 2", city: "Los Angeles", state: "CA", postal_code: "90012", country: "US" },
  };
  const metadata = { orderId, printDelivery: "stripe" };
  const patches: Array<Record<string, unknown>> = [];
  t.mock.method(db, "insert", () => ({
    values: (values: Record<string, unknown>) => {
      if (values.kind === "order_created") return Promise.resolve();
      assert.equal(values.amountTotal, 9999);
      assert.equal(values.email, "");
      assert.equal(values.shippingAddress, undefined);
      return { returning: async () => [{ id: orderId }] };
    },
  }));
  t.mock.method(db, "update", () => ({
    set: (values: Record<string, unknown>) => {
      patches.push(values);
      return { where: () => ({ returning: async () => [] }) };
    },
  }));
  t.mock.method(db, "select", () => ({
    from: () => ({
      where: () => ({ limit: async () => [{ formatId: "framed-12x16", currency: "usd", createdAt: new Date(), expedited: false }] }),
    }),
  }));
  t.mock.method(stripe.checkout.sessions, "create", async (params) => {
    assert.equal(params.ui_mode, "hosted_page");
    assert.equal(params.customer_email, undefined);
    assert.equal(params.line_items[0].price_data.unit_amount, 9999);
    assert.deepEqual(params.metadata, metadata);
    assert.equal(params.shipping_options[0].shipping_rate_data.fixed_amount.amount, 0);
    assert.ok(params.shipping_address_collection.allowed_countries.includes("US"));
    assert.equal(params.shipping_options.length, 1);
    return { id: sessionId, url: checkoutUrl };
  });
  t.mock.method(stripe.checkout.sessions, "retrieve", async () => ({
    amount_total: 9999,
    customer_details: { email: "stripe-customer@example.com" },
    collected_information: { shipping_details: shippingDetails },
    shipping_cost: { amount_total: 0, shipping_rate: { display_name: "Standard", metadata: {} } },
  }));
  t.mock.method(stripe.webhooks, "constructEvent", () => ({
    type: "checkout.session.completed", created: 1795020000,
    data: { object: { id: sessionId, payment_status: "paid", metadata } },
  }));
  const post = (body: unknown, headers?: Record<string, string>) =>
    new Request("http://localhost/api/checkout", { method: "POST", body: JSON.stringify(body), headers });
  const checkout = await startCheckout(post({
    styleSlug: "naruto", formatId: "framed-12x16", characters: 1, currency: "USD",
    photoUrls: ["https://example.com/photo.jpg"],
    printPriceCents: 1, shippingCents: 99,
  }));
  assert.equal(checkout.status, 200);
  assert.deepEqual(await checkout.json(), { url: checkoutUrl });

  assert.equal((await receivePayment(post({}, { "stripe-signature": "test" }))).status, 200);
  const paid = patches.find((patch) => patch.status === "paid");
  assert.equal(paid?.amountTotal, 9999);
  assert.equal(paid?.email, "stripe-customer@example.com");
  assert.equal(paid?.shippingAmount, 0);
  assert.equal(paid?.shippingMethodUid, null);
  assert.equal(paid?.shippingMethodName, "Standard");
  assert.equal((paid?.shippingAddress as { addressLine2: string }).addressLine2, "Apt 2");
});
