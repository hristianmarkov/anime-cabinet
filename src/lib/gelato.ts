import { getGelatoProductUid } from "@/data/gelato-products";
import type { Order, OrderStatus, ShippingAddress } from "./schema";

const GELATO_BASE = "https://order.gelatoapis.com";

function apiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY is not set");
  return key;
}

function gelatoHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey(),
  };
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
    headers: gelatoHeaders(),
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

export interface GelatoCreateOrderResult {
  gelatoOrderId: string;
  fulfillmentStatus: string | null;
}

export async function createGelatoPrintOrder(order: Order, printFileUrl: string): Promise<GelatoCreateOrderResult> {
  const productUid = getGelatoProductUid(order.formatId);
  if (!productUid) {
    throw new Error(`No Gelato product UID configured for format ${order.formatId}.`);
  }
  const shipping = order.shippingAddress;
  if (!shipping) {
    throw new Error("Print order is missing a shipping address.");
  }
  if (!printFileUrl.startsWith("http")) {
    throw new Error("Print file must be a public HTTPS URL.");
  }

  const currency = (order.currency ?? "usd").toUpperCase();
  const body: Record<string, unknown> = {
    orderType: "order",
    orderReferenceId: order.id,
    customerReferenceId: order.email,
    currency,
    items: [
      {
        itemReferenceId: `item-${order.id.slice(0, 8)}`,
        productUid,
        quantity: 1,
        files: [{ type: "default", url: printFileUrl }],
      },
    ],
    shippingAddress: {
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      addressLine1: shipping.addressLine1,
      city: shipping.city,
      postCode: shipping.postCode,
      country: shipping.country,
      email: order.email,
    },
  };

  if (order.shippingMethodUid) {
    body.shipmentMethodUid = order.shippingMethodUid;
  }

  const res = await fetch(`${GELATO_BASE}/v4/orders`, {
    method: "POST",
    headers: gelatoHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gelato create order failed: ${err.slice(0, 800)}`);
  }

  const data = (await res.json()) as {
    id?: string;
    fulfillmentStatus?: string;
  };

  if (!data.id) {
    throw new Error("Gelato create order returned no order id.");
  }

  return {
    gelatoOrderId: data.id,
    fulfillmentStatus: data.fulfillmentStatus ?? null,
  };
}

export interface GelatoOrderDetails {
  id: string;
  fulfillmentStatus: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}

export async function getGelatoOrder(gelatoOrderId: string): Promise<GelatoOrderDetails> {
  const res = await fetch(`${GELATO_BASE}/v4/orders/${encodeURIComponent(gelatoOrderId)}`, {
    method: "GET",
    headers: gelatoHeaders(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gelato get order failed: ${err.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    id?: string;
    fulfillmentStatus?: string;
    shipment?: {
      trackingCode?: string;
      trackingUrl?: string;
      packages?: { trackingCode?: string; trackingUrl?: string }[];
    };
  };

  const pkg = data.shipment?.packages?.[0];
  const trackingNumber =
    pkg?.trackingCode ?? data.shipment?.trackingCode ?? null;
  const trackingUrl = pkg?.trackingUrl ?? data.shipment?.trackingUrl ?? null;

  return {
    id: data.id ?? gelatoOrderId,
    fulfillmentStatus: data.fulfillmentStatus ?? null,
    trackingNumber,
    trackingUrl,
  };
}

/** Map Gelato fulfillment status to our order status when syncing. */
export function mapGelatoFulfillmentToOrderStatus(fulfillmentStatus: string | null): OrderStatus | null {
  if (!fulfillmentStatus) return null;
  const s = fulfillmentStatus.toLowerCase();
  if (s.includes("deliver") || s === "delivered") return "delivered";
  if (s.includes("ship") || s === "shipped") return "shipped";
  if (
    s.includes("print") ||
    s.includes("production") ||
    s.includes("passed") ||
    s.includes("created") ||
    s === "in_progress"
  ) {
    return "printing";
  }
  return null;
}

export function isGelatoConfigured(): boolean {
  return Boolean(process.env.GELATO_API_KEY);
}
