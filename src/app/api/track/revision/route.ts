import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import { orderReviewMessages, orders } from "@/lib/schema";
import { consumeReviewRateLimit, loadActivePublicReview } from "@/lib/publicReviewActions";

export async function POST(request: Request) {
  let input: { trackToken?: string; message?: string };
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const token = input.trackToken?.trim() ?? "";
  const message = input.message?.trim() ?? "";
  if (!token || message.length < 5 || message.length > 5000) {
    return NextResponse.json({ error: "Feedback must be between 5 and 5,000 characters." }, { status: 400 });
  }
  const review = await loadActivePublicReview(token);
  if (!review) return NextResponse.json({ error: "This review window is no longer active." }, { status: 409 });
  if (!consumeReviewRateLimit(token, "revision")) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  await review.db.insert(orderReviewMessages).values({ orderId: review.order.id, deliveryId: review.delivery.id, direction: "customer", author: "Customer", body: message });
  // Keep the order in customer review while the artist prepares another version.
  // Sending the replacement preview closes this delivery and starts a fresh window.
  await review.db.update(orders).set({ status: "review" }).where(eq(orders.id, review.order.id));
  await addOrderTimelineEvent({ orderId: review.order.id, kind: "revision_requested", summary: `Revision requested for artwork v${review.delivery.versionNumber}`, detail: message.slice(0, 2000), metadata: { deliveryId: review.delivery.id } });
  return NextResponse.json({ ok: true });
}
