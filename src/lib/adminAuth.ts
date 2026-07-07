import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ac_admin_session";

export function sessionToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  return createHmac("sha256", password).update("anime-cabinet-admin").digest("hex");
}

export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(password);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  const expected = sessionToken();
  const a = Buffer.from(cookie);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
