import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/data/site";

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
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
