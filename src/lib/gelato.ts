import type { ShippingAddress } from "./schema";

const GELATO_BASE = "https://order.gelatoapis.com";

function apiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY is not set");
  return key;
}

export interface GelatoShipmentMethod {
  shipmentMethodUid: string;
  name: string;
  price: number;
  currency: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
}

export interface GelatoQuoteResult {
  quoteId: string;
  methods: GelatoShipmentMethod[];
  products?: { itemReferenceId: string; productUid: string; quantity: number; price: number; currency: string }[];
}

export async function quoteGelatoOrder(params: {
  productUid: string;
  quantity?: number;
  currency?: string;
  recipient: ShippingAddress;
}): Promise<GelatoQuoteResult> {
  const ref = `quote-${Date.now()}`;
  const body = {
    orderReferenceId: ref,
    customerReferenceId: ref,
    currency: params.currency ?? "USD",
    allowMultipleQuotes: false,
    recipient: {
      firstName: params.recipient.firstName,
      lastName: params.recipient.lastName,
      addressLine1: params.recipient.addressLine1,
      city: params.recipient.city,
      postCode: params.recipient.postCode,
      country: params.recipient.country,
    },
    products: [
      {
        itemReferenceId: "item-1",
        productUid: params.productUid,
        quantity: params.quantity ?? 1,
      },
    ],
  };

  const res = await fetch(`${GELATO_BASE}/v4/orders:quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gelato quote failed: ${err}`);
  }

  const data = await res.json();
  const quote = data.quotes?.[0];
  if (!quote) throw new Error("No shipping quotes returned for this address");

  const methods: GelatoShipmentMethod[] = (quote.shipmentMethods ?? []).map(
    (m: {
      shipmentMethodUid: string;
      name: string;
      price: number;
      currency: string;
      minDeliveryDays?: number;
      maxDeliveryDays?: number;
    }) => ({
      shipmentMethodUid: m.shipmentMethodUid,
      name: m.name,
      price: m.price,
      currency: m.currency,
      minDeliveryDays: m.minDeliveryDays,
      maxDeliveryDays: m.maxDeliveryDays,
    })
  );

  return {
    quoteId: quote.id,
    methods,
    products: (quote.products ?? []).map(
      (p: { itemReferenceId: string; productUid: string; quantity: number; price: number; currency: string }) => ({
        itemReferenceId: p.itemReferenceId,
        productUid: p.productUid,
        quantity: p.quantity,
        price: p.price,
        currency: p.currency,
      })
    ),
  };
}

export function isGelatoConfigured(): boolean {
  return Boolean(process.env.GELATO_API_KEY);
}
