import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/data/site";
import { getDb } from "@/lib/db";
import { contactReplyToAddress } from "@/lib/emailReplyRouting";
import { contactInquiries, contactMessages } from "@/lib/schema";

const SUBJECTS = ["Order help", "Group quote", "New style request", "Commercial use", "Other"] as const;

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? site.email;
  const from = process.env.EMAIL_FROM ?? `Anime Cabinet <orders@${site.domain}>`;

  if (!key) {
    return NextResponse.json({ error: "Contact form is temporarily unavailable." }, { status: 503 });
  }

  let body: {
    name: string;
    email: string;
    subject: string;
    message: string;
    orderId?: string;
    website?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, subject, message, orderId } = body;
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number]) && subject !== "Other") {
    // allow Other
  }

  let inquiryId: string | null = null;
  try {
    const db = getDb();
    const [inquiry] = await db
      .insert(contactInquiries)
      .values({
        name,
        email,
        subject,
        linkedOrderId: orderId?.trim() || null,
        status: "open",
      })
      .returning();

    inquiryId = inquiry.id;
    await db.insert(contactMessages).values({
      inquiryId: inquiry.id,
      direction: "inbound",
      body: message,
    });
  } catch {
    // Still notify by email if DB is unavailable
  }

  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact] ${subject} — ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ""}
      ${inquiryId ? `<p><a href="${site.url}/admin/messages/${inquiryId}">Open thread in admin</a></p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });

  if (inquiryId) {
    await resend.emails.send({
      from,
      to: email,
      replyTo: contactReplyToAddress(inquiryId),
      subject: `We received your message — ${subject}`,
      html: `<p>Hi ${name},</p>
             <p>Thanks for contacting ${site.name}. We received your message and will reply within 24 hours.</p>
             <p>You can reply to this email to add more detail — it goes to the same thread our team sees.</p>
             <p style="color:#777">— The ${site.name} team</p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
