"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ORDER_STATUSES, orders, type OrderStatus } from "@/lib/schema";
import {
  ADMIN_COOKIE,
  isAdminAuthenticated,
  sessionToken,
  verifyPassword,
} from "@/lib/adminAuth";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/admin",
};

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=not_configured");
  }
  if (!verifyPassword(password)) {
    redirect("/admin?error=invalid");
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionToken(), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  // Must match path used when setting, or the cookie won't clear in production.
  store.set(ADMIN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  redirect("/admin");
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!orderId || !ORDER_STATUSES.includes(status)) return;

  const db = getDb();
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  revalidatePath("/admin");
}
