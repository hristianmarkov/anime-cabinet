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

function adminSessionFromCookieHeader(header: string | null): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${ADMIN_COOKIE}=`)) continue;
    const value = trimmed.slice(ADMIN_COOKIE.length + 1);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return undefined;
}

function verifyAdminSessionCookie(cookie: string | undefined): boolean {
  if (!cookie || !process.env.ADMIN_PASSWORD) return false;
  let expected: string;
  try {
    expected = sessionToken();
  } catch {
    return false;
  }
  const a = Buffer.from(cookie);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Pass `request` from Route Handlers so the session cookie is read from the incoming Cookie header. */
export async function isAdminAuthenticated(request?: Request): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;

  let cookie: string | undefined;
  try {
    cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  } catch {
    cookie = undefined;
  }

  if (!cookie && request) {
    cookie = adminSessionFromCookieHeader(request.headers.get("cookie"));
  }

  return verifyAdminSessionCookie(cookie);
}

export function adminCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").split("/")[0] ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;
  if (host?.endsWith("animecabinet.com")) {
    return ".animecabinet.com";
  }
  return undefined;
}
