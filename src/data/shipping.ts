import type { ShippingAddress } from "@/lib/schema";

export function requiresShippingState(country: string): boolean {
  return ["US", "CA", "AU"].includes(country);
}

export function isCompleteShippingAddress(address: ShippingAddress | null | undefined): address is ShippingAddress {
  return Boolean(
    address && /^[A-Z]{2}$/.test(address.country) &&
    [address.firstName, address.lastName, address.addressLine1, address.city, address.postCode]
      .every((field) => typeof field === "string" && field.trim()) &&
    (!requiresShippingState(address.country) || (typeof address.state === "string" && address.state.trim()))
  );
}
