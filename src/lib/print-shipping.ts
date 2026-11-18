import type Stripe from "stripe";
import { getGelatoProductUid } from "@/data/gelato-products";
import { isCompleteShippingAddress } from "@/data/shipping";
import { quoteGelatoOrder, type GelatoShipmentMethod } from "@/lib/gelato";
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

export function checkoutShippingRate(
  currency: string,
  name: "Standard" | "Express" = "Standard",
  method?: GelatoShipmentMethod,
  quoteId?: string,
): Stripe.Checkout.SessionCreateParams.ShippingOption {
  const min = method?.minDeliveryDays;
  const max = method?.maxDeliveryDays;
  return {
    shipping_rate_data: {
      display_name: name,
      type: "fixed_amount",
      fixed_amount: { amount: name === "Express" && method ? Math.round(method.price * 100) : 0, currency },
      ...(method && quoteId ? {
        metadata: { gelatoMethod: method.shipmentMethodUid, gelatoName: method.name, gelatoQuoteId: quoteId },
      } : {}),
      ...(typeof min === "number" && typeof max === "number" &&
        Number.isInteger(min) && Number.isInteger(max) && min > 0 && max >= min ? {
        delivery_estimate: {
          minimum: { unit: "day", value: min },
          maximum: { unit: "day", value: max },
        },
      } : {}),
    },
  };
}

export async function getPrintDelivery(formatId: string, currency: string, recipient: ShippingAddress) {
  const productUid = getGelatoProductUid(formatId);
  if (!productUid) throw new Error(`Missing Gelato product UID for ${formatId}`);
  const quote = await quoteGelatoOrder({ productUid, currency: currency.toUpperCase(), recipient });
  const methods = quote.methods.filter((method) => method.isPrivate &&
    ["normal", "standard", "express"].includes(method.type) && method.shipmentMethodUid &&
    method.currency === currency.toUpperCase() && Number.isFinite(method.price) && method.price >= 0);
  const standard = methods.sort((a, b) =>
    a.price - b.price || (a.maxDeliveryDays ?? Infinity) - (b.maxDeliveryDays ?? Infinity))[0];
  const standardDays = standard?.maxDeliveryDays;
  const express = typeof standardDays === "number"
    ? methods.filter((method): method is GelatoShipmentMethod & { maxDeliveryDays: number } => typeof method.maxDeliveryDays === "number" &&
        Number.isInteger(method.maxDeliveryDays) && method.maxDeliveryDays > 0 && method.maxDeliveryDays < standardDays)
      .sort((a, b) => b.maxDeliveryDays - a.maxDeliveryDays || a.price - b.price)[0]
    : undefined;
  return { quoteId: quote.quoteId, standard, express };
}
