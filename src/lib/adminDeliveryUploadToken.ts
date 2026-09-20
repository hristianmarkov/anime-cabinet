import { createHmac, timingSafeEqual } from "crypto";
import { sessionToken } from "@/lib/adminAuth";

const TTL_MS = 20 * 60 * 1000;

function signingKey(): string {
  return sessionToken();
}

export function createDeliveryUploadToken(orderId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${orderId}:${exp}`;
  const sig = createHmac("sha256", signingKey())
    .update(`delivery-upload:${payload}`)
    .digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyDeliveryUploadToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon <= 0) return null;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const expected = createHmac("sha256", signingKey())
      .update(`delivery-upload:${payload}`)
      .digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const colon = payload.indexOf(":");
    if (colon <= 0) return null;
    const orderId = payload.slice(0, colon);
    const exp = Number(payload.slice(colon + 1));
    if (!orderId || !Number.isFinite(exp) || Date.now() > exp) return null;
    return orderId;
  } catch {
    return null;
  }
}

export function deliveryUploadAuthFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyDeliveryUploadToken(auth.slice("Bearer ".length).trim());
}
