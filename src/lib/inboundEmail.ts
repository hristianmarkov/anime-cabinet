import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { recordInboundContactThreadHeaders } from "@/lib/contactThreadState";
import { extractRoutingFromRecipients } from "@/lib/emailReplyRouting";
import { headerValue, normalizeRfcMessageId } from "@/lib/emailThreading";
import { addOrderTimelineEvent } from "@/lib/orderTimeline";
import {
  contactInquiries,
  contactMessages,
  orderReviewMessages,
  orders,
} from "@/lib/schema";

function normalizeEmail(email: string): string {
  const match = email.match(/<([^>]+)>/);
  return (match ? match[1] : email).trim().toLowerCase();
}

export function stripQuotedReply(text: string): string {
  const lines = text.split(/\r?\n/);
  const kept: string[] = [];
  for (const line of lines) {
    if (/^On .+ wrote:$/i.test(line.trim())) break;
    if (/^>{1,}\s/.test(line)) continue;
    if (/^From:\s/i.test(line)) break;
    if (/^(--\s*$|_{5,}|-{5,})/.test(line.trim())) break;
    if (/^(information about brokerage services|texas real estate commission|the information contained in this email)/i.test(line.trim())) break;
    if (/^(direct|mobile|office|website|email):\s/i.test(line.trim()) && kept.length > 0) break;
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function processInboundEmail(input: {
  to: string[];
  from: string;
  subject: string;
  text: string | null;
  html: string | null;
  headers?: Record<string, string>;
}): Promise<{ handled: boolean; kind?: string }> {
  const route = extractRoutingFromRecipients(input.to);
  const bodyRaw = input.text?.trim() || input.html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
  const body = stripQuotedReply(bodyRaw);
  if (!body) {
    return { handled: false };
  }

  const fromEmail = normalizeEmail(input.from);
  const db = getDb();

  if (route?.kind === "order") {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.trackToken, route.trackToken))
      .limit(1);
    if (!order) return { handled: false };
    if (normalizeEmail(order.email) !== fromEmail) {
      console.warn("Inbound order email from non-matching address", fromEmail, order.id);
      return { handled: false };
    }

    await db.insert(orderReviewMessages).values({
      orderId: order.id,
      body: `[Email] ${input.subject}\n\n${body}`,
      direction: "customer",
      author: order.email,
    });

    await addOrderTimelineEvent({
      orderId: order.id,
      kind: "customer_feedback",
      summary: "Customer replied by email",
      detail: body.slice(0, 2000),
    });

    if (order.status === "digital_file" || order.status === "delivered" || order.status === "cancelled") {
      // still log feedback
    } else if (order.status === "review") {
      // admin reviews in panel — no auto status change
    }

    return { handled: true, kind: "order" };
  }

  if (route?.kind === "contact") {
    const [inquiry] = await db
      .select()
      .from(contactInquiries)
      .where(eq(contactInquiries.id, route.inquiryId))
      .limit(1);
    if (!inquiry) return { handled: false };
    if (normalizeEmail(inquiry.email) !== fromEmail) {
      return { handled: false };
    }

    const inboundMessageId = headerValue(input.headers, "Message-ID");
    const normalizedInboundId = inboundMessageId
      ? normalizeRfcMessageId(inboundMessageId)
      : null;

    await db.insert(contactMessages).values({
      inquiryId: inquiry.id,
      direction: "inbound",
      body: `[Email] ${input.subject}\n\n${body}`,
      rfcMessageId: normalizedInboundId,
    });

    if (input.headers) {
      await recordInboundContactThreadHeaders(inquiry.id, input.headers);
    }

    await db.update(contactInquiries).set({ status: "open" }).where(eq(contactInquiries.id, inquiry.id));

    return { handled: true, kind: "contact" };
  }

  return { handled: false };
}
