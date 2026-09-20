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
import { defaultThreadSubject, recordOutboundContactThread } from "@/lib/contactThreadState";
import {
  buildRfcMessageId,
  replyEmailSubject,
  threadReplyHeaders,
} from "@/lib/emailThreading";
import { generateContactReplyForInquiry } from "@/lib/generateContactReplyForInquiry";

export async function draftContactReplyForInquiry(inquiryId: string, adminNotes?: string) {
  if (!(await isAdminAuthenticated())) {
    return { ok: false as const, error: "Unauthorized. Log in again at /admin." };
  }

  const result = await generateContactReplyForInquiry(inquiryId, adminNotes);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }
  return { ok: true as const, draft: result.draft };
}

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

  const threadSubject = inquiry.threadSubject ?? defaultThreadSubject(inquiry.subject);
  const subject = replyEmailSubject(threadSubject);
  const outboundMessageId = buildRfcMessageId(`contact-out-${inquiryId}-${Date.now()}`);
  const replyHeaders = threadReplyHeaders(inquiry.lastRfcMessageId, inquiry.emailReferences);
  const headers = {
    ...replyHeaders,
    "Message-ID": outboundMessageId,
  };

  if (key) {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to: inquiry.email,
      replyTo: contactReplyToAddress(inquiry.id),
      subject,
      text: body,
      headers,
    });
    if (error) {
      console.error("sendInquiryReply:", error);
      redirect(`/admin/messages/${inquiryId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  await db.insert(contactMessages).values({
    inquiryId,
    direction: "outbound",
    body,
    rfcMessageId: outboundMessageId,
  });

  await recordOutboundContactThread(inquiryId, {
    threadSubject,
    outboundMessageId,
    priorReferences: inquiry.emailReferences,
    priorLastId: inquiry.lastRfcMessageId,
  });

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${inquiryId}`);
  redirect(`/admin/messages/${inquiryId}?sent=1`);
}
