import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { statusAfterArtworkApproval } from "@/lib/orderWorkflow";
import { orders } from "@/lib/schema";
import { notifyCustomerOfStatusChange } from "@/lib/orderStatusEmails";
import { closeReviewDelivery, consumeReviewRateLimit, loadActivePublicReview } from "@/lib/publicReviewActions";

export async function POST(request: Request) {
  let input: { trackToken?: string };
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const token = input.trackToken?.trim() ?? "";
  if (!token) return NextResponse.json({ error: "Tracking token is required." }, { status: 400 });
  const review = await loadActivePublicReview(token);
  if (!review) return NextResponse.json({ error: "This review window is no longer active." }, { status: 409 });
  if (!consumeReviewRateLimit(token, "approve")) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  const next = statusAfterArtworkApproval(review.order);
  await closeReviewDelivery(review.delivery.id);
  await review.db.update(orders).set({ status: next }).where(eq(orders.id, review.order.id));
  await addOrderTimelineEvent({ orderId: review.order.id, kind: "artwork_approved", summary: next === "digital_file" ? "Artwork approved — digital file ready" : "Artwork approved — ready for print", metadata: { deliveryId: review.delivery.id, status: next } });
  const updated = { ...review.order, status: next };
  try {
    await notifyCustomerOfStatusChange(updated, "review", next, { latestDelivery: review.delivery });
  } catch (error) {
    console.error("Public artwork approval email failed:", error);
  }
  return NextResponse.json({ ok: true, status: next });
}
