import { isAdminAuthenticated } from "@/lib/adminAuth";
import { deliveryUploadAuthFromRequest } from "@/lib/adminDeliveryUploadToken";

/** Cookie session or short-lived Bearer token from getDeliveryUploadToken. */
export async function canAdminUseBlobUpload(request: Request): Promise<boolean> {
  if (await isAdminAuthenticated(request)) return true;
  return deliveryUploadAuthFromRequest(request) !== null;
}

export function orderIdForDeliveryPathname(pathname: string): string | null {
  const prefix = "orders/deliveries/";
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);
  const orderId = rest.split("/")[0];
  return orderId && orderId.length >= 8 ? orderId : null;
}

export function assertDeliveryUploadPathAllowed(
  request: Request,
  pathname: string
): void {
  const orderId = orderIdForDeliveryPathname(pathname);
  if (!orderId) {
    throw new Error("Invalid upload path");
  }
  const tokenOrderId = deliveryUploadAuthFromRequest(request);
  if (tokenOrderId && tokenOrderId !== orderId) {
    throw new Error("Upload token does not match this order");
  }
}
