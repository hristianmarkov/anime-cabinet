"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { contactInquiries, contactMessages } from "@/lib/schema";
import { site } from "@/data/site";
import { contactReplyToAddress } from "@/lib/emailReplyRouting";

export async function closeInquiry(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const inquiryId = String(formData.get("inquiryId") ?? "");
  if (!inquiryId) return;

  const db = getDb();
  await db.update(contactInquiries).set({ status: "closed" }).where(eq(contactInquiries.id, inquiryId));

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${inquiryId}`);
  redirect(`/admin/messages/${inquiryId}`);
}

export async function sendInquiryReply(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!inquiryId || !body) return;

  const db = getDb();
  const [inquiry] = await db
    .select()
    .from(contactInquiries)
    .where(eq(contactInquiries.id, inquiryId))
    .limit(1);
  if (!inquiry) return;

  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `Anime Cabinet <orders@${site.domain}>`;

  if (key) {
    const resend = new Resend(key);
    await resend.emails.send({
      from,
      to: inquiry.email,
      replyTo: contactReplyToAddress(inquiry.id),
      subject: `Re: ${inquiry.subject}`,
      text: body,
    });
  }

  await db.insert(contactMessages).values({
    inquiryId,
    direction: "outbound",
    body,
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${inquiryId}`);
  redirect(`/admin/messages/${inquiryId}?sent=1`);
}

export async function logInboundMessage(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) return;
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!inquiryId || !body) return;

  const db = getDb();
  await db.insert(contactMessages).values({
    inquiryId,
    direction: "inbound",
    body,
  });

  await db.update(contactInquiries).set({ status: "open" }).where(eq(contactInquiries.id, inquiryId));

  revalidatePath(`/admin/messages/${inquiryId}`);
  redirect(`/admin/messages/${inquiryId}`);
}
