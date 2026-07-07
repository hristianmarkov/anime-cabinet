"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { ORDER_STATUSES, orders, type OrderStatus } from "@/lib/schema";
import {
  ADMIN_COOKIE,
  isAdminAuthenticated,
  sessionToken,
  verifyPassword,
} from "@/lib/adminAuth";

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    // Redirect back with error flag; keep it simple.
    revalidatePath("/admin");
    return;
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 14,
  });
  revalidatePath("/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  revalidatePath("/admin");
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
