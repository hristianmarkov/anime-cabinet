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
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { sendOrderDeliveryToCustomer } from "@/lib/sendOrderDelivery";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
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
  store.set(ADMIN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  redirect("/admin");
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const returnToRaw = formData.get("returnTo");
  if (!orderId || !ORDER_STATUSES.includes(status)) return;

  const db = getDb();
  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) return;

  await db.update(orders).set({ status }).where(eq(orders.id, orderId));

  if (existing.status !== status) {
    await addOrderTimelineEvent({
      orderId,
      kind: "status_updated",
      summary: `Status changed to ${status.replace(/_/g, " ")}`,
      metadata: { from: existing.status, to: status },
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  if (typeof returnToRaw === "string" && returnToRaw.startsWith("/admin")) {
    redirect(returnToRaw);
  }
}

export async function sendDelivery(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;

  const orderId = String(formData.get("orderId") ?? "");
  const comment = String(formData.get("comment") ?? "");
  const imageUrlsRaw = String(formData.get("imageUrls") ?? "[]");
  let imageUrls: string[] = [];
  try {
    const parsed = JSON.parse(imageUrlsRaw) as unknown;
    if (Array.isArray(parsed)) {
      imageUrls = parsed.filter((u): u is string => typeof u === "string");
    }
  } catch {
    redirect(`/admin/orders/${orderId}?error=invalid_images`);
  }

  const result = await sendOrderDeliveryToCustomer({ orderId, comment, imageUrls });
  if (!result.ok) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?sent=1`);
}
