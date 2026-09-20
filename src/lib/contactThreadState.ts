import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  appendReferenceChain,
  contactAckSubject,
  headerValue,
  normalizeRfcMessageId,
} from "@/lib/emailThreading";
import { contactInquiries } from "@/lib/schema";

export function defaultThreadSubject(inquirySubject: string): string {
  return contactAckSubject(inquirySubject);
}

export async function recordInboundContactThreadHeaders(
  inquiryId: string,
  headers: Record<string, string>
): Promise<void> {
  const rawMessageId = headerValue(headers, "Message-ID");
  if (!rawMessageId) return;

  const messageId = normalizeRfcMessageId(rawMessageId);
  const refsHeader = headerValue(headers, "References");
  const emailReferences = appendReferenceChain(refsHeader, messageId);

  const db = getDb();
  await db
    .update(contactInquiries)
    .set({
      lastRfcMessageId: messageId,
      emailReferences,
    })
    .where(eq(contactInquiries.id, inquiryId));
}

export async function recordOutboundContactThread(
  inquiryId: string,
  input: {
    threadSubject: string;
    outboundMessageId: string;
    priorReferences: string | null;
    priorLastId: string | null;
  }
): Promise<void> {
  const outbound = normalizeRfcMessageId(input.outboundMessageId);
  const emailReferences = appendReferenceChain(
    input.priorReferences ?? input.priorLastId,
    outbound
  );

  const db = getDb();
  await db
    .update(contactInquiries)
    .set({
      threadSubject: input.threadSubject,
      lastRfcMessageId: outbound,
      emailReferences,
    })
    .where(eq(contactInquiries.id, inquiryId));
}
