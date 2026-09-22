import { NextResponse } from "next/server";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { site } from "@/data/site";
import { contactInquiries, contactMessages, orders } from "@/lib/schema";
import { defaultThreadSubject } from "@/lib/contactThreadState";
import { contactReplyToAddress } from "@/lib/emailReplyRouting";

export async function POST(request: Request) {
  let body: { trackToken?: string; message?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const trackToken = body.trackToken?.trim();
  const message = body.message?.trim();
  if (!trackToken || !message || message.length < 5 || message.length > 5000) {
    return NextResponse.json({ error: "Please enter a message (at least 5 characters)." }, { status: 400 });
  }

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.trackToken, trackToken)).limit(1);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const name = body.name?.trim() || order.email.split("@")[0] || "Customer";
  const subject = `Order help — ${order.styleName}`;

  const [existingInquiry] = await db
    .select()
    .from(contactInquiries)
    .where(eq(contactInquiries.linkedOrderId, order.id))
    .limit(1);
  const [createdInquiry] = existingInquiry ? [] : await db.insert(contactInquiries).values({
      name,
      email: order.email,
      subject,
      threadSubject: defaultThreadSubject(subject),
      linkedOrderId: order.id,
      status: "open",
    }).returning();
  const inquiry = existingInquiry ?? createdInquiry;
  if (!inquiry) return NextResponse.json({ error: "Could not open the order conversation." }, { status: 500 });
  if (existingInquiry?.status === "closed") {
    await db.update(contactInquiries).set({ status: "open" }).where(eq(contactInquiries.id, inquiry.id));
  }

  await db.insert(contactMessages).values({
    inquiryId: inquiry.id,
    direction: "inbound",
    body: message,
  });

  const key = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? site.email;
  const from = process.env.EMAIL_FROM ?? `Anime Cabinet <orders@${site.domain}>`;

  if (key) {
    const resend = new Resend(key);
    await resend.emails.send({
      from,
      to: adminEmail,
      replyTo: contactReplyToAddress(inquiry.id),
      subject: `[Track page] ${subject}`,
      html: `<p><strong>From:</strong> ${name} (${order.email})</p>
             <p><strong>Order:</strong> ${order.id}</p>
             <p>${message.replace(/\n/g, "<br>")}</p>
             <p><a href="${site.url}/admin/messages/${inquiry.id}">Open in admin</a></p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
