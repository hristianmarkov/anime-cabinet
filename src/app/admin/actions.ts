"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  ORDER_STATUSES,
  orderCustomerFeedback,
  orderDeliveries,
  orders,
  type OrderStatus,
} from "@/lib/schema";
import { statusAfterArtworkApproval } from "@/lib/orderWorkflow";
import {
  ADMIN_COOKIE,
  adminCookieDomain,
  isAdminAuthenticated,
  sessionToken,
  verifyPassword,
} from "@/lib/adminAuth";
import { generateArtPromptForOrder } from "@/lib/generateArtPromptForOrder";
import { generateDeliveryMessageForOrder } from "@/lib/generateDeliveryMessageForOrder";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { getLatestSentDelivery } from "@/lib/orderDeliveries";
import { notifyCustomerOfStatusChange } from "@/lib/orderStatusEmails";
import { createGelatoPrintOrder, isGelatoConfigured } from "@/lib/gelato";
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
    domain: adminCookieDomain(),
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { ...COOKIE_OPTIONS, domain: adminCookieDomain(), maxAge: 0 });
  redirect("/admin");
}

export async function combineArtPromptForOrder(orderId: string) {
  if (!(await isAdminAuthenticated())) {
    return { ok: false as const, error: "Unauthorized. Log in again at /admin." };
  }

  try {
    const result = await generateArtPromptForOrder(orderId);
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }
    return {
      ok: true as const,
      prompt: result.prompt,
    };
  } catch (error) {
    console.error("combineArtPromptForOrder:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return { ok: false as const, error: message };
  }
}

export async function draftDeliveryMessageForOrder(orderId: string, adminNotes?: string) {
  if (!(await isAdminAuthenticated())) {
    return { ok: false as const, error: "Unauthorized. Log in again at /admin." };
  }

  const result = await generateDeliveryMessageForOrder(orderId, adminNotes);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }
  return { ok: true as const, draft: result.draft };
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const returnToRaw = formData.get("returnTo");
  const sendCancelEmail = formData.get("sendCancelEmail") === "1";
  const cancelNote = String(formData.get("cancelNote") ?? "").trim();
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
    const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (updated) {
      try {
        const latestDelivery = await getLatestSentDelivery(orderId);
        await notifyCustomerOfStatusChange(updated, existing.status, status, {
          sendCancelEmail,
          cancelNote,
          latestDelivery,
        });
      } catch (err) {
        console.error("Status email failed:", err);
      }
    }
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

async function closeActiveDelivery(orderId: string): Promise<void> {
  const db = getDb();
  const now = new Date();
  const [delivery] = await db
    .select()
    .from(orderDeliveries)
    .where(
      and(
        eq(orderDeliveries.orderId, orderId),
        isNotNull(orderDeliveries.sentAt),
        isNull(orderDeliveries.autoCompletedAt)
      )
    )
    .limit(1);
  if (delivery) {
    await db
      .update(orderDeliveries)
      .set({ autoCompletedAt: now })
      .where(eq(orderDeliveries.id, delivery.id));
  }
}

export async function approveArtwork(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "review") return;

  await closeActiveDelivery(orderId);
  const next = statusAfterArtworkApproval(order);
  await db.update(orders).set({ status: next }).where(eq(orders.id, orderId));

  await addOrderTimelineEvent({
    orderId,
    kind: "artwork_approved",
    summary:
      next === "delivered"
        ? "Artwork approved — order closed"
        : "Artwork approved — ready for print",
    metadata: { status: next },
  });

  const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (updated) {
    try {
      const latestDelivery = await getLatestSentDelivery(orderId);
      await notifyCustomerOfStatusChange(updated, "review", next, { latestDelivery });
    } catch (err) {
      console.error("Approve artwork email failed:", err);
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function requestRevision(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "review") return;

  await closeActiveDelivery(orderId);
  await db.update(orders).set({ status: "in_progress" }).where(eq(orders.id, orderId));

  await addOrderTimelineEvent({
    orderId,
    kind: "revision_requested",
    summary: "Revision requested — back in production",
  });

  const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (updated) {
    try {
      await notifyCustomerOfStatusChange(updated, "review", "in_progress");
    } catch (err) {
      console.error("Revision email failed:", err);
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function logCustomerFeedback(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const orderId = String(formData.get("orderId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!orderId || !body) return;

  const db = getDb();
  await db.insert(orderCustomerFeedback).values({
    orderId,
    body,
    source: "manual",
  });

  await addOrderTimelineEvent({
    orderId,
    kind: "customer_feedback",
    summary: "Customer message logged",
    detail: body,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function updatePrintFulfillment(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const printFileUrl = String(formData.get("printFileUrl") ?? "").trim();
  const gelatoOrderId = String(formData.get("gelatoOrderId") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim();
  const status = String(formData.get("status") ?? "") as OrderStatus;

  const db = getDb();
  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) return;

  const patch: {
    printFileUrl: string | null;
    gelatoOrderId: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    status?: OrderStatus;
  } = {
    printFileUrl: printFileUrl || null,
    gelatoOrderId: gelatoOrderId || null,
    trackingNumber: trackingNumber || null,
    trackingUrl: trackingUrl || null,
  };

  if (
    ORDER_STATUSES.includes(status) &&
    ["printing", "shipped", "delivered", "approved"].includes(status)
  ) {
    patch.status = status;
  }

  await db.update(orders).set(patch).where(eq(orders.id, orderId));

  if (patch.status && existing.status !== patch.status) {
    await addOrderTimelineEvent({
      orderId,
      kind: "status_updated",
      summary: `Fulfillment: ${String(patch.status).replace(/_/g, " ")}`,
      metadata: { gelatoOrderId, trackingNumber },
    });
    const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (updated) {
      try {
        const latestDelivery = await getLatestSentDelivery(orderId);
        await notifyCustomerOfStatusChange(updated, existing.status, patch.status, {
          latestDelivery,
        });
      } catch (err) {
        console.error("Fulfillment status email failed:", err);
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

export async function submitGelatoOrder(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId || !isGelatoConfigured()) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent("Gelato is not configured.")}`);
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return;
  if (order.gelatoOrderId) {
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent("Gelato order already exists.")}`);
  }
  if (!order.printFileUrl) {
    redirect(
      `/admin/orders/${orderId}?error=${encodeURIComponent("Save a print-ready file URL first.")}`
    );
  }

  try {
    const created = await createGelatoPrintOrder(order, order.printFileUrl);
    const prevStatus = order.status;
    await db
      .update(orders)
      .set({
        gelatoOrderId: created.gelatoOrderId,
        gelatoFulfillmentStatus: created.fulfillmentStatus,
        status: "printing",
      })
      .where(eq(orders.id, orderId));

    await addOrderTimelineEvent({
      orderId,
      kind: "gelato_submitted",
      summary: "Submitted to Gelato for printing",
      metadata: { gelatoOrderId: created.gelatoOrderId },
    });

    const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (updated && prevStatus !== "printing") {
      try {
        const latestDelivery = await getLatestSentDelivery(orderId);
        await notifyCustomerOfStatusChange(updated, prevStatus, "printing", { latestDelivery });
      } catch (err) {
        console.error("Gelato submit email failed:", err);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gelato submit failed";
    redirect(`/admin/orders/${orderId}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?sent=gelato`);
}
