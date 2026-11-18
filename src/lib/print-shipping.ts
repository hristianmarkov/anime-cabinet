import type Stripe from "stripe";
import { getGelatoProductUid } from "@/data/gelato-products";
import { isCompleteShippingAddress } from "@/data/shipping";
import { quoteGelatoOrder } from "@/lib/gelato";
import type { ShippingAddress } from "@/lib/schema";

export const PRINT_DESTINATIONS = ["US", "GB", "DE", "FR", "CA", "AU", "NL", "ES", "IT", "IE"] as const;

type ShippingDetails = Stripe.Checkout.SessionUpdateParams.CollectedInformation.ShippingDetails;

export function readCheckoutAddress(value: unknown): ShippingAddress | null {
  if (!value || typeof value !== "object" || !("name" in value) || typeof value.name !== "string" ||
      !("address" in value) || !value.address || typeof value.address !== "object") return null;
  const address = value.address as Partial<Record<keyof ShippingDetails["address"], unknown>>;
  const field = (key: keyof ShippingDetails["address"]) =>
    typeof address[key] === "string" ? address[key].trim() : "";
  const [firstName, ...surname] = value.name.trim().split(/\s+/);
  const recipient = {
    firstName,
    // Stripe collects a single name field. Gelato requires both fields.
    lastName: surname.join(" ") || firstName,
    addressLine1: field("line1"),
    addressLine2: field("line2") || undefined,
    city: field("city"),
    postCode: field("postal_code"),
    state: field("state") || undefined,
    country: field("country").toUpperCase(),
  };
  return PRINT_DESTINATIONS.some((country) => country === recipient.country) &&
    isCompleteShippingAddress(recipient) ? recipient : null;
}

export function checkoutShippingRate(currency: string): Stripe.Checkout.SessionCreateParams.ShippingOption {
  return {
    shipping_rate_data: {
      display_name: "Standard",
      type: "fixed_amount",
      fixed_amount: { amount: 0, currency },
    },
  };
}

export async function getStandardPrintDelivery(formatId: string, currency: string, recipient: ShippingAddress) {
  const productUid = getGelatoProductUid(formatId);
  if (!productUid) throw new Error(`Missing Gelato product UID for ${formatId}`);
  const quote = await quoteGelatoOrder({ productUid, currency: currency.toUpperCase(), recipient });
  const methods = quote.methods.filter((method) => method.isPrivate &&
    ["normal", "standard", "express"].includes(method.type) && method.shipmentMethodUid &&
    method.currency === currency.toUpperCase() && Number.isFinite(method.price) && method.price >= 0);
  const standard = methods.sort((a, b) =>
    a.price - b.price || (a.maxDeliveryDays ?? Infinity) - (b.maxDeliveryDays ?? Infinity))[0];
  if (!standard) throw new Error("Gelato has no standard delivery service for this address.");
  return { quoteId: quote.quoteId, standard };
}
