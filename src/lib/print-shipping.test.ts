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

test("address-specific Gelato choices keep their carrier IDs and charge only for Express", async (t) => {
  process.env.GELATO_API_KEY = "test-key";
  process.env.GELATO_UID_FRAMED_12X16 = "small-frame";
  const { readCheckoutAddress, getPrintDelivery, checkoutShippingRate } = await import("./print-shipping");
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

  const quote = await getPrintDelivery("framed-12x16", "gbp", recipient);
  assert.equal(quote.standard?.shipmentMethodUid, "standard");
  assert.equal(quote.express?.shipmentMethodUid, "faster");
  const rates = [
    checkoutShippingRate("gbp", "Standard", quote.standard, quote.quoteId),
    checkoutShippingRate("gbp", "Express", quote.express, quote.quoteId),
  ];
  assert.deepEqual(rates.map(({ shipping_rate_data: rate }) => rate?.fixed_amount?.amount), [0, 700]);
  assert.deepEqual(rates.map(({ shipping_rate_data: rate }) => rate?.metadata?.gelatoMethod), ["standard", "faster"]);
});

test("checkout sends fixed prices to Stripe and saves the selected Express rate on payment", async (t) => {
  process.env.STRIPE_SECRET_KEY = "sk_test_example";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_example";
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_example";
  process.env.DATABASE_URL = "postgresql://test:test@database.example/test";
  const { getDb } = await import("./db");
  const { getStripe } = await import("./stripe");
  const { POST: startCheckout } = await import("@/app/api/checkout/route");
  const { POST: updateShipping } = await import("@/app/api/checkout/shipping/route");
  const { POST: receivePayment } = await import("@/app/api/stripe-webhook/route");

  const db = getDb();
  const stripe = getStripe();
  const sessionId = "cs_test_abc";
  const clientSecret = `${sessionId}_secret_xyz`;
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
    assert.equal(params.ui_mode, "form");
    assert.equal(params.customer_email, undefined);
    assert.equal(params.line_items[0].price_data.unit_amount, 9999);
    assert.deepEqual(params.metadata, metadata);
    assert.equal(params.shipping_options[0].shipping_rate_data.fixed_amount.amount, 0);
    assert.ok(params.shipping_address_collection.allowed_countries.includes("US"));
    return { id: sessionId, client_secret: clientSecret };
  });
  t.mock.method(stripe.checkout.sessions, "retrieve", async (_id, params) => params?.expand
    ? {
        amount_total: 10699,
        customer_details: { email: "stripe-customer@example.com" },
        collected_information: { shipping_details: shippingDetails },
        shipping_cost: { amount_total: 700, shipping_rate: {
          display_name: "Express",
          metadata: { gelatoMethod: "faster", gelatoName: "Fast carrier", gelatoQuoteId: "quote-1" },
        } },
      }
    : { id: sessionId, client_secret: clientSecret, status: "open", metadata, ui_mode: "form" });
  const update = t.mock.method(stripe.checkout.sessions, "update", async (_id, params) => {
    assert.deepEqual(params.shipping_options.map((option: { shipping_rate_data: { display_name: string; fixed_amount: { amount: number } } }) =>
      [option.shipping_rate_data.display_name, option.shipping_rate_data.fixed_amount.amount]), [["Standard", 0], ["Express", 700]]);
  });
  t.mock.method(stripe.webhooks, "constructEvent", () => ({
    type: "checkout.session.completed", created: 1795020000,
    data: { object: { id: sessionId, payment_status: "paid", metadata } },
  }));
  t.mock.method(globalThis, "fetch", async () => Response.json({ quotes: [{ id: "quote-1", shipmentMethods: [
    { shipmentMethodUid: "economy", name: "Economy carrier", isPrivate: true, type: "normal", price: 5, currency: "USD", minDeliveryDays: 4, maxDeliveryDays: 5 },
    { shipmentMethodUid: "faster", name: "Fast carrier", isPrivate: true, type: "express", price: 7, currency: "USD", minDeliveryDays: 2, maxDeliveryDays: 3 },
  ] }] }));

  const post = (body: unknown, headers?: Record<string, string>) =>
    new Request("http://localhost/api/checkout", { method: "POST", body: JSON.stringify(body), headers });
  const checkout = await startCheckout(post({
    styleSlug: "naruto", formatId: "framed-12x16", characters: 1, currency: "USD",
    photoUrls: ["https://example.com/photo.jpg"],
    printPriceCents: 1, shippingCents: 99,
  }));
  assert.equal(checkout.status, 200);
  assert.equal((await checkout.json()).clientSecret, clientSecret);

  assert.equal((await updateShipping(post({ sessionId, shippingDetails }))).status, 403);
  assert.equal((await updateShipping(post({ sessionId, shippingDetails }, { Authorization: `Bearer ${clientSecret}` }))).status, 200);
  assert.equal(update.mock.callCount(), 1);
  assert.equal((await receivePayment(post({}, { "stripe-signature": "test" }))).status, 200);
  const paid = patches.find((patch) => patch.status === "paid");
  assert.equal(paid?.amountTotal, 10699);
  assert.equal(paid?.email, "stripe-customer@example.com");
  assert.equal(paid?.shippingAmount, 700);
  assert.equal(paid?.shippingMethodUid, "faster");
  assert.equal((paid?.shippingAddress as { addressLine2: string }).addressLine2, "Apt 2");
});
